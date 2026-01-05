"""User model - Photographers (authenticated via Google OAuth)"""
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID

from sqlmodel import Field, Relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.project import Project


class User(BaseModel, table=True):
    """Photographer user model"""

    __tablename__ = "user"

    google_uid: str = Field(unique=True, index=True, nullable=False, max_length=255)
    email: str = Field(nullable=False, max_length=255, index=True)
    name: Optional[str] = Field(default=None, max_length=255)

    # Relationships
    projects: List["Project"] = Relationship(back_populates="owner")

    class Config:
        """Pydantic config"""
        from_attributes = True
