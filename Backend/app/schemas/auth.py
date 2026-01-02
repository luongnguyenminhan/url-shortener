"""Authentication schemas for request and response models"""
from typing import Optional

from pydantic import BaseModel, Field


class GoogleAuthRequest(BaseModel):
    """Request schema for Firebase Google authentication"""

    id_token: str = Field(..., description="Firebase ID token from Google OAuth")


class TokenResponse(BaseModel):
    """Token response schema"""

    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Access token expiration time in seconds")


class UserResponse(BaseModel):
    """User information response schema"""

    id: str = Field(..., description="User UUID")
    email: str = Field(..., description="User email address")
    name: Optional[str] = Field(default=None, description="User display name")


class AuthResponse(BaseModel):
    """Authentication response schema"""

    user: UserResponse = Field(..., description="Authenticated user information")
    token: TokenResponse = Field(..., description="Authentication tokens")


class RefreshTokenRequest(BaseModel):
    """Request schema for token refresh"""

    refresh_token: str = Field(..., description="Refresh token to exchange for new access token")


class CurrentUserResponse(BaseModel):
    """Response schema for current user information"""

    id: str = Field(..., description="User UUID")
    email: str = Field(..., description="User email address")
    name: Optional[str] = Field(default=None, description="User display name")
    google_uid: str = Field(..., description="Google user ID")
    created_at: str = Field(..., description="User creation timestamp")
    updated_at: str = Field(..., description="User last update timestamp")
