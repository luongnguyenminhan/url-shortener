import axiosInstance from "../config/axiosInstance";

export interface User {
    id: string;
    email: string;
    name: string | null;
    google_uid?: string;
    created_at?: string;
    updated_at?: string;
}

interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: TokenResponse;
    };
}

interface CurrentUserResponse {
    success: boolean;
    message: string;
    data: User;
}

export const authService = {
    loginWithFirebase: async (idToken: string) => {
        const response = await axiosInstance.post<LoginResponse>("/v1/auth/firebase/login", {
            id_token: idToken,
        });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await axiosInstance.get<CurrentUserResponse>("/v1/me");
        return response.data;
    },
};
