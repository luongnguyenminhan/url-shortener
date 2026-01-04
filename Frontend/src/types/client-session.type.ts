export interface ClientSession {
    id: string;
    token: string;
    project_id: string;
    expires_at?: string | null;
    is_active: boolean;
    last_accessed_at?: string | null;
    count_accesses: number;
    created_at: string;
    updated_at: string;
}

export interface ClientSessionCreate {
    project_id: string;
    password?: string;
    expires_in_days?: number;
}

export interface ClientSessionVerify {
    token: string;
    password?: string;
}
