"""Schemas for Project operations"""
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from enum import Enum

from app.models.project import ProjectStatus


class ProjectBase(BaseModel):
    """Base schema for Project"""

    title: str = Field(..., max_length=255, description="Project title")
    client_notes: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Client notes for the project",
    )


class ProjectCreate(BaseModel):
    """Schema for creating a project"""
    title: str = Field(..., max_length=255, description="Project title")

    status: Optional[ProjectStatus] = Field(
        default=ProjectStatus.DRAFT,
        description="Initial project status",
    )
    expired_days: Optional[int] = Field(
        default=30,
        description="Days until project expires",
    )


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""

    title: Optional[str] = Field(default=None, max_length=255)
    status: Optional[ProjectStatus] = Field(default=None)
    client_notes: Optional[str] = Field(default=None, max_length=1000)
    expired_date: Optional[datetime] = Field(default=None)


class ProjectStatusUpdate(BaseModel):
    """Schema for updating project status"""

    status: ProjectStatus = Field(..., description="New project status")


class ProjectResponse(ProjectBase):
    """Schema for project response"""

    id: UUID
    owner_id: UUID
    status: str
    images_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config"""
        from_attributes = True


class ProjectDetailResponse(ProjectResponse):
    """Detailed project response with relationships"""

    # Can be extended to include photos, client_sessions, owner details
    pass


class ProjectListResponse(BaseModel):
    """Schema for project list response"""

    total: int
    items: List[ProjectResponse]
    
class ProjectCreateToken(BaseModel):
    """Schema for creating a project token"""
    project_id: UUID = Field(..., description="ID of the project")
    expires_in_days: Optional[int] = Field(
        default=7,
        description="Number of days until the token expires",
    )
    
class VerifyProjectToken(BaseModel):
    """Schema for verifying a project token"""
    token: str = Field(..., description="Project token to verify")
    password: Optional[str] = Field(
        default="",
        description="Password for the token if it is password-protected",
    )
