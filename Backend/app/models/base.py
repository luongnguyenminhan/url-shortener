"""Base model with common fields for all tables"""
from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

from app.utils import common_utils


class BaseModel(SQLModel):
    """Base model with common fields: id, created_at, updated_at, is_deleted"""

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
    )
    is_deleted: bool = Field(default=False, nullable=False, index=True)
    created_at: datetime = Field(
        default_factory=common_utils.get_utc_now,
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=common_utils.get_utc_now,
        nullable=False,
    )

    class Config:
        """Pydantic config"""
        from_attributes = True
