"""Service layer for Project operations"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import project_crud
from app.db.manager import DatabaseManager as db_manager
from app.models.project import Project, ProjectStatus
from app.models.user import User
from app.schemas.common import PaginationSortSearchSchema, create_pagination_meta
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.core.constant.messages import MessageConstants


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
    
    return ProjectResponse.model_validate(project)


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
    
    return {
        "projects": [ProjectResponse.model_validate(project) for project in projects],
        "meta": pagination_meta.model_dump(),
    }


def get_all_projects(
    db: Session,
    user: User,
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
        "projects": [ProjectResponse.model_validate(project) for project in projects],
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
        return ProjectResponse.model_validate(updated_project)
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
        return ProjectResponse.model_validate(updated_project)
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
        return ProjectResponse.model_validate(deleted_project)
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
    user: User,
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
    return [ProjectResponse.model_validate(project) for project in projects]


def cleanup_expired_projects(db: Session, user: User) -> int:
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
