"""User service for user management operations"""

from sqlalchemy.orm import Session

from app.models.user import User


def create_user(db: Session, email: str, google_uid: str, name: str = None) -> User:
    """
    Create a new user in the database.

    Args:
        db: Database session
        email: User email address
        google_uid: Google user ID from Firebase
        name: Optional user display name

    Returns:
        Created User instance
    """
    user = User(
        email=email,
        google_uid=google_uid,
        name=name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    """
    Get user by email address.

    Args:
        db: Database session
        email: User email address

    Returns:
        User instance if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def get_user_by_google_uid(db: Session, google_uid: str) -> User | None:
    """
    Get user by Google UID.

    Args:
        db: Database session
        google_uid: Google user ID

    Returns:
        User instance if found, None otherwise
    """
    return db.query(User).filter(User.google_uid == google_uid).first()
