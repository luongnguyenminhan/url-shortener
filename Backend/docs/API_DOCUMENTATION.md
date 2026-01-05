# API Documentation

## Authentication APIs

### POST `/api/v1/auth/firebase/login`
**Firebase Google Authentication**

Exchange Firebase ID token for system access and refresh tokens.

**Request Body:**
```json
{
  "id_token": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "google_uid": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    "access_token": "string",
    "refresh_token": "string",
    "token_type": "Bearer"
  }
}
```

**Status Codes:**
- `200 OK` - Successfully authenticated
- `401 Unauthorized` - Invalid token
- `500 Internal Server Error` - Authentication service error

---

### GET `/api/v1/me`
**Get Current User**

Get information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "google_uid": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved user info
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Failed to retrieve user information

---

## Project APIs

### POST `/api/v1/projects`
**Create project**

Create a new project for authenticated user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "title": "string (max 255 chars)",
  "status": "DRAFT | ACTIVE | ARCHIVED | COMPLETED",
  "expired_days": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "owner_id": "uuid",
    "status": "string",
    "images_count": 0,
    "client_notes": "string | null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Status Codes:**
- `201 Created` - Project created successfully
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Invalid input data

---

### GET `/api/v1/projects`
**List user projects**

Get all projects owned by authenticated user with pagination and search.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by
- `sort_order` (optional): asc | desc
- `search` (optional): Search query

**Response:**
```json
{
  "success": true,
  "message": "Project list retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "owner_id": "uuid",
      "status": "string",
      "images_count": 0,
      "client_notes": "string | null",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

**Status Codes:**
- `200 OK` - Projects retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### GET `/api/v1/projects/{project_id}`
**Get project**

Get a specific project by ID.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `project_id` (required): UUID of the project

**Response:**
```json
{
  "success": true,
  "message": "Project retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "owner_id": "uuid",
    "status": "string",
    "images_count": 0,
    "client_notes": "string | null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Status Codes:**
- `200 OK` - Project retrieved successfully
- `404 Not Found` - Project not found
- `401 Unauthorized` - User not authenticated

---

### PUT `/api/v1/projects/{project_id}`
**Update project**

Update a specific project.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `project_id` (required): UUID of the project

**Request Body:**
```json
{
  "title": "string (max 255 chars, optional)",
  "status": "DRAFT | ACTIVE | ARCHIVED | COMPLETED (optional)",
  "client_notes": "string (max 1000 chars, optional)",
  "expired_date": "datetime (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "owner_id": "uuid",
    "status": "string",
    "images_count": 0,
    "client_notes": "string | null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Status Codes:**
- `200 OK` - Project updated successfully
- `404 Not Found` - Project not found
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Invalid input data

---

### PATCH `/api/v1/projects/{project_id}/status`
**Update project status**

Update the status of a project.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `project_id` (required): UUID of the project

**Request Body:**
```json
{
  "status": "DRAFT | ACTIVE | ARCHIVED | COMPLETED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project status updated successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "owner_id": "uuid",
    "status": "string",
    "images_count": 0,
    "client_notes": "string | null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Status Codes:**
- `200 OK` - Status updated successfully
- `404 Not Found` - Project not found
- `401 Unauthorized` - User not authenticated

---

### DELETE `/api/v1/projects/{project_id}`
**Delete project**

Delete a specific project.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `project_id` (required): UUID of the project

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": {
    "id": "uuid"
  }
}
```

**Status Codes:**
- `200 OK` - Project deleted successfully
- `404 Not Found` - Project not found
- `401 Unauthorized` - User not authenticated

---

### POST `/api/v1/projects/create-project-token`
**Create project token**

Create a new token for a project to allow client access.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "project_id": "uuid",
  "expires_in_days": 7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project token created successfully",
  "data": {
    "token": "string",
    "project_id": "uuid",
    "expires_at": "datetime",
    "url": "string"
  }
}
```

**Status Codes:**
- `201 Created` - Token created successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Project not found
- `400 Bad Request` - Invalid input data

---

### POST `/api/v1/projects/verify-project-token`
**Verify project token**

Verify access using a project token (for client/public access).

**Request Body:**
```json
{
  "token": "string",
  "password": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project token verified successfully",
  "data": {
    "session_id": "uuid",
    "project_id": "uuid",
    "project_title": "string",
    "expires_at": "datetime",
    "access_granted": true
  }
}
```

**Status Codes:**
- `200 OK` - Token verified successfully
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Token expired or revoked
- `400 Bad Request` - Invalid request

---

### GET `/api/v1/projects/active-project-token/{project_id}`
**Get active project token**

Get the active token for a specific project.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `project_id` (required): UUID of the project

**Response:**
```json
{
  "success": true,
  "message": "Project token retrieved successfully",
  "data": {
    "token": "string",
    "project_id": "uuid",
    "expires_at": "datetime",
    "url": "string",
    "is_active": true
  }
}
```

**Status Codes:**
- `200 OK` - Token retrieved successfully
- `404 Not Found` - Active project token not found
- `401 Unauthorized` - User not authenticated

---

## Common Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": "string",
  "data": object | array | null,
  "meta": {
    "page": number,
    "page_size": number,
    "total": number,
    "total_pages": number
  }
}
```

## Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "detail": "Detailed error information"
}
```

## Authentication

Most endpoints require authentication using JWT Bearer token:

```
Authorization: Bearer {your_access_token}
```

Obtain access token through the `/api/v1/auth/firebase/login` endpoint.

## Base URL

Development: `http://localhost:8000`
Production: TBD
