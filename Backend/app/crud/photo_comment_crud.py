"""CRUD operations for PhotoComment model"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.photo_comment import PhotoComment


def create(db: Session, photo_id: UUID, content: str, author_type: str = "client") -> PhotoComment:
    """Create a new photo comment"""
    db_comment = PhotoComment(
        photo_id=photo_id,
        content=content,
        author_type=author_type,
    )
    db.add(db_comment)
    return db_comment


def get_by_id(db: Session, comment_id: UUID) -> Optional[PhotoComment]:
    """Get photo comment by ID"""
    return db.get(PhotoComment, comment_id)


def get_by_photo(
    db: Session,
    photo_id: UUID,
    skip: int = 0,
    limit: int = 100,
) -> List[PhotoComment]:
    """Get all comments for a photo with pagination"""
    return db.query(PhotoComment).filter(PhotoComment.photo_id == photo_id).order_by(PhotoComment.created_at.desc()).offset(skip).limit(limit).all()


def count_by_photo(db: Session, photo_id: UUID) -> int:
    """Count comments for a photo"""
    return db.query(PhotoComment).filter(PhotoComment.photo_id == photo_id).count()


def delete(db: Session, comment_id: UUID) -> bool:
    """Delete a photo comment"""
    db_comment = db.get(PhotoComment, comment_id)
    if not db_comment:
        return False

    db.delete(db_comment)
    return True
