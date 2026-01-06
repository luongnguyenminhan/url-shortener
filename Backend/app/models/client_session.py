"""ClientSession model - Client access tokens with expiration"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from passlib.context import CryptContext
from sqlalchemy import Index
from sqlmodel import Field, Relationship

from app.models.base import BaseModel
from app.utils import common_utils

if TYPE_CHECKING:
    from app.models.project import Project

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class ClientSession(BaseModel, table=True):
    """Client session model (token-based access with expiration and password protection)"""

    __tablename__ = "client_session"

    token: str = Field(unique=True, nullable=False, index=True, max_length=255)
    project_id: UUID = Field(foreign_key="project.id", nullable=False, index=True)
    password_hash: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Hashed password for session access protection (optional, bcrypt)",
    )
    expires_at: Optional[datetime] = Field(default=None)
    is_active: bool = Field(default=True, nullable=False)
    last_accessed_at: Optional[datetime] = Field(default=None)
    count_accesses: int = Field(default=0, nullable=False)

    # Relationships
    project: "Project" = Relationship(back_populates="client_sessions")

    # Constraints
    __table_args__ = (Index("idx_client_session_token_active", "token", "is_active"),)

    class Config:
        """Pydantic config"""

        from_attributes = True

    def is_expired(self) -> bool:
        """Check if session is expired"""
        if self.expires_at is None:
            return False  # Permanent token
        return common_utils.get_utc_now().replace(tzinfo=None) > self.expires_at

    def set_password(self, password: str) -> None:
        """Hash and set password for session"""
        self.password_hash = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        """Verify password against hash"""
        if self.password_hash is None:
            return False  # No password set
        return pwd_context.verify(password, self.password_hash)

    def has_password(self) -> bool:
        """Check if session has password protection"""
        return self.password_hash is not None
