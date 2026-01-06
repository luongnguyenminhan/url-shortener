"""Photo download schemas - manifest and scripts"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PhotoManifestItem(BaseModel):
    """Single photo entry in manifest"""

    filename: str = Field(..., description="Photo filename")
    photo_comment: Optional[str] = Field(default=None, description="Latest comment from client")
    project_notes: Optional[str] = Field(default=None, description="Project-level notes from client")

    class Config:
        """Pydantic config"""

        from_attributes = True


class PhotoManifest(BaseModel):
    """Manifest containing selected photos metadata"""

    project_title: str = Field(..., description="Name of the project")
    total_selected: int = Field(..., description="Count of selected photos")
    photos: List[PhotoManifestItem] = Field(default_factory=list, description="List of selected photos")
    generated_at: datetime = Field(default_factory=datetime.utcnow, description="Manifest generation timestamp")

    class Config:
        """Pydantic config"""

        from_attributes = True


class ScriptTemplate(BaseModel):
    """Shell script template for organizing photos"""

    name: str = Field(..., description="Script environment (powershell, bash, zsh)")
    content: str = Field(..., description="Script content to copy-paste")
    extension: str = Field(..., description="File extension (.ps1, .sh)")

    class Config:
        """Pydantic config"""

        from_attributes = True


class PhotoDownloadScriptsResponse(BaseModel):
    """Response containing script templates for photo organization"""

    project_title: str = Field(..., description="Name of the project")
    scripts: List[ScriptTemplate] = Field(default_factory=list, description="List of script templates")
    csv_download_url: str = Field(..., description="URL to download CSV separately")

    class Config:
        """Pydantic config"""

        from_attributes = True
