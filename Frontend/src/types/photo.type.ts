export const VersionType = {
    ORIGINAL: 'original',
    EDITED: 'edited',
} as const;

export type VersionType = typeof VersionType[keyof typeof VersionType];

export interface Photo {
    id: string;
    filename: string;
    project_id: string;
    is_selected: boolean;
    is_approved: boolean;
    is_rejected: boolean;
    created_at: string;
    updated_at: string;
}

export interface PhotoVersion {
    id: string;
    photo_id: string;
    version_type: VersionType;
    image_url: string;
    created_at: string;
    updated_at: string;
}

export interface PhotoComment {
    id: string;
    photo_id: string;
    author_type: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface PhotoWithVersions extends Photo {
    photo_versions?: PhotoVersion[];
    photo_comments?: PhotoComment[];
}

export interface PhotoUploadResponse {
    photo: Photo;
    version: PhotoVersion;
}

export interface PhotoListMeta {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}
