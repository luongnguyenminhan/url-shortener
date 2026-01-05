"""Photo download service - manifest and script generation"""

import csv
import io
from datetime import datetime
from typing import List, Optional, Tuple
from uuid import UUID

from sqlmodel import Session, select

from app.models.photo import Photo
from app.models.photo_comment import PhotoComment
from app.models.project import Project
from app.schemas.photo_download import (
    PhotoDownloadScriptsResponse,
    PhotoManifest,
    PhotoManifestItem,
    ScriptTemplate,
)


def get_selected_photos_with_comments(db: Session, project_id: UUID) -> List[Tuple[Photo, Optional[PhotoComment]]]:
    """Get all selected photos with their latest comments"""
    statement = select(Photo).where((Photo.project_id == project_id) & (Photo.is_selected == True))
    selected_photos = db.exec(statement).all()

    result = []
    for photo in selected_photos:
        # Get latest comment for this photo
        comment_statement = select(PhotoComment).where(PhotoComment.photo_id == photo.id).order_by(PhotoComment.created_at.desc())
        latest_comment = db.exec(comment_statement).first()
        result.append((photo, latest_comment))

    return result


def build_photo_manifest(db: Session, project_id: UUID, current_user_id: UUID) -> PhotoManifest:
    """Build manifest with selected photos and metadata"""
    # Get project and verify ownership
    project = db.get(Project, project_id)
    if not project or project.owner_id != current_user_id:
        raise ValueError("Project not found or access denied")

    # Get selected photos with comments
    photos_with_comments = get_selected_photos_with_comments(db, project_id)

    # Build manifest items
    manifest_items = []
    for photo, comment in photos_with_comments:
        item = PhotoManifestItem(
            filename=photo.filename,
            photo_comment=comment.content if comment else None,
            project_notes=project.client_notes,
        )
        manifest_items.append(item)

    # Sort by filename for consistency
    manifest_items.sort(key=lambda x: x.filename)

    return PhotoManifest(
        project_title=project.title,
        total_selected=len(manifest_items),
        photos=manifest_items,
        generated_at=datetime.utcnow(),
    )


def generate_csv_content(manifest: PhotoManifest) -> str:
    """Generate CSV content from manifest"""
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Write header
    writer.writerow(["filename", "photo_comment", "project_notes"])

    # Write data rows
    for photo in manifest.photos:
        writer.writerow(
            [
                photo.filename,
                photo.photo_comment or "",
                photo.project_notes or "",
            ]
        )

    return output.getvalue()


def _build_powershell_script(selected_filenames: List[str]) -> str:
    """Build PowerShell script template"""
    selected_str = '", "'.join(selected_filenames)

    return f"""# Auto-generated script - move photos by selection status
# Project: {{PROJECT_TITLE}}
# Selected photos: {", ".join(selected_filenames) if selected_filenames else "none"}

$selectedPhotos = @("{selected_str}")

foreach ($file in Get-ChildItem -File) {{
    $ext = $file.Extension.ToUpper().TrimStart('.')

    if ($selectedPhotos -contains $file.Name) {{
        $targetDir = "Selected\\$ext"
    }} else {{
        $targetDir = "NotSelected\\$ext"
    }}

    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Move-Item -Path $file.FullName -Destination "$targetDir\\$($file.Name)" -Force
}}

Write-Host "Organization complete!"
"""


def _build_bash_script(selected_filenames: List[str]) -> str:
    """Build Bash script template"""
    selected_arr = " ".join(f'"{f}"' for f in selected_filenames)

    return f"""#!/bin/bash
# Auto-generated script - move photos by selection status
# Project: {{PROJECT_TITLE}}
# Selected photos: {", ".join(selected_filenames) if selected_filenames else "none"}

selected_photos=({selected_arr})

for file in *; do
    [ -f "$file" ] || continue

    ext="${{file##*.}}"
    ext="${{ext^^}}"

    if [[ " ${{selected_photos[@]}} " =~ " ${{file}} " ]]; then
        target_dir="Selected/$ext"
    else
        target_dir="NotSelected/$ext"
    fi

    mkdir -p "$target_dir"
    mv "$file" "$target_dir/$file"
done

echo "Organization complete!"
"""


def _build_zsh_script(selected_filenames: List[str]) -> str:
    """Build Zsh script template"""
    selected_arr = " ".join(f'"{f}"' for f in selected_filenames)

    return f"""#!/bin/zsh
# Auto-generated script - move photos by selection status
# Project: {{PROJECT_TITLE}}
# Selected photos: {", ".join(selected_filenames) if selected_filenames else "none"}

selected_photos=({selected_arr})

for file in *(D); do
    [[ -f "$file" ]] || continue

    ext="${{file##*.}}"
    ext="${{ext:u}}"

    if (( ${{+selected_photos[(r)${{file}}]}} )); then
        target_dir="Selected/$ext"
    else
        target_dir="NotSelected/$ext"
    fi

    mkdir -p "$target_dir"
    mv "$file" "$target_dir/$file"
done

echo "Organization complete!"
"""


def generate_script_templates(manifest: PhotoManifest) -> List[ScriptTemplate]:
    """Generate script templates with embedded filenames"""
    selected_filenames = [photo.filename for photo in manifest.photos]

    # Build scripts with embedded filenames
    scripts_content = {
        "powershell": _build_powershell_script(selected_filenames),
        "bash": _build_bash_script(selected_filenames),
        "zsh": _build_zsh_script(selected_filenames),
    }

    # Replace project title placeholder in all scripts
    for lang in scripts_content:
        scripts_content[lang] = scripts_content[lang].replace("{PROJECT_TITLE}", manifest.project_title)

    return [
        ScriptTemplate(name="powershell", content=scripts_content["powershell"], extension=".ps1"),
        ScriptTemplate(name="bash", content=scripts_content["bash"], extension=".sh"),
        ScriptTemplate(name="zsh", content=scripts_content["zsh"], extension=".sh"),
    ]


def build_photo_download_scripts_response(manifest: PhotoManifest, csv_url: str) -> PhotoDownloadScriptsResponse:
    """Build scripts response with templates"""
    scripts = generate_script_templates(manifest)

    return PhotoDownloadScriptsResponse(
        project_title=manifest.project_title,
        scripts=scripts,
        csv_download_url=csv_url,
    )
