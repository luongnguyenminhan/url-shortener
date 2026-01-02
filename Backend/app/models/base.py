"""Base model with common fields for all tables"""
from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel


class BaseModel(SQLModel):
    """Base model with common fields: id, created_at, updated_at, is_deleted"""

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
    )
    is_deleted: bool = Field(default=False, nullable=False, index=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
        ),
    )

    class Config:
        """Pydantic config"""
        from_attributes = True
