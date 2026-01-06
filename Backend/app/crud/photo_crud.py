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
    return db.query(Photo).filter((Photo.project_id == project_id) & (Photo.filename == filename)).first()


def exists_by_filename(
    db: Session,
    project_id: UUID,
    filename: str,
) -> bool:
    """Check if photo with filename exists in project"""
    return db.query(Photo).filter((Photo.project_id == project_id) & (Photo.filename == filename)).first() is not None


def get_by_filename_with_variant(
    db: Session,
    project_id: UUID,
    filename: str,
) -> Optional[Photo]:
    """
    Validate and get photo by filename, handling variants with postfix.

    Naming Rule: <Name>.<ext> (original) or <Name>_<postfix>.<ext> (variant)

    Example: If IMG_1000_v2.JPG is provided and exists in DB:
    - Extract base name: IMG_1000
    - Return the Photo object for IMG_1000.JPG

    Args:
        db: Database session
        project_id: Project ID
        filename: Filename to validate (can be original or with postfix)

    Returns:
        Photo object for the base filename if found, else None
    """
    # First, try exact match
    exact_photo = get_by_project_and_filename(db, project_id, filename)
    if exact_photo:
        return exact_photo

    # If not found, extract base name and postfix
    # Naming pattern: <Name>_<postfix>.<ext>
    base_name, dot, ext = filename.rpartition(".")

    # Check if filename has postfix pattern (underscore followed by version/variant)
    if "_" in base_name:
        # Get the last underscore-separated part
        parts = base_name.rsplit("_", 1)
        potential_base = parts[0]

        # Try to find the base filename
        base_filename = f"{potential_base}{dot}{ext}" if dot else potential_base
        base_photo = get_by_project_and_filename(db, project_id, base_filename)

        if base_photo:
            return base_photo

    return None


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
    return db.query(Photo).filter((Photo.project_id == project_id) & (Photo.is_selected == True)).all()


def get_all_by_project(
    db: Session,
    project_id: UUID,
) -> List[Photo]:
    """Get all photos in a project (selected and not selected)"""
    return db.query(Photo).filter(Photo.project_id == project_id).all()
