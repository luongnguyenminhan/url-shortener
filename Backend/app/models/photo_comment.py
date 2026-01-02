"""PhotoComment model - Client comments on photos"""
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Index
from sqlmodel import Field, Relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.photo import Photo


class PhotoComment(BaseModel, table=True):
    """Photo comment model (clients only, photographer cannot comment)"""

    __tablename__ = "photo_comment"

    photo_id: UUID = Field(foreign_key="photo.id", nullable=False, index=True)
    author_type: str = Field(
        default="client",
        nullable=False,
        max_length=20,
        description="Fixed to client only",
    )
    content: str = Field(nullable=False, max_length=500)

    # Relationships
    photo: "Photo" = Relationship(back_populates="photo_comments")

    # Constraints
    __table_args__ = (
        Index("idx_photo_comment_photo_created", "photo_id", "created_at"),
    )

    class Config:
        """Pydantic config"""
        from_attributes = True
