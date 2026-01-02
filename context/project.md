# Project Context – Photo Proofing Platform (MVP LOCKED)

## 0. Reality Check (Nói Thẳng)

Flow bạn mô tả **đã có độ phức tạp vừa phải** vì:

* Có **vòng lặp review nhiều lần**
* Có **version control cơ bản** (original + edited)
* Có **mapping bằng filename**
* Có **state machine 5 bước**

👉 Vẫn xây dựng được MVP chặt chẽ, **miễn là khóa rule chặt**. Nếu không, sẽ chết ở edge case filename mapping, selection lock, partial approval.

Tôi sẽ define theo hướng:

> "Đủ vòng lặp – không đủ linh hoạt để phá hệ thống".

---

## 1. Actors & Authentication

### Photographer

* Login bằng **Google OAuth**
* Backend tin Google ID Token
* User entity:
  * `id` (UUID)
  * `google_uid` (unique, từ Google)
  * `email`
  * `name` (optional, từ Google profile)
  * `created_at`

### Client (Guest)

* **KHÔNG cần login** (guest-only)
* Truy cập qua **token-based link**
* Token map trực tiếp tới **Project**
* Token **không expires** (permanent)
* Mỗi client session = anonymous

❌ Không account client
❌ Không quản lý client account
❌ Không email/password cho client
✅ Token là chìa khóa duy nhất

---

## 2. Core Entity & State Machine (Xương Sống)

### Project (Album)

**State Flow (không skip, không parallel):**

```
draft
  ↓
client_selecting (clients select hình + comment optional)
  ↓
pending_edit (photographer edit hình đã select)
  ↓
client_review (clients review edited hình)
  ↓
[reject + request edit?]
  ├─→ pending_edit (loop lại)
  │
[approve tất cả?]
  └─→ completed
```

**Rule cứng:**

* Project chỉ ở **1 state tại 1 thời điểm**
* Không skip state
* Không parallel review từ nhiều client
* State transition là **bất khả đảo** (không rollback)

**Fields:**

* `id` (UUID)
* `owner_id` (FK → User.id)
* `title` (tên project)
* `status` (enum: draft, client_selecting, pending_edit, client_review, completed)
* `client_token` (unique, không expires)
* `created_at`
* `updated_at`

---

## 3. Photo & Version Control

### Photo (Logical Photo)

* `id` (UUID)
* `project_id` (FK → Project.id)
* `filename` (tên file gốc, **immutable**)
* `created_at`

> ❗ **Filename = contract** giữa photographer và client. Không đổi sau khi tạo.

**Rule cứng:**

* (`project_id`, `filename`) UNIQUE
* Filename là key mapping khi upload edited

---

### PhotoVersion

* `id` (UUID)
* `photo_id` (FK → Photo.id)
* `version_type` (enum: `original`, `edited`)
* `version_number` (int, bắt đầu từ 1)
* `image_url` (S3/R2 URL)
* `created_at`

**Rule cứng (quan trọng):**

* **Original**: chỉ 1 version duy nhất per photo (`version_type=original`, `version_number=1`)
* **Edited**: multiple versions, nhưng **overwrite file cũ** khi upload lại cùng edited v1
  * VD: Upload v1, sau đó upload lại v1 → **không tạo version_number mới**, chỉ update image_url cũ
* Client **chỉ thấy latest edited version** (v[max])
* Toggle "Show original" để so sánh

❌ Không diff
❌ Không rollback UI
❌ Không xoá version
✅ Overwrite mechanism

---

### PhotoSelection

* `photo_id` (FK → Photo.id, PK)
* `is_selected` (boolean, default=false)
* `created_at`
* `updated_at`

**Rule cứng:**

* Chỉ tồn tại khi Project.status = `client_selecting`
* **Selection lock ngay sau `client_selecting` confirm**
* Client chỉ được **unselect**, NOT **select thêm**
* VD: select 7/10 hình, sau confirm chỉ được bỏ xuống 5/10, không được chọn thêm

---

### PhotoComment

* `id` (UUID)
* `photo_id` (FK → Photo.id) — **gắn vào Photo entity (logical)**
* `author_type` (enum: `client`)
* `content` (text)
* `created_at`

**Rule cứng:**

* **Chỉ client comment, photographer KHÔNG comment** (read-only)
* Gắn vào Photo (logical), visible khi xem edited version
* Comment **bắt buộc nếu reject**, optional nếu approve
  * Reject without comment → system block "Request Edit"
  * Approve → comment optional
* Immutable (không edit sau tạo)
* **Lock comment khi Project → `pending_edit`**
  * Client không thêm comment mới cho tới khi photographer upload

---

### ProjectNote

* `id` (UUID)
* `project_id` (FK → Project.id)
* `author_type` (enum: `client`, fixed)
* `content` (text)
* `created_at`

**Rule cứng:**

* Ghi chú chung cho cả project (không gắn vào photo cụ thể)
* Chỉ client tạo (not photographer)
* Optional, immutable
* Lock khi Project → `pending_edit`

---

## 4. Flow Chi Tiết (Khóa Từng Bước)

### Step 1 – Photographer Upload Original (draft → client_selecting)

**State**: Project ở `draft`

**Photographer Action:**
```
POST /be/projects/{id}/upload
Content-Type: multipart/form-data

Files: [image1.jpg, image2.jpg, ..., imageN.jpg]
```

**System Processing:**
1. Validate project ownership (photographer = owner_id)
2. Validate project status = `draft` (block nếu khác)
3. For each file:
   a. Validate file:
      - Must be image format (jpg, png, jpeg, webp, ...)
      - File size < 50MB (technical limit)
      - Filename validation:
        * Allow: alphanumeric, dash, underscore, space, dot
        * Reject: special chars, unicode, path traversal (/, \)
   b. Generate Photo record:
      - `id` = UUID
      - `project_id` = project ID
      - `filename` = original filename (exact, case-sensitive)
      - Validate unique (`project_id`, `filename`)
      - If duplicate filename → error 409 Conflict (reject entire upload)
   c. Upload to S3:
      - Path: `projects/{project_id}/original/{photo_id}.{ext}`
      - Generate unique S3 key (avoid collision)
   d. Create PhotoVersion:
      - `photo_id` = photo ID
      - `version_type` = `original`
      - `version_number` = 1
      - `image_url` = S3 URL
4. If all files processed successfully:
   a. Project.status → `client_selecting`
   b. Project.updated_at = now()
   c. Generate client_token (if not exist)
   d. Return success + client share link

**Validation Rules:**
- Total files per project: no hard limit (MVP accepts unlimited)
- Total project size: no hard limit (MVP accepts, scale later)
- Duplicate filename within project: REJECT (409)
- Filename case-sensitive: "Photo.jpg" ≠ "photo.jpg" (separate photos)
- Empty file: REJECT
- Corrupted image: REJECT (validate magic bytes)

**Error Response:**
```json
{
  "status": 400,
  "errors": [
    {
      "filename": "image1.jpg",
      "code": "INVALID_FORMAT",
      "message": "File format not supported"
    },
    {
      "filename": "image2.jpg",
      "code": "DUPLICATE_FILENAME",
      "message": "Filename already exists in project"
    }
  ]
}
```

**Success Response:**
```json
{
  "project_id": "uuid",
  "status": "client_selecting",
  "total_uploaded": 10,
  "client_token": "token_xyz",
  "client_share_url": "https://app.com/client/token_xyz",
  "photos": [
    {
      "id": "photo_uuid_1",
      "filename": "image1.jpg",
      "original_version_url": "s3://..."
    },
    ...
  ]
}
```

❌ Không re-upload original (block nếu project !== draft)
❌ Không thay đổi filename
❌ Không batch replace (replace = delete + re-upload trong future)

---

### Step 2 – Clients Select & Comment (client_selecting state)

**State**: Project ở `client_selecting`

**Client View:**
```
GET /be/client/projects/{token}
```

**Response:**
```json
{
  "project_id": "uuid",
  "title": "Photoshoot Wedding 2025",
  "status": "client_selecting",
  "can_confirm": true,
  "photos": [
    {
      "id": "photo_id_1",
      "filename": "image1.jpg",
      "original_url": "s3://...",
      "is_selected": false,
      "comments": [
        {
          "id": "comment_id_1",
          "author_type": "client",
          "content": "Love this one!",
          "created_at": "2026-01-02T10:00:00Z"
        }
      ]
    },
    ...
  ],
  "project_notes": [
    {
      "id": "note_id_1",
      "content": "Please edit skin tone to be warmer",
      "created_at": "2026-01-02T10:05:00Z"
    }
  ]
}
```

**Client Actions:**

**2a. Select Photo:**
```
POST /be/client/projects/{token}/photos/{photo_id}/select
Body: { "is_selected": true }
```

Validation:
- Photo must exist in project
- Project status = `client_selecting` (block if changed)
- Token must have access to project
- Update PhotoSelection.is_selected = true

Response:
```json
{
  "photo_id": "uuid",
  "is_selected": true,
  "updated_at": "2026-01-02T10:10:00Z"
}
```

**2b. Unselect Photo:**
```
POST /be/client/projects/{token}/photos/{photo_id}/select
Body: { "is_selected": false }
```

Same validation + update is_selected = false

**2c. Add Comment:**
```
POST /be/client/projects/{token}/photos/{photo_id}/comments
Body: {
  "content": "Too bright, please darken shadows"
}
```

Validation:
- Project status = `client_selecting` (block if pending_edit)
- Photo must exist
- Content required, max length 500 chars
- Content must not be empty (trim + validate)

Create PhotoComment:
- `photo_id` = photo ID
- `author_type` = `client`
- `content` = content
- `created_at` = now()

Response:
```json
{
  "id": "comment_id",
  "photo_id": "photo_id",
  "author_type": "client",
  "content": "Too bright, please darken shadows",
  "created_at": "2026-01-02T10:15:00Z"
}
```

**2d. Add Project Note:**
```
POST /be/client/projects/{token}/notes
Body: {
  "content": "General: Please warm up color grading across all images"
}
```

Validation:
- Project status = `client_selecting`
- Content required, max length 1000 chars

Create ProjectNote:
- `project_id` = project ID
- `author_type` = `client`
- `content` = content
- `created_at` = now()

**Business Rules:**
- Multiple clients can select/comment simultaneously
  - Last-write-wins for selection (optimistic locking)
  - Comments always appended (no conflict)
- Comment shared across all clients (all see all comments)
- Selection independent per client (each client can select differently)
  - VD: Client A select 8/10, Client B select 6/10
- Photographer can view comments + selections in real-time (polling every 5s recommended)

❌ Photographer CANNOT comment
❌ Client CANNOT select after confirm
✅ Select/unselect unlimited times before confirm

---

### Step 3 – Clients Confirm Selection (client_selecting → pending_edit)

**State Transition Trigger**: Client clicks "Confirm Selection"

**Action:**
```
POST /be/client/projects/{token}/confirm
Body: {}
```

**System Processing:**

1. Validate token + project access
2. Lock check (idempotency):
   - If project status already = `pending_edit`, return error 409 (already confirmed)
3. Aggregate client selections:
   - Collect all selected photos from ALL clients
   - Merge selections (union or intersection? → UNION: any client select = included)
   - Store finalized selection list
4. Lock state:
   - Project.status → `pending_edit`
   - Lock all PhotoSelection records (cannot modify is_selected)
   - Lock all comments (cannot add new PhotoComment or ProjectNote)
5. Response:
   ```json
   {
     "project_id": "uuid",
     "status": "pending_edit",
     "selected_photos_count": 8,
     "total_photos": 10,
     "confirmed_at": "2026-01-02T10:20:00Z",
     "photographer_message": "Selection confirmed. Please proceed with editing."
   }
   ```

**Validation Rules:**
- At least 1 photo must be selected (reject if 0 select)
- Project status must = `client_selecting` (idempotent, return 409 if already pending_edit)
- All clients must finalize selection (design decision: first client to confirm = commit for all)
  - Alternative: require explicit per-client confirm (not implemented MVP)

**Error Scenarios:**
```json
{
  "status": 409,
  "code": "ALREADY_CONFIRMED",
  "message": "Project already confirmed. Cannot confirm again."
}
```

```json
{
  "status": 400,
  "code": "NO_SELECTION",
  "message": "At least 1 photo must be selected"
}
```

**After Confirm:**
- Photographer receives notification (visual indicator in dashboard)
- Selection is now **immutable**
- Clients can ONLY unselect, NOT select new
- Comments are locked (read-only for clients)

❌ No rollback to client_selecting
❌ No concurrent confirm (first confirm wins)
✅ Idempotent: confirm twice = same result

---

### Step 4 – Photographer Edit & Upload Edited (pending_edit → client_review)

**State**: Project ở `pending_edit`

**Photographer View:**
```
GET /be/projects/{id}
```

Response includes:
```json
{
  "project_id": "uuid",
  "status": "pending_edit",
  "selected_photos": [
    {
      "id": "photo_id_1",
      "filename": "image1.jpg",
      "original_url": "s3://...",
      "comments": [
        {
          "id": "comment_id_1",
          "content": "Too bright, please darken shadows",
          "created_at": "2026-01-02T10:15:00Z"
        }
      ]
    },
    ...
  ],
  "project_notes": [
    {
      "content": "General: Please warm up color grading across all images",
      "created_at": "2026-01-02T10:16:00Z"
    }
  ],
  "edited_versions": [
    {
      "photo_id": "photo_id_1",
      "filename": "image1.jpg",
      "latest_edited_version": 2,
      "approval_status": "pending" // pending | approved
    }
  ]
}
```

**Photographer Upload Edited:**
```
POST /be/projects/{id}/upload-edited
Content-Type: application/zip

File: edited_v1.zip (contains: image1.jpg, image2.jpg, ..., imageN.jpg)
```

**System Processing:**

1. Validate project ownership
2. Validate project status = `pending_edit` (block if client_review)
3. Extract ZIP (max 1GB uncompressed, validate no path traversal)
4. For each file in ZIP:
   a. Validate filename:
      - Must match selected photo filename (case-sensitive)
      - If filename not in Photo table → skip (ignore)
      - If photo not selected → skip (ignore)
      - If photo already approved in previous review → **SKIP** (don't edit approved hình)
   b. Upload to S3:
      - Path: `projects/{project_id}/edited/{photo_id}/{version}.{ext}`
      - VD: `projects/uuid/edited/photo_uuid_1/v1.jpg`
   c. Create or Update PhotoVersion:
      - Get max version_number for (photo_id, version_type=edited)
      - If version exists at max → **overwrite S3 URL** (don't increment version_number)
      - If new version → increment version_number + create record
   d. Create PhotoApprovalStatus record:
      - Track photo approval status per review round
      - `approval_status` = `pending` (ready for client review)
5. Transition:
   - Project.status → `client_review`
   - Project.updated_at = now()
6. Response:
   ```json
   {
     "project_id": "uuid",
     "status": "client_review",
     "processed_files": 8,
     "skipped_files": 2,
     "skipped_reasons": [
       {
         "filename": "already_approved.jpg",
         "reason": "Photo already approved in previous round"
       },
       {
         "filename": "not_selected.jpg",
         "reason": "Photo not in selection"
       }
     ],
     "edited_versions": [
       {
         "photo_id": "uuid",
         "filename": "image1.jpg",
         "edited_version": 1,
         "approval_status": "pending"
       }
     ]
   }
   ```

**Validation Rules:**
- ZIP must be valid archive (validate magic bytes)
- Filename match: case-sensitive, exact match required
- Approved photos: skip (don't edit approved, return skip reason)
- Unselected photos: skip (return skip reason)
- Duplicate filename in ZIP: process first, warn duplicate
- File size per image: < 50MB
- Total ZIP size: < 1GB uncompressed

**Technical Details:**

**Version Numbering:**
```
Round 1 upload:
  - image1.jpg → creates PhotoVersion(version_type=edited, version_number=1)
  - image2.jpg → creates PhotoVersion(version_type=edited, version_number=1)

Round 2 upload (client request edit on image1):
  - image1.jpg → updates PhotoVersion(version_type=edited, version_number=1) S3 URL
  - image2.jpg NOT reuploaded → skipped (already approved)

Round 2 upload (photographer edits image1 again):
  - image1.jpg → creates PhotoVersion(version_type=edited, version_number=2)
```

❌ Không upload từng file lẻ (batch Zip only)
❌ Không auto rename
❌ Không fuzzy match
✅ Overwrite same version (same video_number)
✅ Skip approved + unselected (return skip list)

---

### Step 5 – Clients Review & Approve/Reject (client_review state)

**State**: Project ở `client_review`

**Client View:**
```
GET /be/client/projects/{token}
```

Response:
```json
{
  "project_id": "uuid",
  "status": "client_review",
  "photos": [
    {
      "id": "photo_id_1",
      "filename": "image1.jpg",
      "original_url": "s3://...",
      "edited_url": "s3://...",  // latest edited version
      "approval_status": "pending",  // pending | approved | rejected
      "rejection_reason": null,  // only if rejected
      "version_info": {
        "original": { "version_number": 1, "url": "s3://..." },
        "edited": [
          { "version_number": 1, "url": "s3://..." },
          { "version_number": 2, "url": "s3://..." }
        ]
      },
      "comments": [
        {
          "id": "comment_id_1",
          "content": "Too bright, please darken shadows",
          "created_at": "2026-01-02T10:15:00Z"
        },
        {
          "id": "comment_id_2",
          "author_type": "client",
          "content": "Perfect! This is great",  // new comment this round
          "created_at": "2026-01-02T10:25:00Z"
        }
      ]
    },
    ...
  ]
}
```

**5a. Approve Photo:**
```
POST /be/client/projects/{token}/photos/{photo_id}/approve
Body: {
  "comment": "Perfect! No changes needed"  // optional
}
```

Validation:
- Photo in project
- Project status = `client_review`
- Comment max 500 chars
- Comment optional (can be null)

Processing:
1. Update PhotoApprovalStatus:
   - `approval_status` = `approved`
   - `approved_at` = now()
2. If comment provided:
   - Create PhotoComment (author_type = client)
3. Response:
   ```json
   {
     "photo_id": "uuid",
     "approval_status": "approved",
     "comment_added": true,
     "approved_at": "2026-01-02T10:30:00Z"
   }
   ```

**5b. Reject Photo:**
```
POST /be/client/projects/{token}/photos/{photo_id}/reject
Body: {
  "comment": "Please darken shadows and adjust white balance"  // REQUIRED
}
```

Validation:
- Photo in project
- Project status = `client_review`
- Comment **REQUIRED** (system block reject without comment)
- Comment max 500 chars
- Comment min 5 chars (prevent spam)

Processing:
1. Update PhotoApprovalStatus:
   - `approval_status` = `rejected`
   - `rejected_at` = now()
2. Create PhotoComment:
   - `photo_id` = photo ID
   - `author_type` = `client`
   - `content` = comment
   - `created_at` = now()
3. Response:
   ```json
   {
     "photo_id": "uuid",
     "approval_status": "rejected",
     "comment_id": "uuid",
     "rejected_at": "2026-01-02T10:35:00Z"
   }
   ```

**Error if no comment:**
```json
{
  "status": 400,
  "code": "COMMENT_REQUIRED",
  "message": "Comment is required when rejecting a photo"
}
```

**Business Rules:**
- Multiple clients can approve/reject simultaneously
  - Last approval/rejection wins (optimistic locking)
  - If conflict: warn client, reload state
- Approved photo = locked (cannot change back to rejected)
  - Once approved, photographer won't re-edit this photo
  - If client wants re-edit: must unselect (future phase, MVP doesn't allow)
- Rejection requires comment (mandatory feedback)
- Can approve and reject different photos in same request (not atomic)

**Approval Status Tracking:**
- Per-client approval? Or shared approval?
  - **MVP decision**: Shared approval (last client action wins)
  - Alternative: Per-client approval (requires unanimous consent) → not MVP
  - Another: Per-client approval (any client approve = done) → not MVP

❌ Photographer cannot comment
✅ Comment only on reject
✅ Approve/reject each photo independently

---

### Step 6 – Loop or Complete (client_review → pending_edit or completed)

**Check Status:**
```
GET /be/projects/{id}/approval-status
```

Response:
```json
{
  "project_id": "uuid",
  "total_selected_photos": 10,
  "approved_count": 7,
  "rejected_count": 2,
  "pending_count": 1,
  "approval_summary": {
    "all_approved": false,
    "has_rejection": true,
    "can_complete": false,
    "can_request_edit": true
  }
}
```

**6a. If has rejection:**

Client action:
```
POST /be/client/projects/{token}/request-edit
Body: {}
```

System Processing:
1. Validate has rejected photos (at least 1)
2. Collect rejected photos list
3. Project.status → `pending_edit`
4. Mark approved photos as "locked for edit" (photographer cannot edit)
5. Prepare rejection summary for photographer
6. Response:
   ```json
   {
     "project_id": "uuid",
     "status": "pending_edit",
     "rejected_photos": [
       {
         "photo_id": "uuid",
         "filename": "image1.jpg",
         "rejection_comments": [
           "Too bright, please darken shadows",
           "Adjust white balance"
         ]
       },
       ...
     ],
     "photographer_action": "Edit only rejected photos. Approved photos should not be modified."
   }
   ```
7. Project enters pending_edit again
8. Loop back to Step 4 (photographer upload edited)

**Infinite Loop Handling:**
- No limit on edit rounds (MVP accepts)
- Photographer must manually stop if impossible to satisfy
- Future: Add max round limit (e.g., 5 rounds)

**6b. If all approved:**

Automatic transition:
1. When last photo is approved:
   - Check if any pending → if yes, wait
   - When all = approved → auto-transition
2. Project.status → `completed`
3. Create download record:
   - `download_token` = generate new token
   - `expires_at` = null (permanent)
   - `created_at` = now()
4. Response:
   ```json
   {
     "project_id": "uuid",
     "status": "completed",
     "completed_at": "2026-01-02T11:00:00Z",
     "download_available": true,
     "download_link": "https://app.com/download/token_xyz"
   }
   ```

**Completion Event:**
- Photographer receives notification (in-app): "Project completed!"
- Clients can download approved images

❌ Photographer cannot edit approved photos
❌ Cannot split approval (all or nothing)
✅ Unlimited edit rounds
✅ Atomic completion (100% approved only)

---

## 5. Unselected Photo Behavior (Chi Tiết)

### Scenario 1: Photographer upload 10 hình, client select 7/10

**Unselected hình (3 cái):**
- Exist in Photo + PhotoVersion (original)
- PhotoSelection.is_selected = false
- Photographer CAN view
- **CANNOT edit** (ignored when upload edited)
- Client CANNOT view (unless unselect logic allows re-select, which MVP doesn't)
- Client CANNOT download

### Scenario 2: Photographer upload edited, include unselected hình

**ZIP includes:**
- 7 selected hình
- 3 unselected hình

**System behavior:**
- Process 7 selected → create/update PhotoVersion(edited)
- Skip 3 unselected → return skip list with reason "Photo not in selection"
- No error, just ignore

### Scenario 3: Client unselect after confirm

**Before confirm:**
- Client select 10/10 hình
- Click "Confirm"
- Project → `pending_edit`

**MVP rule:**
- Selection is LOCKED (cannot unselect after confirm)
- This contradicts earlier rule, clarify with team
- **Assumption**: Cannot unselect after confirm

---

## 6. Version Visibility (Chi Tiết)

### Client View in `client_review`:

**Photo card shows:**
```
┌─────────────────────────────┐
│ image1.jpg                  │
├─────────────────────────────┤
│ [Edited Image Display]      │  ← Latest edited version (v[max])
│ 
│ [Comparison Toggle]         │
│ "Show Original" ◀─────────┐
│                            │
│ Comments:                  │
│ • Too bright              │
│ • Perfect!                │
│                            │
│ Status: [Approve] [Reject] │
└─────────────────────────────┘

When "Show Original" toggled:
┌─────────────────────────────┐
│ image1.jpg (ORIGINAL)       │
├─────────────────────────────┤
│ [Original Image Display]    │  ← Only v1, original never updates
│ ...
└─────────────────────────────┘
```

### Photographer View in `pending_edit`:

**Photo card shows:**
```
Photo: image1.jpg
- Original: v1 (S3 link)
- Previous Edited: v1, v2 (view only, cannot delete)
- Comments from clients:
  • Too bright, please darken shadows
  • Perfect! No changes needed

Action: Upload new edited version or next photo
```

### Version History (Internal):

Database record:
```
PhotoVersion {
  photo_id: "uuid_1"
  version_type: "original",
  version_number: 1,
  image_url: "s3://original/photo_uuid_1/v1.jpg"
},
PhotoVersion {
  photo_id: "uuid_1",
  version_type: "edited",
  version_number: 1,
  image_url: "s3://edited/photo_uuid_1/v1.jpg"  ← First edit
},
PhotoVersion {
  photo_id: "uuid_1",
  version_type: "edited",
  version_number: 2,
  image_url: "s3://edited/photo_uuid_1/v2.jpg"  ← Second edit (after request edit)
},
PhotoVersion {
  photo_id: "uuid_1",
  version_type: "edited",
  version_number: 2,
  image_url: "s3://edited/photo_uuid_1/v2_new.jpg"  ← Overwrite same version
}
```

**Client always sees**: Latest edited v[max]
**Client can toggle**: Show original v1
**Photographer can see**: All versions history

---

## 7. Download Mechanism (Chi Tiết)

### Trigger: Project → `completed`

**Automatic Process:**
1. Gather all approved photos
2. For each approved photo:
   - Include latest edited version (PhotoVersion where version_type=edited, max version_number)
   - Skip original
   - Skip unselected
3. Generate download URL + token
4. Create DownloadRecord:
   ```
   id: UUID
   project_id: UUID
   download_token: String (unique)
   created_at: DateTime
   expires_at: NULL (permanent)
   file_count: Integer
   total_size: Integer
   ```

### Client Download:

**Request:**
```
GET /be/client/projects/{token}/download
```

**Response (Option A - Direct Link):**
```json
{
  "download_url": "https://app.com/downloads/token_xyz/approved_images.zip",
  "file_count": 8,
  "total_size": "245 MB",
  "expires_in": "never"
}
```

**Response (Option B - Server-side generation):**
```json
{
  "status": "processing",
  "estimated_time": "2 minutes",
  "download_token": "token_xyz"
}

// Poll after 2 minutes
GET /be/client/projects/{token}/download/token_xyz/status
→ returns download_url when ready
```

**ZIP Contents:**
```
approved_images.zip
├── image1.jpg          ← Latest edited (v[max])
├── image2.jpg          ← Latest edited
├── image3.jpg          ← Latest edited (unselected not included)
├── ...
└── README.txt          ← Metadata
    Project: Photoshoot Wedding 2025
    Approved on: 2026-01-02T11:00:00Z
    Total photos: 8 approved
```

### Security:
- Download token unique per project
- No session required (anyone with token can download)
- No expiration (permanent)
- No bandwidth limit (MVP accepts all)
- No IP restriction (MVP allows download from anywhere)

### Technical Implementation:
- Pre-generate ZIP on completion (async job)
- OR generate on-demand (slow first request, fast cache)
- Store in S3 with long-lived signed URL
- Or store locally + serve via CDN

---

## 8. Concurrent Access & Race Conditions (Chi Tiết)

### Scenario 1: Multiple Clients Select Simultaneously

**Situation:**
- Client A select photo 1
- Client B unselect photo 1 (same time)
- Who wins?

**MVP Solution:**
- Last write wins (optimistic locking)
- Implemented: VERSION field in PhotoSelection
- If conflict: client receives 409 (version mismatch), must reload + retry

**Request/Response:**
```
POST /be/client/projects/{token}/photos/{photo_id}/select
Body: {
  "is_selected": true,
  "version": 2  ← Current version from last fetch
}

Response: 409 Conflict (if version changed)
{
  "code": "VERSION_MISMATCH",
  "current_version": 3,
  "message": "Selection changed since you last loaded. Please reload."
}
```

### Scenario 2: Client Approve While Photographer Uploading

**Situation:**
- Photographer uploading v2 (in progress)
- Client approve photo (while upload incomplete)

**Prevention:**
- Use transactional lock:
  1. Start upload transaction
  2. Lock Project row (FOR UPDATE)
  3. Prevent concurrent approve/reject
  4. Complete upload → unlock
- OR: Queue all approval actions, process sequentially

### Scenario 3: Two Photographers Owning Same Project

**MVP Rule:**
- NOT ALLOWED (1 project = 1 photographer owner)
- If data corruption: manual admin intervention

### Scenario 4: Client Confirms Selection While Photographer Still Uploading Original

**Situation:**
- Photographer upload original (slow, 20 photos)
- After 10 photos uploaded, client confirm
- Photographer finish uploading remaining 10

**Prevention:**
- Lock Project status during transition
- Client cannot confirm while status is changing
- System validation: count photos before allow confirm

---

## 9. Comment Thread Model (Chi Tiết)

### Comment Structure:

```
Photo (logical)
├── PhotoComment (Round 1 - client_selecting)
│   ├── "Too bright"
│   ├── "Love the composition"
│   └── "Please adjust white balance"
│
└── PhotoComment (Round 2 - client_review)
    ├── "Looks better, but shadow still dark"
    ├── "Perfect!"
    └── (no new comments if approved)
```

### Comment Lifecycle:

```
State: client_selecting
  ├─ Client adds comment → PhotoComment created
  ├─ Visible to all clients in real-time
  └─ Locked when → pending_edit

State: pending_edit
  ├─ Comments read-only (previous round visible)
  ├─ New comments NOT allowed
  └─ Photographer reviews all comments

State: client_review
  ├─ Comments from previous rounds visible
  ├─ New approval comments allowed
  │   (only when approve/reject)
  └─ Separate comment per action (optional on approve, required on reject)
```

### Database Design:

```
PhotoComment
├── id: UUID
├── photo_id: UUID (FK)
├── author_type: ENUM(client)  ← Fixed, no photographer comments
├── content: String
├── round: Integer  ← Track which review round (1, 2, 3...)
├── created_at: DateTime
├── created_by_client_token: String  ← Which client commented
└── is_visible: Boolean  ← Future: per-client hide option
```

### Client Comment Visibility:

**All clients see all comments** (shared thread)
- Except: future phase, per-client feedback

---

## 10. Selection Lock Mechanism (Chi Tiết)

### Timeline:

```
T1: Project created (draft)
    └─ PhotoSelection records do NOT exist yet

T2: Project → client_selecting (after upload original)
    └─ Create PhotoSelection(is_selected=false) for each Photo

T3: Clients select/unselect (can toggle freely)
    └─ Update PhotoSelection.is_selected

T4: Client confirms selection
    ├─ Lock all PhotoSelection rows
    ├─ INSERT SelectionSnapshot (immutable copy)
    └─ Mark locked = true

T5+: Client cannot select new, only unselect (after confirm)
     └─ Allowed: is_selected true → false
     └─ Blocked: is_selected false → true
```

### Validation Logic:

```python
def validate_selection_change(photo_id, new_is_selected, project_status):
    if project_status == "draft":
        raise Exception("Project not ready")
    
    if project_status == "client_selecting":
        return True  # Allow any change
    
    if project_status == "pending_edit":
        # Get current selection
        current_selection = PhotoSelection.get(photo_id)
        
        if current_selection.is_selected == True and new_is_selected == False:
            return True  # Allow unselect
        
        if current_selection.is_selected == False and new_is_selected == True:
            raise Exception("Cannot select new photo after confirm")
        
        return False  # Same value, no change needed
    
    if project_status in ["client_review", "completed"]:
        raise Exception("Selection locked, cannot modify")
```

---

## 11. Photographer Edit Authorization (Chi Tiết)

### Rule: Photographer can only edit rejected photos, NOT approved

**Approval Status Table:**

```
PhotoApprovalStatus
├── id: UUID
├── photo_id: UUID (FK)
├── review_round: Integer (1, 2, 3...)
├── approval_status: ENUM(pending, approved, rejected)
├── approved_at: DateTime (NULL if pending/rejected)
├── rejected_at: DateTime (NULL if pending/approved)
└── rejection_comments: String[] (array of rejection comments)
```

**Upload Validation:**

```python
def validate_edited_upload(zip_files, project_id):
    selected_photos = get_selected_photos(project_id)
    
    for filename in zip_files:
        photo = Photo.get_by_filename(filename, project_id)
        
        if photo is None:
            skip(filename, "Photo not found")
            continue
        
        if photo not in selected_photos:
            skip(filename, "Photo not selected")
            continue
        
        # NEW: Check approval status from PREVIOUS review round
        approval_status = PhotoApprovalStatus.get_latest(photo.id)
        
        if approval_status and approval_status.approval_status == "approved":
            skip(filename, "Photo already approved, cannot edit")
            continue
        
        # OK to process
        process_upload(photo, filename)
```

---

## 12. Rejection & Re-edit Workflow (Chi Tiết)

### Scenario: 10 photos, 7 approved in Round 1, 3 rejected

**Round 1 Result:**
```
Photo 1: approved
Photo 2: approved
Photo 3: approved
Photo 4: approved
Photo 5: approved
Photo 6: approved
Photo 7: approved
Photo 8: rejected (comment: "Too dark")
Photo 9: rejected (comment: "Wrong white balance")
Photo 10: rejected (comment: "Blurry, please reshoot")
```

**System Action:**
1. Project → pending_edit
2. Photographer receives rejection summary:
   ```
   Rejected photos: 3
   - Photo 8 (image8.jpg): Too dark
   - Photo 9 (image9.jpg): Wrong white balance
   - Photo 10 (image10.jpg): Blurry, please reshoot
   
   Edit only these 3 photos. Do not modify approved photos.
   ```

**Round 2 Upload:**
- Photographer edits only Photo 8, 9, 10
- Optionally re-shoot Photo 10
- Create ZIP with: image8_edited.jpg, image9_edited.jpg, image10_v2.jpg
- Upload

**System Processing:**
- image8_edited.jpg → matches Photo 8 filename
  - Creates PhotoVersion(version_number=2) OR updates v1 (overwrite)
- image9_edited.jpg → matches Photo 9
- image10_v2.jpg → does NOT match Photo 10 filename (image10.jpg)
  - SKIP with reason "Filename mismatch, expected image10.jpg"
  - Photographer must re-upload with correct filename

**Round 2 Review:**
- Clients see Photos 1-7 locked (approved)
- Clients see Photos 8-10 with new edits
- Approve/reject again

---

## 13. Edge Cases & Error Handling (Chi Tiết)

### Edge Case 1: Photographer Upload with Special Characters

**Filename in ZIP: "image 1 (final).jpg"**
**Stored Original Filename: "image1.jpg"**

**System Response:** 409 Conflict (filename mismatch)
- Photographer must rename to match exactly
- Recommendation: provide filename template

### Edge Case 2: Client Approves Then Changes Mind

**Situation:**
- Photo 1: approved by Client A
- 2 hours later, Client A realizes mistake
- Wants to reject Photo 1

**MVP Rule:** NOT ALLOWED
- Once approved, locked
- Future: Add "withdraw approval" button

### Edge Case 3: Photographer Renames File Between Uploads

**Round 1:**
- Upload: image_dog.jpg

**Round 2:**
- Try to upload: dog_final.jpg (renamed)

**System Response:** Skip with reason "Filename mismatch"

### Edge Case 4: Duplicate Filenames in ZIP

**Round 2 Upload contains:**
- image1.jpg (first copy)
- image1.jpg (second copy, different content)

**System Behavior:**
- Process first occurrence
- Warn: "Duplicate filename in ZIP: image1.jpg (skipped 1 duplicate)"

### Edge Case 5: Zero Photos Selected

**Client Scenario:**
- Upload 10 photos
- Client select 0/10
- Try to confirm

**System Response:** 400 Bad Request
```json
{
  "code": "EMPTY_SELECTION",
  "message": "At least 1 photo must be selected"
}
```

### Edge Case 6: All Photos Unselected After Confirm

**Scenario:**
- Client confirms 5/10 selected
- Later: Client unselects all 5

**Result:**
- Project stuck in pending_edit
- 0 photos to edit
- Photographer has nothing to do

**Mitigation:**
- System prevents unselectting all (min 1 required)
- OR: Allow, photographer skip upload (soft complete)

### Edge Case 7: Photographer Never Uploads Edited

**Scenario:**
- Project stuck in pending_edit for 30 days
- Photographer disappeared

**MVP Handling:**
- No auto-timeout (manual admin intervention)
- Future: Timeout + auto-cancel project

---

## 14. Data Consistency Rules (Chi Tiết)

### Invariants (Must Always True):

1. **Project Status Invariant:**
   - Project.status ∈ {draft, client_selecting, pending_edit, client_review, completed}
   - No project outside this set

2. **Photo Selection Invariant:**
   - PhotoSelection exists ↔ Project.status ≥ client_selecting
   - If Project.status < client_selecting: NO PhotoSelection

3. **PhotoVersion Invariant:**
   - Each Photo has exactly 1 original (version_type=original, version_number=1)
   - Each Photo can have 0..∞ edited versions

4. **Approval Status Invariant:**
   - PhotoApprovalStatus exists ↔ Project.status ≥ client_review
   - Approval status ∈ {pending, approved, rejected}

5. **Comment Lock Invariant:**
   - Comment creation allowed ↔ Project.status ∈ {client_selecting, client_review}
   - Locked in pending_edit

6. **Selection Lock Invariant:**
   - PhotoSelection updateable ↔ Project.status = client_selecting
   - Locked in pending_edit (only unselect allowed, no select)
   - Locked in client_review, completed

### Enforcement Mechanisms:

```python
# Transaction wrapper
def transition_project_status(project_id, new_status):
    with db.transaction():
        project = Project.get_for_update(project_id)  # Pessimistic lock
        
        # Validate transition
        if not is_valid_transition(project.status, new_status):
            raise Exception("Invalid state transition")
        
        # Check invariants before commit
        validate_invariants(project_id)
        
        # Update
        project.status = new_status
        project.updated_at = now()
        db.commit()
```

---

## 15. Performance Considerations (Chi Tiết)

### Bottleneck 1: Large ZIP Upload

**Problem:**
- Photographer upload 50 photos × 5MB each = 250MB ZIP
- Slow network = timeout

**Mitigation:**
- Streaming ZIP parsing (don't load entire file to memory)
- Chunked upload (not MVP, Phase 2)
- Progress bar + ETA

### Bottleneck 2: Image Comparison (Original vs Edited)

**Problem:**
- Client toggle "Show Original" frequently
- 2 large images loaded simultaneously
- Browser memory bloat

**Mitigation:**
- Lazy load original (only when toggled)
- Client-side image optimization (resize)
- CDN + caching

### Bottleneck 3: Comment Thread Display

**Problem:**
- 50 photos × 10 comments each = 500 comments
- DOM rendering slow

**Mitigation:**
- Pagination (load 10 comments per scroll)
- Virtual scrolling (React/Vue windowing)
- Server-side filtering

### Database Indices (Critical):

```sql
CREATE INDEX idx_photo_project_id ON photo(project_id);
CREATE INDEX idx_photo_filename ON photo(project_id, filename);  -- For mapping
CREATE INDEX idx_photo_version_photo_id ON photo_version(photo_id);
CREATE INDEX idx_photo_selection_photo_id ON photo_selection(photo_id);
CREATE INDEX idx_photo_comment_photo_id ON photo_comment(photo_id);
CREATE INDEX idx_project_status ON project(status);  -- For state queries
CREATE INDEX idx_project_owner_id ON project(owner_id);  -- Photographer dashboard
```

---

## 16. API Rate Limiting & Quotas (Chi Tiết)

### Per-Project Quotas:

| Metric | Free | Future-Paid |
|--------|------|-------------|
| Max photos per project | Unlimited (MVP) | Unlimited |
| Max file size per image | 50MB | 100MB |
| Max ZIP per upload | 1GB | 10GB |
| Max edit rounds | Unlimited | 10 |
| Max comments per photo | Unlimited | Unlimited |
| Download retention | Permanent | Permanent |

### Rate Limiting:

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /upload | 5 requests | 1 minute (prevent spam) |
| POST /comment | 20 requests | 1 minute |
| POST /approve | 50 requests | 1 minute |
| GET /download | 1 request/hour per IP | 1 hour (prevent abuse) |

---

## 17. Error Codes Reference (Chi Tiết)

```
1xx: Informational
  100: OK

2xx: Success
  200: OK
  201: Created
  204: No Content

4xx: Client Error
  400: Bad Request (validation failed)
  401: Unauthorized (auth required)
  403: Forbidden (permission denied)
  404: Not Found (resource missing)
  409: Conflict (state/version mismatch)
  422: Unprocessable Entity (validation error)
  429: Too Many Requests (rate limit)

5xx: Server Error
  500: Internal Server Error
  502: Bad Gateway
  503: Service Unavailable
  504: Gateway Timeout

Custom Codes:
  ERR_EMPTY_SELECTION: At least 1 photo required
  ERR_FILENAME_MISMATCH: Filename doesn't match any selected photo
  ERR_ALREADY_APPROVED: Photo already approved, cannot edit
  ERR_COMMENT_REQUIRED: Comment required when rejecting
  ERR_INVALID_TRANSITION: State transition not allowed
  ERR_SELECTION_LOCKED: Selection is locked, cannot modify
  ERR_VERSION_MISMATCH: Concurrent modification detected
```



---

## 6. Version Visibility

| Client View | Detail |
| --- | --- |
| Original | Hidden, toggle "Show original" để compare |
| Latest Edited | Mặc định hiển thị |
| Older Edited | NOT visible (v1, v2 khác v[max] không thấy) |

---

## 7. Permissions (Không Thương Lượng)

| Action | Photographer | Clients |
| --- | --- | --- |
| Upload original | ✅ | ❌ |
| Upload edited | ✅ | ❌ |
| Select photo | ❌ | ✅ |
| Comment | ❌ | ✅ |
| Approve | ❌ | ✅ |
| Request edit | ❌ | ✅ |
| View comment | ✅ | ✅ |
| Delete photo | ❌ | ❌ |

---

## 8. Storage & Tech

* **Image storage**: S3 / R2
* **Backend**: FastAPI
* **Database**: MySQL (per dbcontext.md)
* **Auth**: Google OAuth (photographer) + token (client)

---

## 9. Data Retention

* **Vĩnh viễn**: photos, versions, comments, notes
* Không xoá project (soft delete chỉ áp dụng nếu expand scope)
* Photographer không thể xoá project trong MVP

---

## 10. Blind Spots & Technical Debt (Chấp Nhận)

### 1. Filename Mapping = Single Point of Failure

**Risk**: Client rename file → mapping toang

**Mitigation (Phase MVP)**:
* Validate filename trong Zip trước processing
* Return error list nếu filename không match

**Future fix (Phase 2+)**:
* Content-based hash matching
* Fuzzy match with confirmation

---

### 2. Loop Vô Hạn = Time Sink

**Risk**: Photographer + client lặp edit mãi không xong

**Mitigation (Phase MVP)**:
* Photographer có thể view edit history
* Client có thể view all versions (không implement)

**Future fix (Phase 2+)**:
* Max edit round limit (ví dụ: 5 lần)
* Auto-timeout nếu project chưa complete trong 30 ngày

---

### 3. Unselected Photo Orphan

**Risk**: Photographer upload hình không được select, mãi trong DB

**Mitigation (Phase MVP)**:
* Photographer xem unselected list
* Có thể re-upload edited cho unselected (logic chưa clear)

**Future fix (Phase 2+)**:
* Auto-archive unselected hình sau 30 ngày

---

### 4. Concurrent Client Edit

**Risk**: Nhiều client edit selection đồng thời → race condition

**Mitigation (Phase MVP)**:
* Optimistic locking (version field)
* Last-write-wins (acceptable MVP risk)

**Future fix (Phase 2+)**:
* Pessimistic locking
* Conflict resolution UI

---

### 5. Notification Absent

**Risk**: Photographer không biết khi nào client approve, request edit

**Mitigation (Phase MVP)**:
* In-app notification chỉ
* Polling every X second (client-side)

**Future fix (Phase 2+)**:
* WebSocket real-time
* Email notification

---

## 11. MVP Success Criteria (Không Đạt = Fail)

* 1 project full loop (select → approve → complete) < **15 phút thao tác**
* Photographer **không cần hướng dẫn** về filename mapping
* Clients **không hỏi "bước tiếp theo là gì"**
* Filename mapping **100% accurate** (không miss)
* State transition **rõ ràng** (UI hiển thị status clear)
* Download Zip **chỉ chứa approved hình + latest edited**

---

## 12. Explicitly Out of Scope (Khóa Cứng)

❌ Multiple photographer (co-ownership)
❌ Photographer comment / collaborate
❌ Client account / history
❌ Version compare UI
❌ AI assist
❌ Watermark
❌ Annotation tool
❌ Admin role (Phase 2+)
❌ Payment / subscription (Phase 2+)
❌ Notification email (Phase 2+)
❌ Mobile app
❌ Offline editing

---

## 13. API Contract Preview

### Photographer

```
POST /be/projects                    (tạo project)
POST /be/projects/{id}/upload        (upload original hình)
POST /be/projects/{id}/edited        (upload edited hình Zip)
GET  /be/projects/{id}               (xem project detail + state)
GET  /be/projects                    (list projects)
```

### Client (Guest)

```
GET  /be/client/projects/{token}     (xem project + hình)
POST /be/client/projects/{token}/select     (update selection)
POST /be/client/projects/{token}/comment    (add comment)
POST /be/client/projects/{token}/approve    (approve hình)
POST /be/client/projects/{token}/reject     (reject + comment)
POST /be/client/projects/{token}/confirm    (confirm selection)
GET  /be/client/projects/{token}/download   (download link)
```

---

## 14. Database Schema (Per dbcontext.md Update Required)

Thêm/update từ dbcontext.md đã tạo:

**New tables:**
- ProjectNote (mới)

**Existing tables (đã có):**
- User
- Project
- Photo
- PhotoVersion
- PhotoSelection
- PhotoComment

---

## 15. Frontend Flow (High-Level)

### Photographer Dashboard

* List projects (status badge)
* Create project
* View project → upload original
* View project → view clients feedback
* View project → upload edited

### Client Portal (Token-based)

* View project (selected hình only)
* Toggle original
* Select/unselect
* Comment (optional)
* Confirm selection
* Review edited → approve/reject
* Download (completed project)

---

## 16. Bước Tiếp Theo (Lựa 1, Tôi Làm Tiếp)

1. **API endpoints FastAPI** (photographer + client routes)
2. **Database migration** (create tables từ models)
3. **Frontend page layout** (photographer dashboard + client portal)
4. **Business logic layer** (service layer cho state machine)

Chọn 1.
