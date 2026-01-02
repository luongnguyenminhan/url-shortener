"""Authentication service for Firebase Google OAuth"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.constant.messages import MessageConstants
from app.services.user import create_user, get_user_by_google_uid
from app.utils.auth import (
    create_access_token,
    create_refresh_token,
    get_firebase_user_info,
)
from app.utils.logging import get_logger

logger = get_logger(__name__)


def firebase_login(db: Session, id_token: str) -> dict:
    """
    Authenticate user with Firebase ID token and return system tokens.

    Args:
        db: Database session
        id_token: Firebase ID token from Google OAuth

    Returns:
        Dictionary containing user info and authentication tokens

    Raises:
        HTTPException: If authentication fails or service is unavailable
    """
    try:
        # Get user info from Firebase token
        user_info = get_firebase_user_info(id_token)
        google_uid = user_info.get("uid")
        email = user_info.get("email")
        name = user_info.get("name")

        if not google_uid or not email:
            logger.error(MessageConstants.LOG_MISSING_USER_INFO)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=MessageConstants.INVALID_TOKEN_MISSING_INFO,
            )

        # Check if user exists by Google UID
        user = get_user_by_google_uid(db, google_uid)

        # Create user if doesn't exist
        if not user:
            logger.info(f"{MessageConstants.LOG_CREATING_NEW_USER}: {email}")
            user = create_user(db, email=email, google_uid=google_uid, name=name)
        else:
            # Update user name if provided and different
            if name and user.name != name:
                user.name = name
                db.commit()
                db.refresh(user)

        # Generate system tokens
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        result = {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
            },
            "token": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            },
        }

        logger.info(f"{MessageConstants.USER_AUTHENTICATED}: {email}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"{MessageConstants.LOG_FIREBASE_LOGIN_SERVICE_ERROR}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=MessageConstants.AUTH_SERVICE_UNAVAILABLE,
        )
