import axios from "axios";

declare module "axios" {
    export interface AxiosRequestConfig {
        withoutToast?: boolean;
        _retry?: boolean;
    }
}


const options = {
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
};

const axiosInstance = axios.create(options);

const getAccessToken = () => localStorage.getItem("access_token");
// const getRefreshToken = () => localStorage.getItem("refresh_token");

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // console.log(`${config.method?.toUpperCase()} ${config.url}`);
    return config;
});

// Response interceptor with refresh token logic
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Check if error is due to expired token (e.g., 401 Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Not implementing refresh token flow yet as per instruction to focus on calling login first
                // But keeping the structure ready
                // For now, if 401, we might just redirect to login or let the app handle it

                /* 
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    // Clean up and Redirect to login
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                    return Promise.reject(error);
                }
                // ... refresh logic ...
                */

                // For this task, we assume if 401, the session is invalid.
                // The AuthContext will handle clearing state if getCurrentUser fails.
            } catch (refreshError) {
                // console.error("Token refresh failed:", refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;