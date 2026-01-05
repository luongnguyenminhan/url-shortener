import axiosInstance from '@/config/axiosInstance';
import type { PhotoWithVersions } from '@/types/photo.type';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.type';

const BASE_URL = '/v1/photos';

export const photoService = {
    // Get all photos for a project
    getPhotosByProject: async (
        projectId: string,
        params?: PaginationParams
    ): Promise<PaginatedResponse<PhotoWithVersions>> => {
        const response = await axiosInstance.get<PaginatedResponse<PhotoWithVersions>>(
            `${BASE_URL}`,
            { params: { ...params, project_id: projectId } }
        );
        return response.data;
    },

    // Get single photo with versions
    getPhotoById: async (id: string): Promise<PhotoWithVersions> => {
        const response = await axiosInstance.get<ApiResponse<PhotoWithVersions>>(`${BASE_URL}/${id}`);
        return response.data.data!;
    },

    // Upload photos to project
    uploadPhotos: async (projectId: string, files: File[]): Promise<PhotoWithVersions[]> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await axiosInstance.post<ApiResponse<PhotoWithVersions[]>>(
            `/v1/projects/${projectId}/photos/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
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
    toggleSelection: async (id: string, isSelected: boolean): Promise<PhotoWithVersions> => {
        const response = await axiosInstance.patch<ApiResponse<PhotoWithVersions>>(
            `${BASE_URL}/${id}/select`,
            { is_selected: isSelected }
        );
        return response.data.data!;
    },
};
