"""CRUD operations for Photo model"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.photo import Photo
from app.schemas.common import PaginationSortSearchSchema
from app.schemas.photo import PhotoCreate


def create(db: Session, photo_data: PhotoCreate) -> Photo:
    """Create a new photo"""
    db_photo = Photo(
        project_id=photo_data.project_id,
        filename=photo_data.filename,
    )
    db.add(db_photo)
    return db_photo


def get_by_id(db: Session, photo_id: UUID) -> Optional[Photo]:
    """Get photo by ID"""
    return db.get(Photo, photo_id)


def get_by_project_and_filename(
    db: Session,
    project_id: UUID,
    filename: str,
) -> Optional[Photo]:
    """Get photo by project ID and filename"""
    return db.query(Photo).filter(
        (Photo.project_id == project_id) & (Photo.filename == filename)
    ).first()


def exists_by_filename(
    db: Session,
    project_id: UUID,
    filename: str,
) -> bool:
    """Check if photo with filename exists in project"""
    return (
        db.query(Photo)
        .filter((Photo.project_id == project_id) & (Photo.filename == filename))
        .first()
        is not None
    )


def get_by_project(
    db: Session,
    project_id: UUID,
    pagination_params: PaginationSortSearchSchema,
    is_selected: Optional[bool] = None,
) -> List[Photo]:
    """Get all photos in a project with pagination and optional filtering"""
    query = db.query(Photo).filter(Photo.project_id == project_id)
    
    if is_selected is not None:
        query = query.filter(Photo.is_selected == is_selected)
    
    return query.offset(pagination_params.skip).limit(pagination_params.limit).all()


def count_by_project(db: Session, project_id: UUID, is_selected: Optional[bool] = None) -> int:
    """Count photos in a project with optional filtering"""
    query = db.query(Photo).filter(Photo.project_id == project_id)

    if is_selected is not None:
        query = query.filter(Photo.is_selected == is_selected)

    return query.count()


def get_selected_by_project(
    db: Session,
    project_id: UUID,
) -> List[Photo]:
    """Get all selected photos in a project"""
    return (
        db.query(Photo)
        .filter((Photo.project_id == project_id) & (Photo.is_selected == True))
        .all()
    )


def get_all_by_project(
    db: Session,
    project_id: UUID,
) -> List[Photo]:
    """Get all photos in a project (selected and not selected)"""
    return db.query(Photo).filter(Photo.project_id == project_id).all()

