"""Schemas for Photo operations"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PhotoBase(BaseModel):
    """Base schema for Photo"""

    filename: str = Field(..., max_length=255, description="Photo filename")
    project_id: UUID = Field(..., description="Project ID")


class PhotoCreate(BaseModel):
    """Schema for creating a photo"""

    filename: str = Field(..., max_length=255, description="Photo filename (immutable)")
    project_id: UUID = Field(..., description="Project ID")


class PhotoResponse(BaseModel):
    """Schema for photo response"""

    id: UUID
    filename: str
    project_id: UUID
    is_selected: bool = False
    is_approved: bool = False
    is_rejected: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config"""
        from_attributes = True


class PhotoVersionBase(BaseModel):
    """Base schema for PhotoVersion"""

    version_type: str = Field(..., description="Version type: original or edited")
    image_url: str = Field(..., max_length=512, description="S3/MinIO image URL")


class PhotoVersionResponse(PhotoVersionBase):
    """Schema for photo version response"""

    id: UUID
    photo_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config"""
        from_attributes = True


class PhotoDetailResponse(BaseModel):
    """Schema for detailed photo response with version info"""

    photo: PhotoResponse
    version: PhotoVersionResponse

    class Config:
        """Pydantic config"""
        from_attributes = True


class PhotoListResponse(BaseModel):
    """Schema for photo list response"""

    id: UUID
    filename: str
    project_id: UUID
    is_selected: bool = False
    is_approved: bool = False
    is_rejected: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config"""
        from_attributes = True


class PhotoCommentCreate(BaseModel):
    """Schema for creating a photo comment"""

    content: str = Field(..., max_length=500, description="Comment content")


class PhotoCommentResponse(BaseModel):
    """Schema for photo comment response"""

    id: UUID
    photo_id: UUID
    author_type: str
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config"""
        from_attributes = True


class PhotoSelectRequest(BaseModel):
    """Schema for photo select request"""

    project_token: str = Field(..., description="Project access token")
    comment: str = Field(None, max_length=500, description="Optional comment when selecting photo")


class PhotoMetaResponse(BaseModel):
    """Schema for photo with comments metadata response"""

    id: UUID
    filename: str
    project_id: UUID
    is_selected: bool = False
    is_approved: bool = False
    is_rejected: bool = False
    created_at: datetime
    updated_at: datetime
    comments: list["PhotoCommentResponse"] = Field(default_factory=list, description="List of comments for the photo")

    class Config:
        """Pydantic config"""
        from_attributes = True
