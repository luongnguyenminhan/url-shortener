# Task: Upload Edited Photo + Approve/Unapprove Endpoints

**File name:** 2026-01-06_1_upload-edited-photo-approval.md
**Created at:** 2026-01-06_16:40:00
**Created by:** user
**Main branch:** main
**Task Branch:** task/upload-edited-photo-approval_2026-01-06_1
**Yolo Mode:** Off

---

## Task Description

Implement edited photo upload endpoint and approve/unapprove toggle endpoints for the photo approval workflow.

**Requirements:**
- Single edited photo upload via `POST /api/v1/photos/{photo_id}/upload-edited`
- Filename validation: match against existing photo
- PhotoVersion overwrite mechanism (update same record, don't increment version)
- Auto-transition: pending_edit → client_review on first edited upload
- Approve/unapprove toggle endpoints in photo_guest API (mirrors select/unselect pattern)
- Block re-editing approved photos
- Shared approval (last client action wins globally)

---

## Project Overview

**Stack:** Python/FastAPI, SQLModel ORM, MinIO storage
**Database:** PostgreSQL with photo versioning and approval tracking
**State Machine:** draft → client_selecting → pending_edit → client_review → completed

**Core files to modify:**
- `Backend/app/services/photo_service.py` - Add upload_edited_photo()
- `Backend/app/services/photo_guest_service.py` - Add approve_photo(), unapprove_photo()
- `Backend/app/crud/photo_crud.py` - Add update_approval_status()
- `Backend/app/crud/photo_version_crud.py` - NEW file with version management
- `Backend/app/api/endpoints/photo.py` - Add POST /{photo_id}/upload-edited
- `Backend/app/api/endpoints/photo_guest.py` - Add approve/unapprove endpoints
- `Backend/app/schemas/photo.py` - Add approval request schemas

---

⚠️ WARNING: CORE RIPER-5 PROTOCOL RULES ⚠️

**MODE DISCIPLINE:**
- RESEARCH: Gather info, ask clarifications (NO suggestions/implementations)
- INNOVATE: Brainstorm solutions (NO concrete planning/code)
- PLAN: Create exhaustive specs (NO implementations)
- EXECUTE: Code exactly per plan (NO deviations unless blockers found)
- REVIEW: Validate against plan (flag ALL deviations)

**KEY CONSTRAINTS:**
- No unauthorized modifications outside task scope
- Follow existing code patterns (don't improve unrelated code)
- Maintain backward compatibility
- Test each component before proceeding
- Commit only after complete REVIEW mode validation

⚠️ WARNING: CORE RIPER-5 PROTOCOL RULES ⚠️

---

## Analysis

### Existing Implementation Status

**What's Already Built:**
- ✅ Photo model with is_approved, is_rejected fields
- ✅ PhotoVersion model with version_type (original|edited)
- ✅ Photo upload flow (draft → client_selecting) working
- ✅ Photo CRUD with get_by_id, exists_by_filename, get_by_project
- ✅ Photo service with validate_file(), upload_photo(), get_photo_image()
- ✅ Photo guest service with select_photo(), unselect_photo()
- ✅ Photo guest endpoints following same pattern
- ✅ MinIO integration for file upload/download
- ✅ Project status enum with pending_edit, client_review states

**What's Missing:**
- ❌ upload_edited_photo() service function
- ❌ approve_photo() and unapprove_photo() guest service functions
- ❌ PhotoVersion CRUD operations for update/create logic
- ❌ POST /photos/{photo_id}/upload-edited endpoint
- ❌ POST /photos-guest/{photo_id}/approve endpoint
- ❌ POST /photos-guest/{photo_id}/unapprove endpoint
- ❌ PhotoApproveRequest and PhotoUnApproveRequest schemas
- ❌ Approval state transition logic (pending_edit → client_review)

### Design Patterns Observed

1. **File Validation:** `validate_file()` checks MIME type, extension, size
2. **MinIO Paths:** `{project_id}/{type}/{identifier}` structure
3. **Service Layer:** Orchestrates CRUD + external calls, checks permissions
4. **Guest Service:** Uses project_token for authorization via client_session_crud
5. **Photo Queries:** Direct db.query() with PhotoVersion filtering
6. **Comment Creation:** Direct photo_comment_crud.create() call with author_type
7. **Transaction Management:** db.flush() for intermediate commits, db.commit() at end

### Key Database Constraints

- Photo: UniqueConstraint("project_id", "filename") - filename is contract
- PhotoVersion: UniqueConstraint("photo_id", "version_type") - one per type
- Photo.is_approved, Photo.is_rejected - boolean flags for toggle state

---

## Proposed Solution

### 1. Service Layer Functions

**`upload_edited_photo()` in photo_service.py:**
- Reuse validate_file() for consistency
- Check project status == pending_edit
- Check photo.is_selected == True
- Check photo.is_approved == False (block re-edit)
- Upload to MinIO at {project_id}/edited/{photo_id}.{ext}
- Use photo_version_crud.create_or_update_edited() for version management
- Auto-transition project to client_review
- Return PhotoDetailResponse with edited version

**`approve_photo()` in photo_guest_service.py:**
- Verify project_token
- Set is_approved = True, is_rejected = False
- Optional comment creation
- Idempotent (409 if already approved, or silent success)

**`unapprove_photo()` in photo_guest_service.py:**
- Verify project_token
- Set is_approved = False, is_rejected = True
- Mandatory reason as comment
- Idempotent (409 if pending approval)

### 2. CRUD Operations

**photo_version_crud.py (new):**
- `get_by_photo_and_type()` - Query by photo_id and version_type
- `create_or_update_edited()` - Overwrite if exists, else create
  - Pattern: Existing UniqueConstraint allows overwrite via update

**photo_crud.py extension:**
- `update_approval_status()` - Set is_approved, is_rejected flags

### 3. API Endpoints

**photo.py (authenticated):**
- POST /{photo_id}/upload-edited
  - Body: file (form), project_id (form)
  - Authorization: current_user as photographer
  - Response: PhotoDetailResponse

**photo_guest.py (token-based):**
- POST /{photo_id}/approve
  - Body: PhotoApproveRequest (project_token, comment)
  - Response: ApiResponse with success
- POST /{photo_id}/unapprove
  - Body: PhotoUnApproveRequest (project_token, reason)
  - Response: ApiResponse with success

### 4. Schemas

**photo.py extension:**
- PhotoApproveRequest: project_token (str), comment (Optional[str])
- PhotoUnApproveRequest: project_token (str), reason (str)

---

## Current execution step: "1. Create task file"

Status: COMPLETED ✓

---

## Task Progress

**2026-01-06_16:40:00**
- Created: .tasks/2026-01-06_1_upload-edited-photo-approval.md
- Analysis: Reviewed existing implementation, identified gaps
- Status: SUCCESSFUL

---

## Final Review

(Pending completion of all implementation steps)

---

**Next Step:** ENTER EXECUTE MODE to implement all changes per plan
