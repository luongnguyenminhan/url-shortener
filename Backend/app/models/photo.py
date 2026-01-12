"""Photo model - Logical photo entity (filename is contract)"""

from enum import Enum
from typing import TYPE_CHECKING, List
from uuid import UUID

from sqlalchemy import Index, UniqueConstraint
from sqlmodel import Field, Relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.photo_comment import PhotoComment
    from app.models.photo_version import PhotoVersion
    from app.models.project import Project


class PhotoStatus(str, Enum):
    """Photo status enumeration"""
    ORIGIN = "origin"
    SELECTED = "selected"
    EDITED = "edited"


class Photo(BaseModel, table=True):
    """Photo logical entity model"""

    __tablename__ = "photo"

    project_id: UUID = Field(foreign_key="project.id", nullable=False, index=True)
    filename: str = Field(nullable=False, max_length=255)

    # Selection fields (only used when project.status >= client_selecting)
    is_selected: bool = Field(
        default=False,
        nullable=False,
        description="Client selection state (locked after confirm)",
    )

    # Approval status fields (boolean flags)
    is_approved: bool = Field(
        default=False,
        nullable=False,
        index=True,
        description="Photo approval status",
    )
    is_rejected: bool = Field(
        default=False,
        nullable=False,
        index=True,
        description="Photo rejection status",
    )

    # Relationships
    project: "Project" = Relationship(back_populates="photos")
    photo_versions: List["PhotoVersion"] = Relationship(back_populates="photo")
    photo_comments: List["PhotoComment"] = Relationship(back_populates="photo")

    # Constraints
    __table_args__ = (
        UniqueConstraint("project_id", "filename", name="uq_photo_project_filename"),
        Index("idx_photo_project_id", "project_id"),
    )

    class Config:
        """Pydantic config"""

        from_attributes = True

    def is_pending_approval(self) -> bool:
        """Check if photo approval is pending (not approved and not rejected)"""
        return not self.is_approved and not self.is_rejected
