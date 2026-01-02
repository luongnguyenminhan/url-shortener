# Database Schema - Photo Proofing Platform

Database diagram script for dbdiagram.io

```sql
// User Table - Photographers (authenticated via Google OAuth)
Table user {
  id BINARY(16) [pk]
  google_uid VARCHAR(255) [unique, not null]
  email VARCHAR(255) [not null]
  name VARCHAR(255)
  is_deleted BOOLEAN [default: false, not null]
  created_at TIMESTAMP [default: `CURRENT_TIMESTAMP`, not null]
  updated_at TIMESTAMP [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`, not null]
  
  Note: 'Photographers only. Clients are guest-only via token.'
}

// Project Table - Photo albums with state machine
Table project {
  id BINARY(16) [pk]
  owner_id BINARY(16) [ref: > user.id, not null, note: 'FK to photographer']
  title VARCHAR(255) [not null]
  status VARCHAR(50) [not null, note: 'draft | client_selecting | pending_edit | client_review | completed']
  client_notes TEXT [note: 'Client notes for the project (optional, max 1000 chars, immutable after pending_edit)']
  expired_date TIMESTAMP [note: 'Project auto-delete date after completion (NULL means permanent)']
  is_deleted BOOLEAN [default: false, not null]
  created_at TIMESTAMP [default: `CURRENT_TIMESTAMP`, not null]
  updated_at TIMESTAMP [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`, not null]

  Indexes {
    status
    owner_id
  }
}

// Photo Table - Logical photo entity (filename is contract)
Table photo {
  id BINARY(16) [pk]
  project_id BINARY(16) [ref: > project.id, not null, note: 'One project has many photos']
  filename VARCHAR(255) [not null, note: 'Immutable filename, case-sensitive']
  is_selected BOOLEAN [default: false, not null, note: 'Client selection state (locked after confirm)']
  is_approved BOOLEAN [default: false, not null, note: 'Photo approval status']
  is_rejected BOOLEAN [default: false, not null, note: 'Photo rejection status']
  is_deleted BOOLEAN [default: false, not null]
  created_at TIMESTAMP [default: `CURRENT_TIMESTAMP`, not null]
  updated_at TIMESTAMP [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`, not null]
  
  Indexes {
    (project_id, filename) [unique, note: 'Unique filename per project']
    project_id
    is_approved
    is_rejected
  }
}

// PhotoVersion Table - Original and edited versions
Table photo_version {
  id BINARY(16) [pk]
  photo_id BINARY(16) [ref: > photo.id, not null, note: 'One photo has many versions (original + edited)']
  version_type VARCHAR(20) [not null, note: 'original | edited']
  image_url VARCHAR(512) [not null, note: 'S3/R2 URL']
  is_deleted BOOLEAN [default: false, not null]
  created_at TIMESTAMP [default: `CURRENT_TIMESTAMP`, not null]
  updated_at TIMESTAMP [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`, not null]
  
  Note: 'Only 1 original per photo. Edited version gets updated (overwrite) when re-uploaded.'
  Indexes {
    photo_id
    (photo_id, version_type)
  }
}

// PhotoComment Table - Client comments on photos
Table photo_comment {
  id BINARY(16) [pk]
  photo_id BINARY(16) [ref: > photo.id, not null, note: 'One photo has many comments']
  author_type VARCHAR(20) [default: 'client', not null, note: 'Fixed to client only']
  content TEXT [not null, note: 'Max 500 chars']
  is_deleted BOOLEAN [default: false, not null]
  created_at TIMESTAMP [default: `CURRENT_TIMESTAMP`, not null]
  updated_at TIMESTAMP [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`, not null]
  
  Note: 'Photographer cannot comment. Rejection comments are regular comments.'
  Indexes {
    photo_id
    (photo_id, created_at)
  }
}

// ClientSession Table - Client access tokens with expiration
Table client_session {
  id BINARY(16) [pk]
  token VARCHAR(255) [unique, not null, note: 'Same as project.client_token']
  project_id BINARY(16) [ref: > project.id, not null, note: 'One project can have multiple sessions (future: different expiration times)']
  password_hash VARCHAR(255) [note: 'Hashed password for session access protection (optional, bcrypt)']
  expires_at TIMESTAMP [note: 'NULL for permanent tokens']
  is_active BOOLEAN [default: true, not null]
  is_deleted BOOLEAN [default: false, not null]
  created_at TIMESTAMP [default: `CURRENT_TIMESTAMP`, not null]
  updated_at TIMESTAMP [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`, not null]
  last_accessed_at TIMESTAMP [note: 'Track last access time']
  
  Indexes {
    token
    project_id
    (token, is_active)
  }
}
```

## Relationship Constraints (1-to-Many Mapping)

### One-to-Many Relationships

1. **User → Projects**
   - `user.id` → `project.owner_id` (one photographer owns many projects)
   - Symbol: `ref: > user.id`

2. **Project → Photos**
   - `project.id` → `photo.project_id` (one project contains many photos)
   - Symbol: `ref: > project.id`

3. **Photo → PhotoVersions**
   - `photo.id` → `photo_version.photo_id` (one photo has many versions: original + edited)
   - Symbol: `ref: > photo.id`

4. **Photo → PhotoComments**
   - `photo.id` → `photo_comment.photo_id` (one photo has many comments)
   - Symbol: `ref: > photo.id`

5. **Project → ClientSessions**
    - `project.id` → `client_session.project_id` (one project can have multiple sessions for expiration flexibility)
    - Symbol: `ref: > project.id`

### Relationship Symbols in dbdiagram.io

- `>` : One-to-Many (arrow points from one to many side)
- `<` : Many-to-One (reverse direction, same as `>`)
- `-` : One-to-One
- `<>`: Many-to-Many (not used in this schema)

## Key Constraints & Rules

### Foreign Key Cascade Rules

- All foreign keys use `ON DELETE CASCADE`
- Deleting a Project will cascade delete all related: Photos, PhotoVersions, PhotoComments, ClientSessions

### Unique Constraints

- `user.google_uid`: Unique Google user ID
- `project.client_token`: Unique client access token
- `photo(project_id, filename)`: Unique filename per project (case-sensitive)
- `client_session.token`: Unique session token

### Check Constraints (Application Level - MySQL doesn't support CHECK well)

- `project.status`: Must be one of: draft, client_selecting, pending_edit, client_review, completed
- `photo_version.version_type`: Must be one of: original, edited
- `photo.is_approved` and `photo.is_rejected`: Cannot both be true at the same time (enforced at application level)
- `photo_comment.author_type`: Must be 'client' (enforced at application level)

### Business Rules (Enforced at Application Level)

1. **PhotoVersion Rules:**
   - Each Photo must have exactly 1 `original` version (version_type='original')
   - Each Photo can have 0 or 1 `edited` version (version_type='edited')
   - When overwriting edited version, update existing record's `image_url` and `updated_at`
   - Do not create duplicate edited versions

2. **Photo Selection Rules:**
   - Selection field (`is_selected`) only used when `project.status >= client_selecting`
   - After confirm (project.status = pending_edit), selection is locked (can only unselect, not select new)

3. **PhotoComment Rules:**
   - Only clients can create comments (author_type = 'client')
   - Comments are locked when project.status = pending_edit
   - Rejection comments are regular PhotoComment records (no special type field)

4. **Photo Approval Status Rules:**
   - Approval status fields only populated when project enters client_review state
   - Approved photos cannot be edited in subsequent rounds (check is_approved = true)
   - `is_approved` and `is_rejected` cannot both be true at the same time
   - If both false, photo is pending approval
   - Rejection comments stored in photo_comment table

5. **ClientSession Rules:**
   - `token` field matches `project.client_token`
   - `expires_at = NULL` means permanent token (MVP default)
   - Track access via `last_accessed_at`

6. **Project Auto-Deletion Rules:**
   - When project status becomes `completed`, set `expired_date` if configured
   - Background job should periodically delete projects where `expired_date < NOW()`

### Indexes for Performance

Critical indexes included:

- `project(status)`: Filter projects by state
- `project(owner_id)`: Photographer dashboard queries
- `photo(project_id, filename)`: Filename mapping lookups
- `photo_version(photo_id, version_type)`: Get original/edited versions
- `photo_comment(photo_id, created_at)`: Comment threads
- `photo(is_approved)`: Filter approved photos
- `photo(is_rejected)`: Filter rejected photos
- `client_session(token, is_active)`: Token validation

## Notes

- All IDs use `BINARY(16)` for UUID storage (MySQL efficient UUID format)
- All timestamps use `TIMESTAMP` type
- Status fields use `VARCHAR` with application-level validation (MySQL ENUM limitations)
- Soft delete via `is_deleted` boolean (no `deleted_at` timestamp)
- All tables have `created_at` and `updated_at` timestamps
- Foreign keys use `ON DELETE CASCADE` for data consistency
