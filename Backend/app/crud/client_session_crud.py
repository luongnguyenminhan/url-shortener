"""CRUD operations for ClientSession model"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.client_session import ClientSession
from app.utils import common_utils


def create(
    db: Session,
    token: str,
    project_id: UUID,
    password: Optional[str] = None,
    expires_at: Optional[datetime] = None,
) -> ClientSession:
    """Create a new client session"""
    db_session = ClientSession(
        token=token,
        project_id=project_id,
        expires_at=expires_at,
        is_active=True,
    )
    if password:
        db_session.set_password(password)

    db.add(db_session)
    return db_session


def get_by_id(db: Session, session_id: UUID) -> Optional[ClientSession]:
    """Get client session by ID"""
    db_session = db.get(ClientSession, session_id)
    if db_session and db_session.is_expired():
        db_session.is_active = False
        db.add(db_session)
        db.commit()
    return db_session


def get_by_token(db: Session, token: str) -> Optional[ClientSession]:
    """Get client session by token"""
    db_session = db.query(ClientSession).filter(ClientSession.token == token).first()
    if db_session and db_session.is_expired():
        db_session.is_active = False
        db.add(db_session)
        db.commit()
    return db_session


def get_by_project(
    db: Session,
    project_id: UUID,
    is_active: Optional[bool] = None,
) -> List[ClientSession]:
    """Get all client sessions for a project with optional filtering"""
    query = db.query(ClientSession).filter(ClientSession.project_id == project_id)

    if is_active is not None:
        query = query.filter(ClientSession.is_active == is_active)

    return query.all()


def get_all(
    db: Session,
    is_active: Optional[bool] = None,
) -> List[ClientSession]:
    """Get all client sessions with optional filtering by active status"""
    query = db.query(ClientSession)

    if is_active is not None:
        query = query.filter(ClientSession.is_active == is_active)

    return query


def get_active_sessions(
    db: Session,
    project_id: UUID,
) -> List[ClientSession]:
    """Get all active and non-expired sessions for a project"""
    now = common_utils.get_utc_now()
    query = db.query(ClientSession).filter((ClientSession.project_id == project_id) & (ClientSession.is_active == True) & ((ClientSession.expires_at.is_(None)) | (ClientSession.expires_at > now)))
    return query.all()


def update(
    db: Session,
    session_id: UUID,
    token: Optional[str] = None,
    expires_at: Optional[datetime] = None,
) -> Optional[ClientSession]:
    """Update client session"""
    db_session = db.get(ClientSession, session_id)
    if not db_session:
        return None

    if token is not None:
        db_session.token = token
    if expires_at is not None:
        db_session.expires_at = expires_at

    db.add(db_session)
    return db_session


def update_last_accessed(
    db: Session,
    session_id: UUID,
) -> Optional[ClientSession]:
    """Update last accessed timestamp"""
    db_session = db.get(ClientSession, session_id)
    if not db_session:
        return None
    db_session.count_accesses += 1
    db_session.last_accessed_at = datetime.utcnow()
    db.add(db_session)
    return db_session


def update_password(
    db: Session,
    session_id: UUID,
    password: str,
) -> Optional[ClientSession]:
    """Update session password"""
    db_session = db.get(ClientSession, session_id)
    if not db_session:
        return None

    db_session.set_password(password)
    db.add(db_session)
    return db_session


def deactivate(db: Session, session_id: UUID) -> Optional[ClientSession]:
    """Deactivate client session"""
    db_session = db.get(ClientSession, session_id)
    if not db_session:
        return None

    db_session.is_active = False
    db.add(db_session)
    return db_session


def activate(db: Session, session_id: UUID) -> Optional[ClientSession]:
    """Activate client session"""
    db_session = db.get(ClientSession, session_id)
    if not db_session:
        return None

    db_session.is_active = True
    db.add(db_session)
    return db_session


def delete(db: Session, session_id: UUID) -> bool:
    """Delete client session"""
    db_session = db.get(ClientSession, session_id)
    if not db_session:
        return False

    db.delete(db_session)
    return True


def delete_by_token(db: Session, token: str) -> bool:
    """Delete client session by token"""
    db_session = db.query(ClientSession).filter(ClientSession.token == token).first()
    if not db_session:
        return False

    db.delete(db_session)
    return True


def count_by_project(
    db: Session,
    project_id: UUID,
    is_active: Optional[bool] = None,
) -> int:
    """Count client sessions for a project with optional status filter"""
    query = db.query(ClientSession).filter(ClientSession.project_id == project_id)

    if is_active is not None:
        query = query.filter(ClientSession.is_active == is_active)

    return query.count()


def count_all(db: Session, is_active: Optional[bool] = None) -> int:
    """Count all client sessions with optional status filter"""
    query = db.query(ClientSession)

    if is_active is not None:
        query = query.filter(ClientSession.is_active == is_active)

    return query.count()


def get_expired_sessions(db: Session) -> List[ClientSession]:
    """Get sessions that have expired"""
    now = common_utils.get_utc_now()
    return db.query(ClientSession).filter((ClientSession.expires_at.isnot(None)) & (ClientSession.expires_at < now)).all()


def delete_expired_sessions(db: Session) -> int:
    """Delete all expired sessions and return count"""
    expired_sessions = get_expired_sessions(db)
    count = len(expired_sessions)

    for session in expired_sessions:
        db.delete(session)

    return count


def get_session_active_project(
    db: Session,
    project_id: UUID,
) -> Optional[ClientSession]:
    """Get session if it is active and not expired"""
    session = db.query(ClientSession).filter(ClientSession.project_id == project_id).first()
    if not session:
        return None
    if not session.is_active:
        return None
    if session.is_expired():
        session.is_active = False
        db.add(session)
        db.commit()
        return None
    return session
