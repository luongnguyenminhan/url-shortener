"""Guest Photo API endpoints"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from app.core.config import settings
from app.db import get_db
from app.schemas.common import (
    ApiResponse,
    PaginationSortSearchSchema,
    create_pagination_meta,
    pagination_params_dep,
)
from app.models.photo_version import VersionType
from app.schemas.photo import PhotoMetaResponse, PhotoSelectRequest
from app.services import photo_guest_service

router = APIRouter(
    prefix=f"{settings.API_V1_STR}/photos-guest",
    tags=["Photos-Guest"],
)


@router.get(
    "/{photo_id}",
    status_code=status.HTTP_200_OK,
    summary="Get photo image (guest)",
    description="Get photo image with optional resizing - requires project token",
)
async def get_photo_image(
    photo_id: UUID,
    project_token: str = Query(..., description="Project access token"),
    w: int = Query(None, ge=1, le=2000, description="Width for resizing"),
    h: int = Query(None, ge=1, le=2000, description="Height for resizing"),
    is_thumbnail: bool = Query(False, description="Get thumbnail version of the photo"),
    version: VersionType = Query(VersionType.ORIGINAL, description="Photo version to retrieve"),
    db: Session = Depends(get_db),
):
    """Get photo image as streaming response with optional resizing using project token"""
    photo_response = await photo_guest_service.get_photo_image_guest(
        db=db,
        photo_id=photo_id,
        project_token=project_token,
        width=w,
        height=h,
        is_thumbnail=is_thumbnail,
        version=version,
    )

    if not photo_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found",
        )

    # Return streaming response
    return StreamingResponse(
        photo_response["stream"],
        media_type=photo_response["content_type"],
        headers={"Content-Disposition": f"inline; filename={photo_response['filename']}"},
    )


@router.get(
    "",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="List project photos (guest)",
    description="Get all photos in a project with pagination and optional filtering - requires project token",
)
def list_project_photos(
    project_token: str = Query(..., description="Project access token"),
    pagination_params: PaginationSortSearchSchema = Depends(pagination_params_dep),
    is_selected: bool = Query(None, description="Filter by selection status (true/false)"),
    db: Session = Depends(get_db),
) -> ApiResponse:
    """Get all photos in a project with optional is_selected filter using project token"""
    photos, total = photo_guest_service.get_project_photos_guest(
        db=db,
        project_token=project_token,
        pagination_params=pagination_params,
        is_selected=is_selected,
    )

    page = (pagination_params.skip // pagination_params.limit) + 1
    pagination_meta = create_pagination_meta(page, pagination_params.limit, total)

    return ApiResponse(
        success=True,
        message="Photo list retrieved successfully",
        data=[
            PhotoListResponse.model_validate(item["photo"]).model_copy(update={"edited_version": item["edited_version"]})
            for item in photos
        ],
        meta=pagination_meta.model_dump(),
    )


@router.get(
    "/{photo_id}/meta",
    response_model=ApiResponse[PhotoMetaResponse],
    status_code=status.HTTP_200_OK,
    summary="Get photo meta (guest)",
    description="Get photo details with all comments - requires project token",
)
def get_photo_meta(
    photo_id: UUID,
    project_token: str = Query(..., description="Project access token"),
    db: Session = Depends(get_db),
) -> ApiResponse[PhotoMetaResponse]:
    """Get photo with all comments metadata using project token"""
    photo_meta = photo_guest_service.get_photo_meta_by_id_guest(
        db=db,
        photo_id=photo_id,
        project_token=project_token,
    )
    return ApiResponse(
        success=True,
        message="Photo metadata retrieved successfully",
        data=PhotoMetaResponse.model_validate(photo_meta),
    )


@router.post(
    "/{photo_id}/select",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Select photo (guest)",
    description="Select a photo and optionally add a comment using project token",
)
def select_photo(
    photo_id: UUID,
    request: PhotoSelectRequest,
    db: Session = Depends(get_db),
) -> ApiResponse:
    """Select a photo with optional comment using project token"""
    success = photo_guest_service.select_photo(
        db=db,
        photo_id=photo_id,
        project_token=request.project_token,
        comment=request.comment,
    )

    return ApiResponse(
        success=success,
        message="Photo selected successfully" if success else "Failed to select photo",
    )


@router.post(
    "/{photo_id}/unselect",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Unselect photo (guest)",
    description="Unselect a photo and optionally add a comment using project token",
)
def unselect_photo(
    photo_id: UUID,
    request: PhotoSelectRequest,
    db: Session = Depends(get_db),
) -> ApiResponse:
    """Unselect a photo with optional comment using project token"""
    success = photo_guest_service.unselect_photo(
        db=db,
        photo_id=photo_id,
        project_token=request.project_token,
        comment=request.comment,
    )

    return ApiResponse(
        success=success,
        message="Photo unselected successfully" if success else "Failed to unselect photo",
    )
