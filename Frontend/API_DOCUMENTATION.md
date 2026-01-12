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
      "id": "string (UUID)",
      "email": "string",
      "name": "string | null"
    },
    "token": {
      "access_token": "string",
      "refresh_token": "string",
      "token_type": "bearer",
      "expires_in": 3600
    }
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
    "id": "string (UUID)",
    "email": "string",
    "name": "string | null",
    "google_uid": "string",
    "created_at": "string (ISO datetime)",
    "updated_at": "string (ISO datetime)"
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
  "status": "draft | client_selecting | pending_edit | client_review | completed",
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
    "updated_at": "datetime",
    "owner_info": {
      "id": "uuid",
      "email": "string",
      "name": "string | null"
    }
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
      "updated_at": "datetime",
      "owner_info": {
        "id": "uuid",
        "email": "string",
        "name": "string | null"
      }
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
    "updated_at": "datetime",
    "owner_info": {
      "id": "uuid",
      "email": "string",
      "name": "string | null"
    }
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
  "status": "draft | client_selecting | pending_edit | client_review | completed (optional)",
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
    "updated_at": "datetime",
    "owner_info": {
      "id": "uuid",
      "email": "string",
      "name": "string | null"
    }
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
  "status": "draft | client_selecting | pending_edit | client_review | completed"
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
    "updated_at": "datetime",
    "owner_info": {
      "id": "uuid",
      "email": "string",
      "name": "string | null"
    }
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

## Photo Guest APIs (Public Access via Project Token)

These endpoints allow guest/client access to photos using a project token instead of user authentication.

### GET `/api/v1/photos-guest/{photo_id}`
**Get photo image (guest)**

Download photo image with optional resizing - requires project token for authorization.

**Path Parameters:**
- `photo_id` (required): UUID of the photo

**Query Parameters:**
- `project_token` (required): Project access token for authorization
- `w` (optional): Width for resizing (min: 1, max: 2000)
- `h` (optional): Height for resizing (min: 1, max: 2000)
- `is_thumbnail` (optional): Get thumbnail version as WebP (default: false)
- `version` (optional): Photo version to retrieve - `original` or `edited` (default: `original`)

**Response:**
- Binary image data (streaming response)
- Content-Type: `image/jpeg` or `image/webp` (if is_thumbnail=true)
- Content-Disposition: `inline; filename={filename}`

**Status Codes:**
- `200 OK` - Image retrieved successfully
- `401 Unauthorized` - Invalid or expired project token
- `404 Not Found` - Photo not found

**Example:**
```
GET /api/v1/photos-guest/550e8400-e29b-41d4-a716-446655440000?project_token=abc123&w=800&h=600&version=edited&is_thumbnail=true
```

---

### GET `/api/v1/photos-guest`
**List project photos (guest)**

Get all photos in a project with pagination and optional filtering by photo status.

**Query Parameters:**
- `project_token` (required): Project access token for authorization
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by
- `sort_order` (optional): asc | desc
- `search` (optional): Search query
- `status` (optional): Filter by photo status - `origin`, `selected`, or `edited`

**Response:**
```json
{
  "success": true,
  "message": "Photo list retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "filename": "string",
      "project_id": "uuid",
      "is_selected": false,
      "is_approved": false,
      "is_rejected": false,
      "created_at": "datetime",
      "updated_at": "datetime",
      "edited_version": false
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 10,
    "total": 50,
    "total_pages": 5
  }
}
```

**Status Codes:**
- `200 OK` - Photos retrieved successfully
- `401 Unauthorized` - Invalid or expired project token

**Example:**
```
GET /api/v1/photos-guest?project_token=abc123&page=1&page_size=20&status=selected
```

---

### GET `/api/v1/photos-guest/{photo_id}/meta`
**Get photo meta (guest)**

Get photo details with all comments.

**Path Parameters:**
- `photo_id` (required): UUID of the photo

**Query Parameters:**
- `project_token` (required): Project access token for authorization

**Response:**
```json
{
  "success": true,
  "message": "Photo metadata retrieved successfully",
  "data": {
    "id": "uuid",
    "filename": "string",
    "project_id": "uuid",
    "is_selected": false,
    "is_approved": false,
    "is_rejected": false,
    "created_at": "datetime",
    "updated_at": "datetime",
    "comments": [
      {
        "id": "uuid",
        "photo_id": "uuid",
        "content": "string",
        "author_type": "client | admin",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Photo metadata retrieved successfully
- `401 Unauthorized` - Invalid or expired project token
- `404 Not Found` - Photo not found

---

### POST `/api/v1/photos-guest/{photo_id}/select`
**Select photo (guest)**

Mark a photo as selected and optionally add a comment.

**Path Parameters:**
- `photo_id` (required): UUID of the photo to select

**Request Body:**
```json
{
  "project_token": "string",
  "comment": "string | null (optional, max 500 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Photo selected successfully"
}
```

**Status Codes:**
- `200 OK` - Photo selected successfully
- `401 Unauthorized` - Invalid or expired project token
- `404 Not Found` - Photo not found
- `500 Internal Server Error` - Failed to select photo

**Example Request:**
```json
{
  "project_token": "abc123",
  "comment": "I really like this shot!"
}
```

---

### POST `/api/v1/photos-guest/{photo_id}/unselect`
**Unselect photo (guest)**

Mark a photo as unselected and optionally add a comment.

**Path Parameters:**
- `photo_id` (required): UUID of the photo to unselect

**Request Body:**
```json
{
  "project_token": "string",
  "comment": "string | null (optional, max 500 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Photo unselected successfully"
}
```

**Status Codes:**
- `200 OK` - Photo unselected successfully
- `401 Unauthorized` - Invalid or expired project token
- `404 Not Found` - Photo not found
- `500 Internal Server Error` - Failed to unselect photo

**Example Request:**
```json
{
  "project_token": "abc123",
  "comment": "Changed my mind on this one"
}
```

---

## Photo APIs (Authenticated)

These endpoints require authentication for project owners to manage their photos.

### POST `/api/v1/photos`
**Upload photo**

Upload a JPEG photo to a project.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `file` (required): JPEG image file
- `project_id` (required): UUID of the project

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "photo": {
      "id": "uuid",
      "filename": "string",
      "project_id": "uuid",
      "is_selected": false,
      "is_approved": false,
      "is_rejected": false,
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    "version": {
      "id": "uuid",
      "photo_id": "uuid",
      "version_type": "original",
      "image_url": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  }
}
```

**Status Codes:**
- `201 Created` - Photo uploaded successfully
- `400 Bad Request` - Invalid file format or project_id
- `401 Unauthorized` - User not authenticated

---

### POST `/api/v1/photos/edited`
**Upload edited photo**

Upload an edited version of a JPEG photo to a project.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `file` (required): JPEG image file
- `project_id` (required): UUID of the project

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "photo": {
      "id": "uuid",
      "filename": "string",
      "project_id": "uuid",
      "is_selected": false,
      "is_approved": false,
      "is_rejected": false,
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    "version": {
      "id": "uuid",
      "photo_id": "uuid",
      "version_type": "edited",
      "image_url": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  }
}
```

**Status Codes:**
- `201 Created` - Edited photo uploaded successfully
- `400 Bad Request` - Invalid file format or project_id
- `401 Unauthorized` - User not authenticated

---

### GET `/api/v1/photos/{photo_id}`
**Get photo image**

Retrieve photo image with optional resizing and version selection.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `photo_id` (required): UUID of the photo

**Query Parameters:**
- `w` (optional): Width for resizing (min: 1, max: 2000)
- `h` (optional): Height for resizing (min: 1, max: 2000)
- `is_thumbnail` (optional): Get thumbnail version as WebP (default: false)
- `version` (optional): Photo version to retrieve - `original` or `edited` (default: `original`)

**Response:**
- Binary image data (streaming response)
- Content-Type: `image/jpeg` or `image/webp` (if is_thumbnail=true)
- Content-Disposition: `inline; filename={filename}`

**Status Codes:**
- `200 OK` - Image retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Photo not found

**Example:**
```
GET /api/v1/photos/550e8400-e29b-41d4-a716-446655440000?w=800&h=600&version=edited&is_thumbnail=true
```

---

### GET `/api/v1/photos/projects/{project_id}`
**List project photos**

Get all photos in a project with pagination and optional filtering.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `project_id` (required): UUID of the project

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by
- `sort_order` (optional): asc | desc
- `search` (optional): Search query
- `status` (optional): Filter by photo status - `origin`, `selected`, or `edited`

**Response:**
```json
{
  "success": true,
  "message": "Photo list retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "filename": "string",
      "project_id": "uuid",
      "is_selected": false,
      "is_approved": false,
      "is_rejected": false,
      "created_at": "datetime",
      "updated_at": "datetime",
      "edited_version": false
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 10,
    "total": 50,
    "total_pages": 5
  }
}
```

**Status Codes:**
- `200 OK` - Photos retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Project not found

---

### GET `/api/v1/photos/{photo_id}/meta`
**Get photo metadata**

Get photo details with all comments (authenticated user only).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `photo_id` (required): UUID of the photo

**Response:**
```json
{
  "success": true,
  "message": "Photo meta retrieved successfully",
  "data": {
    "id": "uuid",
    "filename": "string",
    "project_id": "uuid",
    "is_selected": false,
    "is_approved": false,
    "is_rejected": false,
    "created_at": "datetime",
    "updated_at": "datetime",
    "comments": [
      {
        "id": "uuid",
        "photo_id": "uuid",
        "author_type": "client | admin",
        "content": "string",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Photo metadata retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Photo not found

---

### GET `/api/v1/photos/{project_id}/download-photos`
**Download project photos**

Download selected photos as manifest ZIP or get script templates.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `project_id` (required): UUID of the project

**Query Parameters:**
- `type` (required): Download type - `manifest` or `scripts`
  - `manifest`: Returns ZIP with selected photos organized by extension + photos.csv
  - `scripts`: Returns JSON with PowerShell, Bash, and Zsh script templates

**Response (type=manifest):**
- Binary ZIP file (streaming response)
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename={project_name}_selected_photos.zip`

**ZIP Structure:**
```
Selected/
  JPG/
    photo1.jpg
    photo2.jpg
  PNG/
    photo3.png
photos.csv
```

**Response (type=scripts):**
```json
{
  "success": true,
  "message": "Script templates generated successfully",
  "data": {
    "powershell": "PowerShell script content",
    "bash": "Bash script content",
    "zsh": "Zsh script content",
    "csv_url": "/api/v1/photos/{project_id}/download-photos/csv"
  }
}
```

**Status Codes:**
- `200 OK` - Download initiated successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Project not found or no selected photos

---

### GET `/api/v1/photos/{project_id}/download-photos/csv`
**Download photos as CSV**

Download selected photos with comments as CSV file.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `project_id` (required): UUID of the project

**Response:**
- CSV file (streaming response)
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename={project_name}_photos.csv`

**CSV Format:**
```csv
filename,extension,comment,url
photo1.jpg,JPG,"Client comment here",https://...
photo2.jpg,JPG,"",https://...
```

**Status Codes:**
- `200 OK` - CSV file generated successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Project not found or no selected photos

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

Development: `http://localhost:8081/be`
Production: `https://photo.wc504.io.vn/be`
