"""Project API endpoints"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.config import settings
from app.core.constant.messages import MessageConstants
from app.db import get_db
from app.models.user import User
from app.schemas.common import (
    ApiResponse,
    PaginationSortSearchSchema,
    pagination_params_dep,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectCreateToken,
    ProjectResponse,
    ProjectStatusUpdate,
    ProjectUpdate,
    VerifyProjectToken,
)
from app.services import project_service
from app.utils.auth import get_current_user

router = APIRouter(prefix=f"{settings.API_V1_STR}/projects", tags=["Projects"])


@router.post(
    "",
    response_model=ApiResponse[ProjectResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create project",
    description="Create a new project",
)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ProjectResponse]:
    """Create a new project for authenticated user"""
    project = project_service.create_project(db, current_user, project_data)
    return ApiResponse(
        success=True,
        message=MessageConstants.PROJECT_CREATED,
        data=project,
    )


@router.get(
    "",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="List user projects",
    description="Get all projects owned by authenticated user",
)
def list_projects(
    pagination_params: PaginationSortSearchSchema = Depends(pagination_params_dep),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse:
    """Get all projects owned by authenticated user"""
    result = project_service.get_user_projects(db, current_user, pagination_params)
    return ApiResponse(
        success=True,
        message=MessageConstants.PROJECT_LIST_RETRIEVED,
        data=result["projects"],
        meta=result["meta"],
    )


@router.get(
    "/{project_id}",
    response_model=ApiResponse[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="Get project",
    description="Get a specific project by ID",
)
def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ProjectResponse]:
    """Get a specific project by ID"""
    project = project_service.get_project_by_id(db, current_user, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )
    return ApiResponse(
        success=True,
        message=MessageConstants.PROJECT_RETRIEVED,
        data=project,
    )


@router.put(
    "/{project_id}",
    response_model=ApiResponse[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="Update project",
    description="Update a specific project",
)
def update_project(
    project_id: UUID,
    update_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ProjectResponse]:
    """Update a specific project"""
    project = project_service.update_project(db, current_user, project_id, update_data)
    return ApiResponse(
        success=True,
        message=MessageConstants.PROJECT_UPDATED,
        data=project,
    )


@router.patch(
    "/{project_id}/status",
    response_model=ApiResponse[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="Update project status",
    description="Update the status of a project",
)
def update_project_status(
    project_id: UUID,
    status_update: ProjectStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ProjectResponse]:
    """Update the status of a project"""
    project = project_service.update_project_status(db, current_user, project_id, status_update.status)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )
    return ApiResponse(
        success=True,
        message=MessageConstants.PROJECT_STATUS_UPDATED,
        data=project,
    )


@router.delete(
    "/{project_id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete project",
    description="Delete a specific project",
)
def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """Delete a specific project"""
    success = project_service.delete_project(db, current_user, project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )
    return ApiResponse(
        success=True,
        message=MessageConstants.PROJECT_DELETED,
        data={"id": str(project_id)},
    )


@router.post(
    "/create-project-token",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_201_CREATED,
    summary="Create project token",
    description="Create a new token for a project",
)
def create_project_token(
    project_data: ProjectCreateToken,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """Create a new project token for authenticated user"""
    project_token = project_service.create_project_token(db, current_user, project_data)
    return ApiResponse(
        success=True,
        message=MessageConstants.PROJECT_TOKEN_CREATED,
        data=project_token,
    )


@router.post(
    "/verify-project-token",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Verify project token",
    description="Verify access using a project token",
)
def verify_project_token(
    project_token: VerifyProjectToken,
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """Verify project token access"""
    session_details = project_service.verify_project_token_access(db, project_token)
    return ApiResponse(
        success=True,
        message=MessageConstants.PROJECT_TOKEN_VERIFIED,
        data=session_details,
    )


@router.get(
    "/active-project-token/{project_id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Get active project token",
    description="Get the active token for a specific project",
)
def get_active_project_token(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """Get the active token for a specific project"""
    project_token = project_service.get_project_token(db, project_id, current_user)
    if not project_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active project token not found.",
        )
    return ApiResponse(
        success=True,
        message=MessageConstants.PROJECT_TOKEN_RETRIEVED,
        data=project_token,
    )
