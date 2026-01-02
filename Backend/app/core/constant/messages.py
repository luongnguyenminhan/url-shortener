"""Message constants for API responses and error messages."""


class MessageConstants:
    """Centralized message constants for the application"""

    # Authentication Success Messages
    AUTH_SUCCESS = "Authentication successful"
    USER_AUTHENTICATED = "User authenticated successfully"
    USER_INFO_RETRIEVED = "User information retrieved successfully"

    # Authentication Error Messages
    AUTH_SERVICE_ERROR = "Authentication service error"
    AUTH_SERVICE_UNAVAILABLE = "Authentication service temporarily unavailable"
    AUTH_REQUIRED = "Authentication required"
    INVALID_TOKEN = "Invalid token"
    INVALID_TOKEN_MISSING_INFO = "Invalid token: missing user information"
    INVALID_GOOGLE_TOKEN = "Invalid Google token"
    INVALID_GOOGLE_TOKEN_FORMAT = "Invalid Google token format"
    INVALID_AUTH_SCHEME = "Invalid authentication scheme"
    TOKEN_VERIFICATION_FAILED = "Token verification failed"

    # User Error Messages
    USER_NOT_FOUND = "User not found"

    # Project Success Messages
    PROJECT_CREATED = "Project created successfully"
    PROJECT_RETRIEVED = "Project retrieved successfully"
    PROJECT_UPDATED = "Project updated successfully"
    PROJECT_STATUS_UPDATED = "Project status updated successfully"
    PROJECT_DELETED = "Project deleted successfully"
    PROJECT_LIST_RETRIEVED = "Project list retrieved successfully"
    PROJECT_ALREADY_EXISTS = "Project with the same title already exists"

    # Project Error Messages
    PROJECT_NOT_FOUND = "Project not found"
    PROJECT_ACCESS_DENIED = "You don't have permission to access this project"
    PROJECT_UPDATE_DENIED = "You don't have permission to update this project"
    PROJECT_DELETE_DENIED = "You don't have permission to delete this project"
    INVALID_PROJECT_STATUS = "Invalid project status"

    # Log Messages
    LOG_FIREBASE_LOGIN_REQUEST = "Firebase login request received"
    LOG_FIREBASE_LOGIN_FAILED = "Firebase login failed"
    LOG_UNEXPECTED_AUTH_ERROR = "Unexpected error during Firebase login"
    LOG_MISSING_USER_INFO = "Missing required user info from Firebase token"
    LOG_CREATING_NEW_USER = "Creating new user for email"
    LOG_FIREBASE_LOGIN_SERVICE_ERROR = "Firebase login service error"
