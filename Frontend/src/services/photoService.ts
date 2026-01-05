import axiosInstance from '@/config/axiosInstance';
import type { Photo, PhotoUploadResponse, PhotoListMeta } from '@/types/photo.type';
import type { ApiResponse } from '@/types/common.type';

const BASE_URL = '/be/api/v1/photos';

export const photoService = {
    // Get all photos for a project
    getPhotosByProject: async (
        projectId: string,
        params?: { page?: number; page_size?: number }
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
    getPhotoImage: async (photoId: string, params?: { w?: number; h?: number }): Promise<string> => {
        const query = new URLSearchParams();
        if (params?.w) query.append('w', params.w.toString());
        if (params?.h) query.append('h', params.h.toString());
        const queryString = query.toString();

        const response = await axiosInstance.get(
            `${BASE_URL}/${photoId}${queryString ? `?${queryString}` : ''}`,
            { responseType: 'blob' }
        );

        // Create a blob URL from the response
        return URL.createObjectURL(response.data);
    },

    // Upload single photo to project
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

    // Delete photo
    deletePhoto: async (id: string): Promise<void> => {
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    },

    // Toggle photo selection
    toggleSelection: async (id: string, isSelected: boolean): Promise<Photo> => {
        const response = await axiosInstance.patch<ApiResponse<Photo>>(
            `${BASE_URL}/${id}/select`,
            { is_selected: isSelected }
        );
        return response.data.data!;
    },
};
