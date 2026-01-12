"""Authentication API endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.constant.messages import MessageConstants
from app.db import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, CurrentUserResponse, GoogleAuthRequest
from app.schemas.common import ApiResponse
from app.services.auth import firebase_login
from app.utils.auth import get_current_user
from app.utils.logging import logger

router = APIRouter(prefix=settings.API_V1_STR, tags=["Auth"])


@router.post(
    "/auth/firebase/login",
    response_model=ApiResponse[AuthResponse],
    status_code=status.HTTP_200_OK,
    summary="Firebase Google Authentication",
    description="Exchange Firebase ID token for system access and refresh tokens",
)
async def login_with_firebase(
    request: GoogleAuthRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[AuthResponse]:
    """
    Authenticate user using Firebase ID token from Google OAuth.

    This endpoint:
    1. Verifies the Firebase ID token
    2. Creates or retrieves user from database
    3. Generates system JWT tokens (access + refresh)
    4. Returns user information and tokens

    Args:
        request: GoogleAuthRequest containing Firebase ID token
        db: Database session dependency

    Returns:
        ApiResponse containing user info and authentication tokens

    Raises:
        HTTPException: If token is invalid or authentication fails
    """
    try:
        logger.info(MessageConstants.LOG_FIREBASE_LOGIN_REQUEST)
        result = firebase_login(db, request.id_token)

        return ApiResponse(
            success=True,
            message=MessageConstants.AUTH_SUCCESS,
            data=AuthResponse(**result),
        )

    except HTTPException as e:
        logger.warning(f"{MessageConstants.LOG_FIREBASE_LOGIN_FAILED}: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"{MessageConstants.LOG_UNEXPECTED_AUTH_ERROR}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=MessageConstants.AUTH_SERVICE_ERROR,
        )


@router.get(
    "/me",
    response_model=ApiResponse[CurrentUserResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Current User",
    description="Get information about the currently authenticated user",
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> ApiResponse[CurrentUserResponse]:
    """
    Get information about the currently authenticated user.

    This endpoint requires a valid JWT token in the Authorization header.

    Returns:
        Current user information including ID, email, name, and timestamps

    Raises:
        HTTPException: If user is not authenticated or token is invalid
    """
    try:
        logger.info("Current user info request received")

        user_data = CurrentUserResponse(
            id=str(current_user.id),
            email=current_user.email,
            name=current_user.name,
            google_uid=current_user.google_uid,
            created_at=current_user.created_at.isoformat(),
            updated_at=current_user.updated_at.isoformat(),
        )

        return ApiResponse(
            success=True,
            message=MessageConstants.USER_INFO_RETRIEVED,
            data=user_data,
        )

    except Exception as e:
        logger.error(f"Error retrieving current user info: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information",
        )
