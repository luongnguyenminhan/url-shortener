import axiosInstance from '@/config/axiosInstance';
import type { Photo, PhotoUploadResponse, PhotoListMeta, PhotoComment } from '@/types/photo.type';
import type { ApiResponse } from '@/types/common.type';

const BASE_URL = '/be/api/v1/photos';

export const photoService = {
    // Get all photos for a project
    getPhotosByProject: async (
        projectId: string,
        params?: { page?: number; limit?: number; status?: 'origin' | 'selected' | 'edited'; sort_by?: string; sort_order?: 'asc' | 'desc'; search?: string }
    ): Promise<{ data: Photo[]; meta: PhotoListMeta }> => {
        const response = await axiosInstance.get<
            ApiResponse<Photo[]> & { meta: PhotoListMeta }
        >(`${BASE_URL}/projects/${projectId}`, { params });
        return {
            data: response.data.data || [],
            meta: response.data.meta!,
        };
    },

    // Get single photo image (returns blob URL with authentication)
    getPhotoImage: async (photoId: string, params?: { w?: number; h?: number; is_thumbnail?: boolean; version?: 'original' | 'edited' }): Promise<string> => {
        const query = new URLSearchParams();
        if (params?.w) query.append('w', params.w.toString());
        if (params?.h) query.append('h', params.h.toString());
        if (params?.is_thumbnail !== undefined) query.append('is_thumbnail', params.is_thumbnail.toString());
        if (params?.version) query.append('version', params.version);
        const queryString = query.toString();

        const response = await axiosInstance.get(
            `${BASE_URL}/${photoId}${queryString ? `?${queryString}` : ''}`,
            { responseType: 'blob' }
        );

        // Create a blob URL from the response
        return URL.createObjectURL(response.data);
    },

    // Upload original photo to project
    uploadPhoto: async (
        projectId: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<PhotoUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);

        const response = await axiosInstance.post<ApiResponse<PhotoUploadResponse>>(
            BASE_URL,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        return response.data.data!;
    },

    // Upload edited photo to project
    uploadEditedPhoto: async (
        projectId: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<PhotoUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);

        const response = await axiosInstance.post<ApiResponse<PhotoUploadResponse>>(
            `${BASE_URL}/edited`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        return response.data.data!;
    },

    // Get photo metadata with comments (authenticated)
    getPhotoMeta: async (photoId: string): Promise<Photo & { comments: PhotoComment[] }> => {
        const response = await axiosInstance.get<ApiResponse<Photo & { comments: PhotoComment[] }>>(
            `${BASE_URL}/${photoId}/meta`
        );
        return response.data.data!;
    },
};
