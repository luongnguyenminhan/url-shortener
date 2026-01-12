"""Message constants for API responses and error messages."""


class MessageConstants:
    """Centralized message constants for the application"""

    # Authentication Success Messages
    AUTH_SUCCESS = "auth_success"
    USER_AUTHENTICATED = "user_authenticated"
    USER_INFO_RETRIEVED = "user_info_retrieved"

    # Authentication Error Messages
    AUTH_SERVICE_ERROR = "auth_service_error"
    AUTH_SERVICE_UNAVAILABLE = "auth_service_unavailable"
    AUTH_REQUIRED = "auth_required"
    INVALID_TOKEN = "invalid_token"
    INVALID_TOKEN_MISSING_INFO = "invalid_token_missing_info"
    INVALID_GOOGLE_TOKEN = "invalid_google_token"
    INVALID_GOOGLE_TOKEN_FORMAT = "invalid_google_token_format"
    INVALID_AUTH_SCHEME = "invalid_auth_scheme"
    TOKEN_VERIFICATION_FAILED = "token_verification_failed"

    # User Error Messages
    USER_NOT_FOUND = "user_not_found"

    # Project Success Messages
    PROJECT_CREATED = "project_created"
    PROJECT_RETRIEVED = "project_retrieved"
    PROJECT_UPDATED = "project_updated"
    PROJECT_STATUS_UPDATED = "project_status_updated"
    PROJECT_DELETED = "project_deleted"
    PROJECT_LIST_RETRIEVED = "project_list_retrieved"
    PROJECT_TOKEN_VERIFIED = "project_token_verified"
    PROJECT_TOKEN_RETRIEVED = "project_token_retrieved"

    # Project Error Messages
    PROJECT_NOT_FOUND = "project_not_found"
    PROJECT_ACCESS_DENIED = "project_access_denied"
    PROJECT_UPDATE_DENIED = "project_update_denied"
    PROJECT_DELETE_DENIED = "project_delete_denied"
    INVALID_PROJECT_STATUS = "invalid_project_status"
    PROJECT_TOKEN_CREATED = "project_token_created"
    PROJECT_TOKEN_ALREADY_EXISTS = "project_token_already_exists"
    PROJECT_ALREADY_EXISTS = "project_already_exists"
    INVALID_PROJECT_TOKEN = "invalid_project_token"

    # Photo Success Messages
    PHOTO_UPLOADED = "photo_uploaded"
    PHOTO_RETRIEVED = "photo_retrieved"
    PHOTO_LIST_RETRIEVED = "photo_list_retrieved"

    # Photo Error Messages
    PHOTO_NOT_FOUND = "photo_not_found"
    PHOTO_NOT_SELECTED = "photo_not_selected"
    INVALID_FILE_TYPE = "invalid_file_type"
    FILE_TOO_LARGE = "file_too_large"
    DUPLICATE_FILENAME = "duplicate_filename"
    MINIO_UPLOAD_ERROR = "minio_upload_error"
    PROJECT_PERMISSION_DENIED = "project_permission_denied"

    # Log Messages
    LOG_FIREBASE_LOGIN_REQUEST = "firebase_login_request"
    LOG_FIREBASE_LOGIN_FAILED = "firebase_login_failed"
    LOG_UNEXPECTED_AUTH_ERROR = "unexpected_auth_error"
    LOG_MISSING_USER_INFO = "missing_user_info"
    LOG_CREATING_NEW_USER = "creating_new_user"
    LOG_FIREBASE_LOGIN_SERVICE_ERROR = "firebase_login_service_error"
