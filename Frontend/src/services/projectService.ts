import axiosInstance from '@/config/axiosInstance';
import type {
    ProjectResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectDetailResponse,
    CreateProjectTokenRequest,
    ProjectTokenResponse,
    VerifyProjectTokenRequest,
    VerifyProjectTokenResponse
} from '@/types/project.type';
import type { PaginatedResponse, PaginationParams, ApiResponse } from '@/types/common.type';

const BASE_URL = '/be/api/v1/projects';

export const projectService = {
    // Get all projects with pagination
    getProjects: async (params?: PaginationParams): Promise<PaginatedResponse<ProjectResponse>> => {
        const response = await axiosInstance.get<PaginatedResponse<ProjectResponse>>(BASE_URL, { params });
        return response.data;
    },

    // Get single project by ID
    getProjectById: async (id: string): Promise<ProjectDetailResponse> => {
        const response = await axiosInstance.get<ApiResponse<ProjectDetailResponse>>(`${BASE_URL}/${id}`);
        return response.data.data!;
    },

    // Create new project
    createProject: async (data: ProjectCreate): Promise<ProjectResponse> => {
        const response = await axiosInstance.post<ApiResponse<ProjectResponse>>(BASE_URL, data);
        return response.data.data!;
    },

    // Update project
    updateProject: async (id: string, data: ProjectUpdate): Promise<ProjectResponse> => {
        const response = await axiosInstance.put<ApiResponse<ProjectResponse>>(`${BASE_URL}/${id}`, data);
        return response.data.data!;
    },

    // Delete project
    deleteProject: async (id: string): Promise<void> => {
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    },

    // Create project token for sharing
    createProjectToken: async (data: CreateProjectTokenRequest): Promise<ProjectTokenResponse> => {
        const response = await axiosInstance.post<ApiResponse<ProjectTokenResponse>>(`${BASE_URL}/create-project-token`, data);
        return response.data.data!;
    },

    // Get active project token
    getActiveProjectToken: async (projectId: string): Promise<ProjectTokenResponse | null> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ProjectTokenResponse>>(`${BASE_URL}/active-project-token/${projectId}`);
            return response.data.data!;
        } catch (error: any) {
            if (error?.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // Verify project token (guest access)
    verifyProjectToken: async (data: VerifyProjectTokenRequest): Promise<VerifyProjectTokenResponse> => {
        const response = await axiosInstance.post<ApiResponse<VerifyProjectTokenResponse>>(`${BASE_URL}/verify-project-token`, data);
        return response.data.data!;
    },
};
