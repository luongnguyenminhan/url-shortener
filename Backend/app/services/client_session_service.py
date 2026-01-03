import hashlib
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.constant.messages import MessageConstants
from app.crud import client_session_crud
from app.models.client_session import ClientSession, pwd_context
from app.models.project import Project
from app.utils import common_utils


def generate_token(project_id: UUID, timestamp: Optional[datetime] = None) -> str:
    """
    Generate access token based on project_id and timestamp using SHA256.
    Token is created using first 32 characters of SHA256 hash
    
    Args:
        project_id: UUID of the project
        timestamp: datetime to use for token generation (defaults to current UTC time)
    
    Returns:
        Generated token string (32 hex characters)
    """
    if timestamp is None:
        timestamp = common_utils.get_utc_now()
    
    # Combine project_id and timestamp for hashing
    data_to_hash = f"{project_id}:{timestamp.isoformat()}"
    token = hashlib.sha256(data_to_hash.encode()).hexdigest()[:32]
    
    return token


def get_active_project_client_sessions(db: Session, project_id: UUID) -> Optional[ClientSession]:
    """
    Get active token for a project.
    
    Args:
        db: Database session
        project_id: Project ID
    
    Returns:
        Active token string or None if no active token exists
    """
    session = client_session_crud.get_session_active_project(db, project_id)
    return session if session else None


def create_client_session(
    db: Session,
    project: Project,
    password: Optional[str] = None,
    expires_in_days: Optional[int] = None,
) -> ClientSession:
    """
    Create a new client session with auto-generated token.
    
    Args:
        db: Database session
        project: Project object
        password: Optional password for the session (will be hashed with passlib)
        expires_in_days: Optional number of days until expiration
    
    Returns:
        Created ClientSession object
    """
    token_existing = client_session_crud.get_session_active_project(db, project.id)
    if token_existing:
        raise HTTPException(
            status_code=400,
            detail=MessageConstants.PROJECT_TOKEN_ALREADY_EXISTS,
        )
    
    now = common_utils.get_utc_now()
    token = generate_token(project.id, now)
    
    expires_at = None
    if expires_in_days:
        expires_at = now + timedelta(days=expires_in_days)
    
    client_session = client_session_crud.create(
        db=db,
        token=token,
        project_id=project.id,
        password=password,
        expires_at=expires_at,
    )
    
    db.commit()
    
    return client_session


def verify_session_access(
    db: Session,
    token: str,
    password: Optional[str] = None,
) -> Optional[ClientSession]:
    """
    Verify client session access by token and optional password.
    Updates last_accessed_at timestamp if validation succeeds.
    Uses passlib for secure password verification.
    
    Args:
        db: Database session
        token: Access token
        password: Optional password to verify (will be checked against passlib hash)
    
    Returns:
        ClientSession if valid and active, None otherwise
    """
    session = client_session_crud.get_by_token(db, token)
    
    if not session:
        return None
        
    # Check if session is active
    if not session.is_active:
        return None
    
    # Check if session is expired
    if session.is_expired():
        return None
    
    # Check password if session has one (using passlib verification)
    if session.has_password():
        if password is None or not session.verify_password(password):
            return None
    
    # Update last accessed timestamp
    client_session_crud.update_last_accessed(db, session.id)
    db.commit()
    
    return session


def revoke_session(db: Session, session_id: UUID) -> Optional[ClientSession]:
    """
    Revoke (deactivate) a client session.
    
    Args:
        db: Database session
        session_id: Session ID to revoke
    
    Returns:
        Revoked ClientSession object or None if not found
    """
    session = client_session_crud.deactivate(db, session_id)
    return session


def refresh_session_expiry(
    db: Session,
    session_id: UUID,
    expires_in_days: int,
) -> Optional[ClientSession]:
    """
    Refresh session expiry date.
    
    Args:
        db: Database session
        session_id: Session ID to refresh
        expires_in_days: Number of days from now until expiration
    
    Returns:
        Updated ClientSession object or None if not found
    """
    new_expires_at = common_utils.get_utc_now() + timedelta(days=expires_in_days)
    session = client_session_crud.update(db, session_id, expires_at=new_expires_at)
    return session


def delete_project_sessions(db: Session, project_id: UUID) -> int:
    """
    Delete all client sessions for a project.
    
    Args:
        db: Database session
        project_id: Project ID
    
    Returns:
        Number of sessions deleted
    """
    sessions = client_session_crud.get_by_project(db, project_id)
    count = len(sessions)
    
    for session in sessions:
        client_session_crud.delete(db, session.id)
    
    return count


