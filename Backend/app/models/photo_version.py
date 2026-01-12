"""PhotoVersion model - Original and edited versions"""

from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Index, UniqueConstraint
from sqlmodel import Field, Relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.photo import Photo


class VersionType(str, Enum):
    """Photo version type enum"""

    ORIGINAL = "original"
    EDITED = "edited"


class PhotoVersion(BaseModel, table=True):
    """Photo version model (original and edited)"""

    __tablename__ = "photo_version"

    photo_id: UUID = Field(foreign_key="photo.id", nullable=False, index=True)
    version_type: str = Field(nullable=False, max_length=20)
    image_url: str = Field(nullable=False, max_length=512)

    # Relationships
    photo: "Photo" = Relationship(back_populates="photo_versions")

    # Constraints
    __table_args__ = (
        UniqueConstraint("photo_id", "version_type", name="uq_photo_version_photo_type"),
        Index("idx_photo_version_photo_type", "photo_id", "version_type"),
    )

    class Config:
        """Pydantic config"""

        from_attributes = True

    def validate_version_type(self, version_type: str) -> bool:
        """Validate version type"""
        return version_type in [vt.value for vt in VersionType]
