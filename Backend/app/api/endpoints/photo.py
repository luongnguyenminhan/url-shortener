"""Photo API endpoints"""

import json
from io import BytesIO
from uuid import UUID
from zipfile import ZipFile

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from app.core.config import settings
from app.core.constant.messages import MessageConstants
from app.db import get_db
from app.models.user import User
<<<<<<< HEAD
from app.schemas.common import ApiResponse, PaginationSortSearchSchema, pagination_params_dep, create_pagination_meta
from app.schemas.photo import PhotoDetailResponse, PhotoListResponse, PhotoUploadRequest, PhotoSelectRequest, PhotoMetaResponse
=======
from app.schemas.common import (
    ApiResponse,
    PaginationSortSearchSchema,
    create_pagination_meta,
    pagination_params_dep,
)
from app.schemas.photo import PhotoDetailResponse, PhotoListResponse
>>>>>>> 81eae72 (Add photo download functionality with manifest and script generation)
from app.services import photo_service
from app.services.photo_download_service import (
    build_photo_download_scripts_response,
    build_photo_manifest,
    generate_csv_content,
)
from app.utils.auth import get_current_user

router = APIRouter(
    prefix=f"{settings.API_V1_STR}/photos",
    tags=["Photos"],
)


@router.post(
    "",
    response_model=ApiResponse[PhotoDetailResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload photo",
    description="Upload a JPEG photo to a project",
)
async def upload_photo(
    file: UploadFile = File(..., description="JPEG image file"),
    project_id: str = Form(..., description="Project ID to upload photo to"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[PhotoDetailResponse]:
    """Upload a JPEG photo to a project"""
    from uuid import UUID

    # Convert project_id string to UUID
    try:
        project_uuid = UUID(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project_id format",
        )

    photo_detail = await photo_service.upload_photo(
        db=db,
        user=current_user,
        project_id=project_uuid,
        file=file,
    )
    return ApiResponse(
        success=True,
        message=MessageConstants.PHOTO_UPLOADED,
        data=photo_detail,
    )


@router.get(
    "/{photo_id}",
    status_code=status.HTTP_200_OK,
    summary="Get photo",
    description="Get photo image with optional resizing",
)
async def get_photo(
    photo_id: UUID,
    w: int = Query(None, ge=1, le=2000, description="Width for resizing"),
    h: int = Query(None, ge=1, le=2000, description="Height for resizing"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get photo image as streaming response with optional resizing"""
    from fastapi.responses import StreamingResponse

    photo_response = await photo_service.get_photo_image(
        db=db,
        user=current_user,
        photo_id=photo_id,
        width=w,
        height=h,
    )

    if not photo_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PHOTO_NOT_FOUND,
        )

    # Return streaming response
    return StreamingResponse(
        photo_response["stream"],
        media_type=photo_response["content_type"],
        headers={"Content-Disposition": f"inline; filename={photo_response['filename']}"},
    )


@router.get(
    "/projects/{project_id}",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="List project photos",
    description="Get all photos in a project with pagination and optional filtering",
)
def list_project_photos(
    project_id: UUID,
    pagination_params: PaginationSortSearchSchema = Depends(pagination_params_dep),
    is_selected: bool = Query(None, description="Filter by selection status (true/false)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse:
    """Get all photos in a project with optional is_selected filter"""
    photos, total = photo_service.get_project_photos(
        db=db,
        user=current_user,
        project_id=project_id,
        pagination_params=pagination_params,
        is_selected=is_selected,
    )

    page = (pagination_params.skip // pagination_params.limit) + 1
    pagination_meta = create_pagination_meta(page, pagination_params.limit, total)

    return ApiResponse(
        success=True,
        message=MessageConstants.PHOTO_LIST_RETRIEVED,
        data=[PhotoListResponse.model_validate(photo) for photo in photos],
        meta=pagination_meta.model_dump(),
    )




@router.get(
    "/{photo_id}/meta",
    status_code=status.HTTP_200_OK,
    summary="Get photo meta (authenticated)",
    description="Get photo details with all comments - requires authentication",
)
def get_photo_meta(
    photo_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get photo with all comments metadata (authenticated user only)"""
    photo_meta = photo_service.get_photo_meta_by_id_user(
        db=db,
        user=current_user,
        photo_id=photo_id,
    )

    return ApiResponse(
        success=True,
        message="Photo meta retrieved successfully",
        data=photo_meta,
    )


@router.get(
    "/{project_id}/download-photos",
    summary="Download project photos manifest or scripts",
    description="Get manifest JSON+CSV or script templates for organizing photos locally",
    status_code=status.HTTP_200_OK,
)
async def download_photos(
    project_id: UUID,
    type: str = Query(
        "manifest",
        regex="^(manifest|scripts)$",
        description="Download type: manifest (JSON+CSV in ZIP) or scripts (shell templates)",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Download project photos as manifest or script templates.

    - **type=manifest**: Returns ZIP containing manifest.json and photos.csv
    - **type=scripts**: Returns JSON with PowerShell, Bash, and Zsh script templates
    """
    try:
        manifest = build_photo_manifest(db, project_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    if type == "manifest":
        csv_content = generate_csv_content(manifest)
        zip_buffer = BytesIO()

        with ZipFile(zip_buffer, "w") as zip_file:
            manifest_json = json.dumps(manifest.model_dump(mode="json"), indent=2, default=str)
            zip_file.writestr("manifest.json", manifest_json)
            zip_file.writestr("photos.csv", csv_content)

        zip_buffer.seek(0)
        return StreamingResponse(
            iter([zip_buffer.getvalue()]),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={manifest.project_title.replace(' ', '_')}_manifest.zip"},
        )

    elif type == "scripts":
        csv_url = f"/api/v1/photos/{project_id}/download-photos/csv"
        scripts_response = build_photo_download_scripts_response(manifest, csv_url)
        return ApiResponse(
            success=True,
            message="Script templates generated successfully",
            data=scripts_response,
        )


@router.get(
    "/{project_id}/download-photos/csv",
    summary="Download photos as CSV",
    description="Get selected photos with comments as CSV file",
    status_code=status.HTTP_200_OK,
)
async def download_photos_csv(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download selected photos with comments as CSV"""
    try:
        manifest = build_photo_manifest(db, project_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    csv_content = generate_csv_content(manifest)
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={manifest.project_title.replace(' ', '_')}_photos.csv"},
    )
