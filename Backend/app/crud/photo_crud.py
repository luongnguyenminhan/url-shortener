"""CRUD operations for Photo model"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.photo import Photo
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
    skip: int = 0,
    limit: int = 100,
) -> List[Photo]:
    """Get all photos in a project with pagination"""
    return (
        db.query(Photo)
        .filter(Photo.project_id == project_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_by_project(db: Session, project_id: UUID) -> int:
    """Count photos in a project"""
    return db.query(Photo).filter(Photo.project_id == project_id).count()
