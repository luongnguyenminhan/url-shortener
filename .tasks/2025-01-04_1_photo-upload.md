# Task: Photo Upload Feature
File name: 2025-01-04_1_photo-upload.md
Created at: 2025-01-04_14:30:00
Created by: Developer
Main branch: main
Task Branch: task/photo-upload_2025-01-04_1
Yolo Mode: Ask

# Task Description
Implement photo upload API endpoint that allows photographers (project owners) to upload JPEG images to their projects. The system should:
- Upload JPEG files to MinIO S3
- Create Photo and PhotoVersion entities in database
- Validate file size, MIME type, and filename
- Handle duplicate filename scenario (reject or replace)
- Return Photo + PhotoVersion details in response

# Project Overview
- **Platform**: Photo Proofing Platform (MVP)
- **Type**: RESTful API (FastAPI)
- **Database**: PostgreSQL with SQLModel ORM
- **Storage**: MinIO S3-compatible object storage
- **Pattern**: Service layer architecture (Endpoints → Services → CRUD → DB)

# Analysis
## Current Architecture
1. **Endpoints** (`app/api/endpoints/`): Route handlers with dependency injection
2. **Services** (`app/services/`): Business logic with authorization checks
3. **CRUD** (`app/crud/`): Database operations
4. **Models** (`app/models/`): SQLModel entities
5. **Schemas** (`app/schemas/`): Pydantic request/response models
6. **Utils** (`app/utils/minio.py`): MinIO operations with retry logic

## Key Findings
- MinIO utils already exist with upload/download functions
- config.py missing MinIO configuration fields (endpoint, access_key, etc.)
- Photo model uses filename as immutable identifier
- PhotoVersion tracks original vs edited versions
- Project owner authorization pattern already established
- File validation pattern: MIME type + size checks needed

## Requirements Breakdown
1. **Configuration**: Add MinIO credentials to Settings class
2. **Schema**: Create PhotoUpload request schema
3. **CRUD**: Add photo operations for creation and existence checks
4. **Service**: Add photo upload logic with file handling
5. **Endpoint**: Create POST /projects/{project_id}/photos endpoint
6. **Validation**: File size (10MB max, JPEG only), filename uniqueness per project

# Proposed Solution

## Technical Approach
- Use `UploadFile` from FastAPI for file streaming
- Validate MIME type and file size before processing
- Generate MinIO object path: `{project_id}/original/{filename}`
- Transaction: Create Photo → Upload to MinIO → Create PhotoVersion
- Error handling: Rollback DB if MinIO upload fails

## File Structure
```
Changes needed:
├── Backend/app/core/config.py (+ MinIO config)
├── Backend/app/schemas/photo.py (new file)
├── Backend/app/crud/photo_crud.py (new file)
├── Backend/app/services/photo_service.py (new file)
├── Backend/app/api/endpoints/photo.py (new file)
├── Backend/app/core/constant/messages.py (+ new messages)
```

# Current execution step: "14. Updated photo image endpoint with streaming and resize support"

# Task Progress
[2025-01-04_14:45:00]
- Modified: config.py, messages.py, __init__.py (api, endpoints)
- Created: schemas/photo.py, crud/photo_crud.py, services/photo_service.py, endpoints/photo.py
- Changes: Added MinIO config, photo schemas, CRUD operations, service logic, endpoints
- Status: SUCCESSFUL

[2025-01-04_14:50:00]
- Modified: docker-compose.yml, docker-compose.dev.yml, docker-compose.prod.yml
- Changes: Added MinIO service with buckets and persistence
- Status: SUCCESSFUL

[2025-01-04_15:00:00]
- Modified: config.py, schemas/photo.py, services/photo_service.py, endpoints/photo.py
- Changes: Updated API endpoints, added photo listing with pagination
- Status: SUCCESSFUL

[2025-01-04_15:05:00]
- Modified: services/photo_service.py, utils/minio.py, utils/redis.py
- Changes: Centralized logger using get_logger from app.utils.logging
- Status: SUCCESSFUL

[2025-01-04_15:10:00]
- Modified: services/photo_service.py, endpoints/photo.py
- Changes:
  * Updated GET /{photo_id} endpoint to return streaming response (inline)
  * Added width (w) and height (h) query parameters for resizing
  * Removed project_id requirement from GET photo endpoint
  * Added get_photo_image() function for image streaming with optional Pillow resizing
  * Returns image/jpeg with Content-Disposition: inline header
  * Supports aspect-ratio preserving resize
  * Graceful fallback to original image if Pillow not available or resize fails
- Reason: Support image streaming and on-the-fly resizing for flexible display
- Blockers: Requires Pillow library for resizing (optional dependency)
- Status: SUCCESSFUL




# Final Review
[Pending]

