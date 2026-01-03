export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string | null;
    data?: T | null;
    errors?: string[] | null;
    meta?: Record<string, any> | null;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination?: PaginationMeta | null;
}

export interface PaginationParams {
    skip?: number;
    limit?: number;
    sort_key?: string;
    sort_dir?: 'asc' | 'desc';
    search?: string;
}
