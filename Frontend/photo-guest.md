
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

**Response:**
- Binary image data (streaming response)
- Content-Type: `image/jpeg`
- Content-Disposition: `inline; filename={filename}`

**Status Codes:**
- `200 OK` - Image retrieved successfully
- `401 Unauthorized` - Invalid or expired project token
- `404 Not Found` - Photo not found

**Example:**
```
GET /api/v1/photos-guest/550e8400-e29b-41d4-a716-446655440000?project_token=abc123&w=800&h=600
```

---

### GET `/api/v1/photos-guest`
**List project photos (guest)**

Get all photos in a project with pagination and optional filtering by selection status.

**Query Parameters:**
- `project_token` (required): Project access token for authorization
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by
- `sort_order` (optional): asc | desc
- `search` (optional): Search query
- `is_selected` (optional): Filter by selection status (true/false)

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
      "updated_at": "datetime"
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
GET /api/v1/photos-guest?project_token=abc123&page=1&page_size=20&is_selected=true
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
  "comment": "string (optional, max 500 chars)"
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
  "comment": "string (optional, max 500 chars)"
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
