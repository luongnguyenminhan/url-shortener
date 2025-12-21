/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';
import authApi from './auth';
import { loadRuntimeConfig } from '../../lib/utils/runtimeConfig';

const DEFAULT_API_BASE_URL = 'https://securescribe.wc504.io.vn/be/api';
const API_VERSION = 'v1';

let API_BASE_URL = DEFAULT_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/${API_VERSION}`,
});

// Initialize API configuration synchronously from window.__ENV__
export const initializeApiConfig = (): void => {
    try {
        const config = loadRuntimeConfig();

        if (config.API_ENDPOINT) {
            API_BASE_URL = config.API_ENDPOINT;
            axiosInstance.defaults.baseURL = `${API_BASE_URL}/${API_VERSION}`;
        }
    } catch (error) {
        console.warn('Failed to load API config, using default:', error);
        API_BASE_URL = DEFAULT_API_BASE_URL;
    }
};

// Auto-initialize on client-side
if (typeof window !== 'undefined') {
    initializeApiConfig();
}

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        let token: string | null = null;
        if (typeof window !== 'undefined') {
            token = window.localStorage.getItem('access_token');
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers["Access-Control-Allow-Origin"] = "*";
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Handle special message (existing behavior)
        try {
            const respData: any = error.response?.data;
            if (respData && typeof respData.message === 'string' && respData.message.includes('insufficient_fish_balance')) {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem('insufficient_fish_balance', '1');
                }
            }
        } catch (e) {
            console.warn('Error handling special message:', e);
        }

        // Refresh token handling on 401
        if (error.response?.status === 401 && typeof window !== 'undefined' && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh_token = window.localStorage.getItem('refresh_token');
                if (!refresh_token) throw new Error('NO_REFRESH_TOKEN');

                const resp = await authApi.refreshToken({ refresh_token });
                if (!resp.success || !resp.data) throw new Error('REFRESH_FAILED');
                const { access_token, refresh_token: new_refresh, expires_in } = resp.data;

                // Save tokens + set header
                const token_expires_at = Date.now() + expires_in * 1000;
                window.localStorage.setItem('access_token', access_token);
                window.localStorage.setItem('refresh_token', new_refresh || refresh_token);
                window.localStorage.setItem('token_expires_at', String(token_expires_at));
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                // Retry original request
                return axiosInstance(originalRequest);
            } catch (refreshErr) {
                // Refresh failed → logout and redirect to /{locale}/auth
                try {
                    window.localStorage.removeItem('access_token');
                    window.localStorage.removeItem('refresh_token');
                    window.localStorage.removeItem('token_expires_at');
                } catch (e) {
                    console.warn('Failed to clear tokens:', e);
                }
                try {
                    window.location.assign('/auth');
                } catch (e) {
                    console.warn('Failed to redirect:', e);
                }
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

export { API_BASE_URL, API_VERSION };
export default axiosInstance;
