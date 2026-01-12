"""CRUD operations for PhotoVersion"""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.photo_version import PhotoVersion, VersionType


def create_photo_version(
    db: Session,
    photo_id: UUID,
    version_type: VersionType,
    image_url: str,
) -> PhotoVersion:
    """Create a new PhotoVersion"""
    existed_photo_version = get_by_photo_and_version_type(
        db, photo_id, version_type
    )
    if existed_photo_version:
        return existed_photo_version
    db_photo_version = PhotoVersion(
        photo_id=photo_id,
        version_type=version_type.value,
        image_url=image_url,
    )
    db.add(db_photo_version)
    return db_photo_version

def get_by_photo_and_version_type(
    db: Session,
    photo_id: UUID,
    version_type: VersionType,
) -> Optional[PhotoVersion]:
    """
    Get PhotoVersion by photo_id and version_type.

    Args:
        db: Database session
        photo_id: Photo ID
        version_type: Version type enum

    Returns:
        PhotoVersion or None if not found
    """
    return db.query(PhotoVersion).filter(PhotoVersion.photo_id == photo_id, PhotoVersion.version_type == version_type.value).first()
