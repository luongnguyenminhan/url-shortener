import axiosInstance from '@/config/axiosInstance';
import type {
    ProjectResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectDetailResponse
} from '@/types/project.type';
import type { PaginatedResponse, PaginationParams } from '@/types/common.type';

const BASE_URL = '/projects';

export const projectService = {
    // Get all projects with pagination
    getProjects: async (params?: PaginationParams): Promise<PaginatedResponse<ProjectResponse>> => {
        const response = await axiosInstance.get<PaginatedResponse<ProjectResponse>>(BASE_URL, { params });
        return response.data;
    },

    // Get single project by ID
    getProjectById: async (id: string): Promise<ProjectDetailResponse> => {
        const response = await axiosInstance.get<{ data: ProjectDetailResponse }>(`${BASE_URL}/${id}`);
        return response.data.data!;
    },

    // Create new project
    createProject: async (data: ProjectCreate): Promise<ProjectResponse> => {
        const response = await axiosInstance.post<{ data: ProjectResponse }>(BASE_URL, data);
        return response.data.data!;
    },

    // Update project
    updateProject: async (id: string, data: ProjectUpdate): Promise<ProjectResponse> => {
        const response = await axiosInstance.patch<{ data: ProjectResponse }>(`${BASE_URL}/${id}`, data);
        return response.data.data!;
    },

    // Delete project
    deleteProject: async (id: string): Promise<void> => {
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    },

    // Create project token
    createProjectToken: async (projectId: string, expiresInDays: number): Promise<string> => {
        const response = await axiosInstance.post<{ data: { token: string } }>(`${BASE_URL}/create-project-token`, {
            project_id: projectId,
            expires_in_days: expiresInDays
        });
        return response.data.data.token;
    },
};
