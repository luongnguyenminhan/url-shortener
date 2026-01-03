export const ProjectStatus = {
    DRAFT: 'draft',
    CLIENT_SELECTING: 'client_selecting',
    PENDING_EDIT: 'pending_edit',
    CLIENT_REVIEW: 'client_review',
    COMPLETED: 'completed',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export interface ProjectBase {
    title: string;
    client_notes?: string | null;
}

export interface ProjectCreate {
    title: string;
    status?: ProjectStatus;
    expired_days?: number;
}

export interface ProjectUpdate {
    title?: string;
    status?: ProjectStatus;
    client_notes?: string | null;
    expired_date?: string | null;
}

export interface ProjectStatusUpdate {
    status: ProjectStatus;
}

export interface ProjectResponse extends ProjectBase {
    id: string;
    owner_id: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectDetailResponse extends ProjectResponse { }

export interface ProjectListResponse {
    total: number;
    items: ProjectResponse[];
}

export interface ProjectCreateToken {
    project_id: string;
    expires_in_days?: number;
}

export interface VerifyProjectToken {
    token: string;
    password?: string;
}
