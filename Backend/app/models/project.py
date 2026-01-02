"""Project model - Photo albums with state machine"""
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID

from sqlmodel import Field, Relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.client_session import ClientSession
    from app.models.photo import Photo
    from app.models.user import User


class ProjectStatus(str, Enum):
    """Project status enum"""

    DRAFT = "draft"
    CLIENT_SELECTING = "client_selecting"
    PENDING_EDIT = "pending_edit"
    CLIENT_REVIEW = "client_review"
    COMPLETED = "completed"


class Project(BaseModel, table=True):
    """Project (Album) model with state machine"""

    __tablename__ = "project"

    owner_id: UUID = Field(foreign_key="user.id", nullable=False, index=True)
    title: str = Field(nullable=False, max_length=255)
    status: str = Field(
        nullable=False,
        max_length=50,
        index=True,
        default=ProjectStatus.DRAFT.value,
    )
    client_notes: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Client notes for the project (optional, immutable after pending_edit)",
    )
    expired_date: Optional[datetime] = Field(
        default=None,
        description="Project auto-delete date after completion (NULL means permanent)",
    )

    # Relationships
    owner: "User" = Relationship(back_populates="projects")
    photos: List["Photo"] = Relationship(back_populates="project")
    client_sessions: List["ClientSession"] = Relationship(back_populates="project")

    class Config:
        """Pydantic config"""
        from_attributes = True

    def validate_status(self, status: str) -> bool:
        """Validate project status"""
        return status in [s.value for s in ProjectStatus]
