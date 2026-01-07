"""Service layer for Guest Photo operations"""

from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.constant.messages import MessageConstants
from app.crud import client_session_crud, photo_comment_crud, photo_crud, photo_version_crud
from app.models.photo import PhotoStatus
from app.models.photo_version import PhotoVersion, VersionType
from app.schemas.common import PaginationSortSearchSchema
from app.schemas.photo import PhotoCommentResponse, PhotoListResponse, PhotoMetaResponse
from app.services.photo_service import _download_and_process_photo_image
from app.utils.logging import logger


async def get_photo_image_guest(
    db: Session,
    photo_id: UUID,
    project_token: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    is_thumbnail: bool = False,
    version: VersionType = VersionType.ORIGINAL,
) -> Optional[dict]:
    """
    Get photo image as streaming bytes with optional resizing (guest access).

    Args:
        db: Database session
        photo_id: Photo ID
        project_token: Project access token for authorization
        width: Optional width for resizing
        height: Optional height for resizing (maintains aspect ratio)
        is_thumbnail: Flag to indicate if this is a thumbnail request (returns WebP format)
        version: Photo version to retrieve (VersionType.ORIGINAL or VersionType.EDITED)

    Returns:
        Dict with stream, content_type, filename or None if not found

    Raises:
        HTTPException: If token is invalid or photo not found
    """

    # 1. Verify project token
    client_session = client_session_crud.get_by_token(db, project_token)
    if not client_session or client_session.is_expired():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=MessageConstants.INVALID_PROJECT_TOKEN,
        )

    # 2. Get photo and verify it belongs to project
    photo = photo_crud.get_by_id(db, photo_id)
    if not photo or photo.project_id != client_session.project_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PHOTO_NOT_FOUND,
        )

    # 3. Get photo image (reuse logic from photo_service)

    photo_version = photo_version_crud.get_by_photo_and_version_type(db, photo_id, version)

    if not photo_version:
        return None

    return await _download_and_process_photo_image(
        photo=photo,
        version=version,
        width=width,
        height=height,
        is_thumbnail=is_thumbnail,
    )


def select_photo(
    db: Session,
    photo_id: UUID,
    project_token: str,
    comment: Optional[str] = None,
) -> bool:
    """
    Select a photo and optionally add a comment using project token.

    Args:
        db: Database session
        photo_id: Photo ID to select
        project_token: Project access token for authorization
        comment: Optional comment when selecting photo

    Returns:
        bool: True if photo selected successfully, False otherwise

    Raises:
        HTTPException: If token is invalid or photo not found
    """

    # 1. Verify project token access
    client_session = client_session_crud.get_by_token(db, project_token)
    if not client_session or client_session.is_expired():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=MessageConstants.INVALID_PROJECT_TOKEN,
        )

    # 2. Get photo and validate it belongs to project
    photo = photo_crud.get_by_id(db, photo_id)
    if not photo or photo.project_id != client_session.project_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PHOTO_NOT_FOUND,
        )

    try:
        # 3. Update photo selection status
        photo.is_selected = True
        db.add(photo)
        db.flush()

        # 4. Create comment if provided
        if comment:
            photo_comment_crud.create(
                db=db,
                photo_id=photo_id,
                content=comment,
                author_type="client",
            )
            db.flush()

        # 5. Commit transaction
        db.commit()

        return True

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception(f"Error selecting photo {photo_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=MessageConstants.INTERNAL_SERVER_ERROR,
        )


def unselect_photo(
    db: Session,
    photo_id: UUID,
    project_token: str,
    comment: Optional[str] = None,
) -> bool:
    """
    Unselect a photo and optionally add a comment using project token.

    Args:
        db: Database session
        photo_id: Photo ID to unselect
        project_token: Project access token for authorization
        comment: Optional comment when unselecting photo

    Returns:
        bool: True if photo unselected successfully, False otherwise

    Raises:
        HTTPException: If token is invalid or photo not found
    """

    # 1. Verify project token access
    client_session = client_session_crud.get_by_token(db, project_token)
    if not client_session or client_session.is_expired():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=MessageConstants.INVALID_PROJECT_TOKEN,
        )

    # 2. Get photo and validate it belongs to project
    photo = photo_crud.get_by_id(db, photo_id)
    if not photo or photo.project_id != client_session.project_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PHOTO_NOT_FOUND,
        )

    try:
        # 3. Update photo selection status
        photo.is_selected = False
        db.add(photo)
        db.flush()

        # 4. Create comment if provided
        if comment:
            photo_comment_crud.create(
                db=db,
                photo_id=photo_id,
                content=comment,
                author_type="client",
            )
            db.flush()

        # 5. Commit transaction
        db.commit()

        return True

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception(f"Error unselecting photo {photo_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=MessageConstants.INTERNAL_SERVER_ERROR,
        )


def get_photo_by_id_guest(
    db: Session,
    photo_id: UUID,
    project_token: str,
) -> Optional[PhotoListResponse]:
    """
    Get photo details with authorization check via project token.

    Args:
        db: Database session
        photo_id: Photo ID
        project_token: Project access token for authorization

    Returns:
        PhotoListResponse or None if not found

    Raises:
        HTTPException: If token is invalid or photo not found
    """
    # 1. Verify project token
    client_session = client_session_crud.get_by_token(db, project_token)
    if not client_session or client_session.is_expired():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=MessageConstants.INVALID_PROJECT_TOKEN,
        )

    # 2. Get photo and verify it belongs to project
    photo = photo_crud.get_by_id(db, photo_id)
    if not photo or photo.project_id != client_session.project_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PHOTO_NOT_FOUND,
        )

    return PhotoListResponse.model_validate(photo)


def get_project_photos_guest(
    db: Session,
    project_token: str,
    pagination_params: PaginationSortSearchSchema,
    is_selected: Optional[bool] = None,
    status: Optional[PhotoStatus] = None,
) -> tuple[list[dict], int]:
    """
    Get all photos in a project with authorization check via project token and optional filtering.

    Args:
        db: Database session
        project_token: Project access token for authorization
        pagination_params: Pagination parameters
        is_selected: Optional filter by selection status (True/False/None)

    Returns:
        Tuple of (photos list with edited_version flag, total count)

    Raises:
        HTTPException: If token is invalid
    """
    # 1. Verify project token
    client_session = client_session_crud.get_by_token(db, project_token)
    if not client_session or client_session.is_expired():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=MessageConstants.INVALID_PROJECT_TOKEN,
        )

    # 2. Get photos with optional filtering
    photos = photo_crud.get_by_project(
        db,
        client_session.project_id,
        pagination_params,
        status=status,
    )
    total = photo_crud.count_by_project(
        db,
        client_session.project_id,
        status=status,
    )

    # Add edited_version flag to each photo
    photo_list = []
    for photo in photos:
        has_edited = db.query(PhotoVersion).filter(PhotoVersion.photo_id == photo.id, PhotoVersion.version_type != VersionType.ORIGINAL.value).first() is not None
        photo_list.append({"photo": photo, "edited_version": has_edited})

    return photo_list, total


def get_photo_meta_by_id_guest(
    db: Session,
    photo_id: UUID,
    project_token: str,
) -> PhotoMetaResponse:
    """
    Get photo details with all comments (guest access via project token).

    Args:
        db: Database session
        photo_id: Photo ID
        project_token: Project access token for authorization

    Returns:
        PhotoMetaResponse with photo and all comments

    Raises:
        HTTPException: If token is invalid or photo not found
    """

    # 1. Verify project token
    client_session = client_session_crud.get_by_token(db, project_token)
    if not client_session or client_session.is_expired():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=MessageConstants.INVALID_PROJECT_TOKEN,
        )

    # 2. Get photo and verify it belongs to project
    photo = photo_crud.get_by_id(db, photo_id)
    if not photo or photo.project_id != client_session.project_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PHOTO_NOT_FOUND,
        )

    # 3. Get comments
    comments = photo_comment_crud.get_by_photo(db, photo_id, skip=0, limit=10000)

    # 4. Convert to response model
    photo_meta = PhotoMetaResponse.model_validate(photo)
    photo_meta.comments = [PhotoCommentResponse.model_validate(comment) for comment in comments]

    return photo_meta
