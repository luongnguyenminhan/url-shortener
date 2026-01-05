# Projects CRUD API Documentation

## Base URL
```
/v1/projects
```

## Endpoints

### 1. Get All Projects (List)
**GET** `/v1/projects`

**Query Parameters:**
- `skip` (number, optional): Offset for pagination
- `limit` (number, optional): Number of items per page
- `search` (string, optional): Search query for filtering
- `sort_key` (string, optional): Field to sort by
- `sort_dir` (string, optional): Sort direction ('asc' or 'desc')

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "title": "string",
      "status": "draft",
      "client_notes": "string",
      "expired_date": "2026-01-05T06:23:13.985Z",
      "images_count": 0,
      "created_at": "2026-01-05T06:23:13.985Z",
      "updated_at": "2026-01-05T06:23:13.985Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "total_pages": 9,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2. Get Single Project
**GET** `/v1/projects/{id}`

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "title": "string",
    "status": "draft",
    "client_notes": "string",
    "expired_date": "2026-01-05T06:23:13.985Z",
    "images_count": 0,
    "created_at": "2026-01-05T06:23:13.985Z",
    "updated_at": "2026-01-05T06:23:13.985Z"
  }
}
```

### 3. Create Project
**POST** `/v1/projects`

**Request Body:**
```json
{
  "title": "string",
  "status": "draft",
  "expired_days": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "title": "string",
    "status": "draft",
    "client_notes": null,
    "expired_date": "2026-01-15T06:23:13.985Z",
    "images_count": 0,
    "created_at": "2026-01-05T06:23:13.985Z",
    "updated_at": "2026-01-05T06:23:13.985Z"
  }
}
```

### 4. Update Project
**PATCH** `/v1/projects/{id}`

**Request Body:**
```json
{
  "title": "string",
  "status": "draft",
  "client_notes": "string",
  "expired_date": "2026-01-05T06:26:09.935Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "title": "string",
    "status": "draft",
    "client_notes": "string",
    "expired_date": "2026-01-05T06:26:09.935Z",
    "images_count": 0,
    "created_at": "2026-01-05T06:23:13.985Z",
    "updated_at": "2026-01-05T06:30:13.985Z"
  }
}
```

### 5. Delete Project
**DELETE** `/v1/projects/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

## Status Values
- `draft` - Project is in draft state
- `client_selecting` - Client is selecting photos
- `pending_edit` - Photos are pending edit
- `client_review` - Client is reviewing edited photos
- `completed` - Project is completed

## Frontend Implementation

### Service Layer
Location: `/src/services/projectService.ts`

All API calls go through axios instance with:
- Automatic Bearer token authentication
- Error handling
- Response/Request interceptors

### Toast Notifications
- ✅ Create success: "Project created successfully"
- ✅ Update success: "Project updated successfully"
- ✅ Delete success: "Project deleted successfully"
- ❌ Errors: Display API error message or fallback

### Features
- ✅ List projects with search
- ✅ Create project (title + expired_days)
- ✅ Update project (title + status + expired_date)
- ✅ Delete project with confirmation
- ✅ Sort by newest first (updated_at DESC)
- ✅ Grid/List view modes
- ✅ Responsive design (Google Drive style)
- ✅ i18n support (English/Vietnamese)
