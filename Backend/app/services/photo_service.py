"""Service layer for Photo operations"""

from typing import Optional
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.constant.messages import MessageConstants
from app.crud import photo_comment_crud, photo_crud, project_crud
from app.models.photo import Photo
from app.models.photo_version import PhotoVersion, VersionType
from app.models.user import User
from app.schemas.common import PaginationSortSearchSchema
from app.schemas.photo import PhotoCommentResponse, PhotoCreate, PhotoDetailResponse, PhotoMetaResponse
from app.utils.image_utils import resize_image
from app.utils.logging import logger
from app.utils.minio import download_file_from_minio, upload_bytes_to_minio

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"image/jpeg"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg"}


def validate_file(file: UploadFile) -> None:
    """
    Validate uploaded file.

    Args:
        file: UploadFile to validate

    Raises:
        HTTPException: If file is invalid
    """
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=MessageConstants.INVALID_FILE_TYPE,
        )

    # Validate file extension
    filename_lower = file.filename.lower() if file.filename else ""
    has_valid_extension = any(filename_lower.endswith(ext) for ext in ALLOWED_EXTENSIONS)
    if not has_valid_extension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=MessageConstants.INVALID_FILE_TYPE,
        )

    # Validate file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=MessageConstants.FILE_TOO_LARGE,
        )


async def upload_photo(
    db: Session,
    user: User,
    project_id: UUID,
    file: UploadFile,
) -> PhotoDetailResponse:
    """
    Upload a photo to a project.

    Args:
        db: Database session
        user: Authenticated user (must be project owner)
        project_id: Project ID
        file: JPEG file to upload

    Returns:
        PhotoDetailResponse with photo and version details

    Raises:
        HTTPException: On validation, permission, or upload errors
    """
    from app.crud import project_crud

    # 1. Validate file
    validate_file(file)

    # 2. Check project exists and user is owner
    project = project_crud.get_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )

    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_PERMISSION_DENIED,
        )

    # 3. Check filename uniqueness
    if photo_crud.exists_by_filename(db, project_id, file.filename):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=MessageConstants.DUPLICATE_FILENAME,
        )

    try:
        # 4. Create Photo entity
        photo_data = PhotoCreate(
            filename=file.filename,
            project_id=project_id,
        )
        photo = photo_crud.create(db, photo_data)
        db.flush()  # Get the photo.id without committing

        # 5. Upload file to MinIO
        file_bytes = await file.read()
        minio_path = f"{project_id}/original/{file.filename}"

        success = upload_bytes_to_minio(
            file_bytes=file_bytes,
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=minio_path,
            content_type=file.content_type,
        )

        if not success:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=MessageConstants.MINIO_UPLOAD_ERROR,
            )

        # 6. Create PhotoVersion for original
        image_url = f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET_NAME}/{minio_path}"
        photo_version = PhotoVersion(
            photo_id=photo.id,
            version_type=VersionType.ORIGINAL.value,
            image_url=image_url,
        )
        db.add(photo_version)

        # 7. Commit transaction
        db.commit()
        db.refresh(photo)
        db.refresh(photo_version)

        # 8. Return response
        return PhotoDetailResponse(
            photo=photo,
            version=photo_version,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception(f"Error uploading photo to project {project_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=MessageConstants.MINIO_UPLOAD_ERROR,
        )


def get_photo_by_id(
    db: Session,
    user: User,
    project_id: UUID,
    photo_id: UUID,
) -> Optional[PhotoDetailResponse]:
    """
    Get photo details with authorization check.

    Args:
        db: Database session
        user: Authenticated user
        project_id: Project ID
        photo_id: Photo ID

    Returns:
        PhotoDetailResponse or None if not found

    Raises:
        HTTPException: If user is not project owner
    """
    from app.crud import project_crud

    # Check project exists and user is owner
    project = project_crud.get_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )

    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_PERMISSION_DENIED,
        )

    # Get photo
    photo = photo_crud.get_by_id(db, photo_id)
    if not photo or photo.project_id != project_id:
        return None

    # Get original version
    photo_version = db.query(PhotoVersion).filter((PhotoVersion.photo_id == photo_id) & (PhotoVersion.version_type == VersionType.ORIGINAL.value)).first()

    if not photo_version:
        return None

    return PhotoDetailResponse(
        photo=photo,
        version=photo_version,
    )


def get_project_photos(
    db: Session,
    user: User,
    project_id: UUID,
    pagination_params: PaginationSortSearchSchema,
    is_selected: Optional[bool] = None,
) -> tuple[list[Photo], int]:
    """
    Get all photos in a project with authorization check and optional filtering.

    Args:
        db: Database session
        user: Authenticated user
        project_id: Project ID
        pagination_params: Pagination parameters
        is_selected: Optional filter by selection status (True/False/None)

    Returns:
        Tuple of (photos list, total count)

    Raises:
        HTTPException: If user is not project owner
    """
    from app.crud import project_crud

    # Check project exists and user is owner
    project = project_crud.get_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )

    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_PERMISSION_DENIED,
        )

    # Get photos with optional filtering
    photos = photo_crud.get_by_project(db, project_id, pagination_params, is_selected=is_selected)
    total = photo_crud.count_by_project(db, project_id, is_selected=is_selected)

    return photos, total


async def get_photo_image(
    db: Session,
    user: User,
    photo_id: UUID,
    width: Optional[int] = None,
    height: Optional[int] = None,
) -> Optional[dict]:
    """
    Get photo image as streaming bytes with optional resizing.

    Args:
        db: Database session
        user: Authenticated user
        photo_id: Photo ID
        width: Optional width for resizing
        height: Optional height for resizing (maintains aspect ratio)

    Returns:
        Dict with stream, content_type, filename or None if not found

    Raises:
        HTTPException: If user doesn't have access to photo
    """
    from io import BytesIO
    # Check photo exists and user has access
    photo = photo_crud.get_by_id(db, photo_id)
    if not photo:
        return None
    project = project_crud.get_by_id(db, photo.project_id)
    if not project or project.owner_id != user.id:
        return None
    # Get original version
    photo_version = db.query(PhotoVersion).filter((PhotoVersion.photo_id == photo_id) & (PhotoVersion.version_type == VersionType.ORIGINAL.value)).first()

    if not photo_version:
        return None

    try:
        # Download from MinIO
        minio_path = f"{photo.project_id}/original/{photo.filename}"
        file_bytes = download_file_from_minio(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=minio_path,
        )

        if not file_bytes:
            return None

        # Resize if parameters provided
        file_bytes = resize_image(file_bytes, width, height, photo_id)

        # Create stream
        stream = BytesIO(file_bytes)

        return {
            "stream": stream,
            "content_type": "image/jpeg",
            "filename": photo.filename,
        }

    except Exception as e:
        logger.exception(f"Error retrieving photo image {photo_id}: {e}")
        return None


def get_photo_meta_by_id_user(
    db: Session,
    user: User,
    photo_id: UUID,
) -> PhotoMetaResponse:
    """
    Get photo details with all comments (authenticated user).

    Args:
        db: Database session
        user: Authenticated user
        photo_id: Photo ID

    Returns:
        PhotoMetaResponse with photo and all comments

    Raises:
        HTTPException: If photo not found or user is not project owner
    """

    # 1. Get photo
    photo = photo_crud.get_by_id(db, photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PHOTO_NOT_FOUND,
        )

    # 2. Get project and verify user is owner
    project = project_crud.get_by_id(db, photo.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )

    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_PERMISSION_DENIED,
        )

    # 3. Get comments
    comments = photo_comment_crud.get_by_photo(db, photo_id, skip=0, limit=10000)

    # 4. Convert to response model
    photo_meta = PhotoMetaResponse.model_validate(photo)
    photo_meta.comments = [PhotoCommentResponse.model_validate(comment) for comment in comments]

    return photo_meta
