import axiosInstance from '@/config/axiosInstance';
import type { PaginatedResponse, PaginationParams, ApiResponse } from '@/types/common.type';
import type { Photo } from '@/types/photo.type';

const BASE_URL = '/be/api/v1/photos-guest';

export interface PhotoGuestParams {
    project_token: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    status?: 'origin' | 'selected' | 'edited';
}

export interface SelectPhotoRequest {
    project_token: string;
    comment?: string;
}

export interface PhotoMetaResponse extends Photo {
    comments: Array<{
        id: string;
        photo_id: string;
        content: string;
        author_type: 'client' | 'admin';
        created_at: string;
        updated_at: string;
    }>;
}

export const photoGuestService = {
    // Get all photos in a project (guest access)
    getPhotos: async (params: PhotoGuestParams): Promise<PaginatedResponse<Photo>> => {
        const response = await axiosInstance.get<PaginatedResponse<Photo>>(BASE_URL, { params });
        return response.data;
    },

    // Get photo metadata with comments (guest access)
    getPhotoMeta: async (photoId: string, projectToken: string): Promise<PhotoMetaResponse> => {
        const response = await axiosInstance.get<ApiResponse<PhotoMetaResponse>>(
            `${BASE_URL}/${photoId}/meta`,
            { params: { project_token: projectToken } }
        );
        return response.data.data!;
    },

    // Select a photo (guest access)
    selectPhoto: async (photoId: string, data: SelectPhotoRequest): Promise<void> => {
        await axiosInstance.post(`${BASE_URL}/${photoId}/select`, data);
    },

    // Unselect a photo (guest access)
    unselectPhoto: async (photoId: string, data: SelectPhotoRequest): Promise<void> => {
        await axiosInstance.post(`${BASE_URL}/${photoId}/unselect`, data);
    },

    // Get photo image URL (guest access)
    getPhotoUrl: (photoId: string, projectToken: string, width?: number, height?: number, isThumbnail?: boolean, version?: 'original' | 'edited'): string => {
        const params = new URLSearchParams({ project_token: projectToken });
        if (width) params.append('w', width.toString());
        if (height) params.append('h', height.toString());
        if (isThumbnail !== undefined) params.append('is_thumbnail', isThumbnail.toString());
        if (version) params.append('version', version);

        // Use relative URL that will work with axiosInstance's baseURL
        const baseUrl = axiosInstance.defaults.baseURL || '';
        return `${baseUrl}${BASE_URL}/${photoId}?${params.toString()}`;
    },
};
