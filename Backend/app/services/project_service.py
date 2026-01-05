"""Service layer for Project operations"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.constant.messages import MessageConstants
from app.crud import project_crud
from app.db.manager import DatabaseManager as db_manager
from app.models.project import ProjectStatus
from app.models.user import User
from app.schemas.common import PaginationSortSearchSchema, create_pagination_meta
from app.schemas.project import (
    OwnerInfo,
    ProjectCreate,
    ProjectCreateToken,
    ProjectResponse,
    ProjectUpdate,
    VerifyProjectToken,
)
from app.services import client_session_service


def create_project(
    db: Session,
    user: User,
    project_data: ProjectCreate,
) -> ProjectResponse:
    """
    Create a new project for user

    Args:
        db: Database session
        user: Authenticated user (owner)
        project_data: Project creation data (can include expired_days to auto-calculate expiration)

    Returns:
        ProjectResponse: Created project data
    """
    # Check project name exists
    existing_project = project_crud.get_by_title_and_owner(db, project_data.title, user.id)
    if existing_project:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=MessageConstants.PROJECT_ALREADY_EXISTS,
        )

    try:
        # Create project - CRUD layer will calculate expired_date from expired_days
        project = project_crud.create(db, project_data, user.id)
        db_manager.commit(db)
        return ProjectResponse.model_validate(project)
    except Exception as e:
        db_manager.rollback(db)
        raise e


def get_project_by_id(
    db: Session,
    user: User,
    project_id: UUID,
) -> Optional[ProjectResponse]:
    """
    Get project by ID with authorization check

    Args:
        db: Database session
        user: Authenticated user
        project_id: Project ID

    Returns:
        ProjectResponse: Project data if found and user is owner
    """
    project = project_crud.get_by_id(db, project_id)

    if not project:
        return None

    # Authorization check
    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_ACCESS_DENIED,
        )

    project_response = ProjectResponse.model_validate(project)
    project_response.images_count = len(project.photos) if project.photos else 0
    project_response.owner_info = OwnerInfo.model_validate(project.owner)
    return project_response


def get_user_projects(
    db: Session,
    user: User,
    pagination_params: PaginationSortSearchSchema,
    status: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Get all projects owned by user with pagination

    Args:
        db: Database session
        user: Authenticated user
        pagination_params: Pagination parameters
        status: Optional status filter

    Returns:
        Dict with projects list and pagination metadata
    """
    projects = project_crud.get_by_owner(db, user.id, pagination_params, status)
    total = project_crud.count_by_owner(db, user.id, status)

    page = (pagination_params.skip // pagination_params.limit) + 1
    pagination_meta = create_pagination_meta(page, pagination_params.limit, total)

    # Add images count for each project using relationship
    projects_with_counts = []
    for project in projects:
        project_response = ProjectResponse.model_validate(project)
        project_response.images_count = len(project.photos) if project.photos else 0
        project_response.owner_info = OwnerInfo.model_validate(project.owner)
        projects_with_counts.append(project_response)

    return {
        "projects": projects_with_counts,
        "meta": pagination_meta.model_dump(),
    }

# TODO: Add admin permission check if needed
def get_all_projects(
    db: Session,
    user: User, # type: ignore  # noqa: ARG001
    pagination_params: PaginationSortSearchSchema,
    status: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Get all projects (admin only) with pagination

    Args:
        db: Database session
        user: Authenticated user (should be admin)
        pagination_params: Pagination parameters
        status: Optional status filter

    Returns:
        Dict with projects list and pagination metadata
    """
    projects = project_crud.get_all(db, pagination_params, status)
    total = project_crud.count_all(db, status)

    page = (pagination_params.skip // pagination_params.limit) + 1
    pagination_meta = create_pagination_meta(page, pagination_params.limit, total)

    return {
        "projects": [ProjectResponse.model_validate(project).model_copy(update={"images_count": len(project.photos) if project.photos else 0, "owner_info": OwnerInfo.model_validate(project.owner)}) for project in projects],
        "meta": pagination_meta.model_dump(),
    }


def update_project(
    db: Session,
    user: User,
    project_id: UUID,
    update_data: ProjectUpdate,
) -> Optional[ProjectResponse]:
    """
    Update project with authorization check

    Args:
        db: Database session
        user: Authenticated user
        project_id: Project ID
        update_data: Update data

    Returns:
        ProjectResponse: Updated project data
    """
    project = project_crud.get_by_id(db, project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )

    # Authorization check
    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_DELETE_DENIED,
        )

    try:
        updated_project = project_crud.update(db, project_id, update_data)
        db_manager.commit(db)
        project_response = ProjectResponse.model_validate(updated_project)
        project_response.owner_info = OwnerInfo.model_validate(updated_project.owner)
        return project_response
    except Exception as e:
        db_manager.rollback(db)
        raise e


def update_project_status(
    db: Session,
    user: User,
    project_id: UUID,
    new_status: ProjectStatus,
) -> Optional[ProjectResponse]:
    """
    Update project status with authorization and validation

    Args:
        db: Database session
        user: Authenticated user
        project_id: Project ID
        new_status: New status value

    Returns:
        ProjectResponse: Updated project data
    """
    project = project_crud.get_by_id(db, project_id)

    if not project:
        return None

    # Authorization check
    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_UPDATE_DENIED,
        )

    try:
        updated_project = project_crud.update_status(db, project_id, new_status)
        db_manager.commit(db)
        project_response = ProjectResponse.model_validate(updated_project)
        project_response.owner_info = OwnerInfo.model_validate(updated_project.owner)
        return project_response
    except ValueError:
        db_manager.rollback(db)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=MessageConstants.INVALID_PROJECT_STATUS,
        )
    except Exception as e:
        db_manager.rollback(db)
        raise e


def delete_project(
    db: Session,
    user: User,
    project_id: UUID,
) -> bool:
    """
    Delete project with authorization check

    Args:
        db: Database session
        user: Authenticated user
        project_id: Project ID

    Returns:
        bool: True if deleted, False if not found
    """
    project = project_crud.get_by_id(db, project_id)

    if not project:
        return False

    # Authorization check
    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_DELETE_DENIED,
        )

    try:
        result = project_crud.delete(db, project_id)
        db_manager.commit(db)
        return result
    except Exception as e:
        db_manager.rollback(db)
        raise e


def soft_delete_project(
    db: Session,
    user: User,
    project_id: UUID,
) -> Optional[ProjectResponse]:
    """
    Soft delete project by setting status to completed

    Args:
        db: Database session
        user: Authenticated user
        project_id: Project ID

    Returns:
        ProjectResponse: Updated project data
    """
    project = project_crud.get_by_id(db, project_id)

    if not project:
        return None

    # Authorization check
    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_DELETE_DENIED,
        )
    try:
        deleted_project = project_crud.soft_delete(db, project_id)
        db_manager.commit(db)
        project_response = ProjectResponse.model_validate(deleted_project)
        project_response.owner_info = OwnerInfo.model_validate(deleted_project.owner)
        return project_response
    except Exception as e:
        db_manager.rollback(db)
        raise e


def count_user_projects(db: Session, user: User, status: Optional[str] = None) -> int:
    """
    Count projects owned by user

    Args:
        db: Database session
        user: Authenticated user
        status: Optional status filter

    Returns:
        int: Number of projects
    """
    return project_crud.count_by_owner(db, user.id, status)


def get_expired_projects_for_cleanup(
    db: Session,
    user: User, # type: ignore  # noqa: ARG001
) -> List[ProjectResponse]:
    """
    Get expired projects for cleanup (admin only)

    Args:
        db: Database session
        user: Authenticated user (should be admin)

    Returns:
        List[ProjectResponse]: Expired projects
    """
    # TODO: Add admin permission check if needed
    projects = project_crud.get_expired_projects(db)
    return [ProjectResponse.model_validate(project).model_copy(update={"owner_info": OwnerInfo.model_validate(project.owner)}) for project in projects]


def cleanup_expired_projects(db: Session, user: User) -> int:  # noqa: ARG001
    """
    Delete all expired projects (admin only)

    Args:
        db: Database session
        user: Authenticated user (should be admin)

    Returns:
        int: Number of projects deleted
    """
    # TODO: Add admin permission check if needed
    expired_projects = project_crud.get_expired_projects(db)
    count = 0

    try:
        for project in expired_projects:
            if project_crud.delete(db, project.id):
                count += 1
        db_manager.commit(db)
        return count
    except Exception as e:
        db_manager.rollback(db)
        raise e


def create_project_token(
    db: Session,
    user: User,
    project_data: ProjectCreateToken,
) -> Dict[str, Any]:
    """
    Create access token for a project with authorization check

    Args:
        db: Database session
        user: Authenticated user (must be project owner)
        project_id: Project ID
        password: Password for the token (defaults to "123456")
        expires_in_days: Optional number of days until token expiration

    Returns:
        Dict with token and session details
    """
    project_id = project_data.project_id
    password = "123456"
    project = project_crud.get_by_id(db, project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )

    # Authorization check
    if project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_ACCESS_DENIED,
        )

    try:
        client_session = client_session_service.create_client_session(
            db=db,
            project=project,
            password=password,
            expires_in_days=project_data.expires_in_days,
        )

        # Create full project response
        project_response = ProjectResponse.model_validate(project)
        project_response.images_count = len(project.photos) if project.photos else 0
        project_response.owner_info = OwnerInfo.model_validate(project.owner)

        return {
            "token": client_session.token,
            "project_id": str(client_session.project_id),
            "expires_at": client_session.expires_at,
            "is_active": client_session.is_active,
            "has_password": client_session.has_password(),
            "project": project_response,
        }
    except Exception as e:
        db_manager.rollback(db)
        raise e


def verify_project_token_access(
    db: Session,
    project_token: VerifyProjectToken,
) -> Optional[Dict[str, Any]]:
    """
    Verify access to a project via token and optional password

    Args:
        db: Database session
        token: Project access token
        password: Optional password for the token

    Returns:
        Dict with session details if access granted, else None
    """
    client_session = client_session_service.verify_session_access(db, project_token.token, project_token.password)

    if not client_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=MessageConstants.INVALID_PROJECT_TOKEN,
        )

    # Get project to include owner info
    project = project_crud.get_by_id(db, client_session.project_id)

    # Create full project response
    project_response = None
    if project:
        project_response = ProjectResponse.model_validate(project)
        project_response.images_count = len(project.photos) if project.photos else 0
        project_response.owner_info = OwnerInfo.model_validate(project.owner)

    return {
        "token": client_session.token,
        "project_id": str(client_session.project_id),
        "expires_at": client_session.expires_at,
        "is_active": client_session.is_active,
        "has_password": client_session.has_password(),
        "count_accesses": client_session.count_accesses,
        "project": project_response,
    }


def get_project_token(
    db: Session,
    project_id: UUID,
    current_user: User,
) -> Optional[Dict[str, Any]]:
    """
    Get active project token details by project ID

    Args:
        db: Database session
        project_id: Project ID

    Returns:
        Dict with session details if found, else None
    """
    project = project_crud.get_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MessageConstants.PROJECT_NOT_FOUND,
        )

    # Authorization check
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MessageConstants.PROJECT_ACCESS_DENIED,
        )

    client_session = client_session_service.get_active_project_client_sessions(db, project_id)

    if not client_session:
        return None

    # Create full project response
    project_response = ProjectResponse.model_validate(project)
    project_response.images_count = len(project.photos) if project.photos else 0
    project_response.owner_info = OwnerInfo.model_validate(project.owner)

    return {
        "token": client_session.token,
        "project_id": str(client_session.project_id),
        "expires_at": client_session.expires_at,
        "is_active": client_session.is_active,
        "has_password": client_session.has_password(),
        "count_accesses": client_session.count_accesses,
        "owner_info": OwnerInfo.model_validate(project.owner),
        "project": project_response,
    }
