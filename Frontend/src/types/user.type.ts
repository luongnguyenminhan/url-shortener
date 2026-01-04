export interface User {
    id: string;
    google_uid: string;
    email: string;
    name?: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserCreate {
    google_uid: string;
    email: string;
    name?: string;
}

export interface UserUpdate {
    email?: string;
    name?: string;
}
