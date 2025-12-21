/**
 * Axios instance + interceptors 
 */

import axios, { AxiosError } from "axios";
import type {
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse
} from "axios";

// Base URL
const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

// In-memory storage for access token
let accessToken: string | null = null;

// Function to set access token in memory after login or refresh
export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

// Axios types
interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

/* Refresh control (prevent race conditions). Avoid multiple refresh calls for 401 error incase of token issue. 
 Only one refresh is handled per request and the others are queued and retried with the retrieved token */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];  // Stores callbacks for request waiting on new token

// Subscribes token refresh by adding callback to queue to be called once new token is available
const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onRefreshed = (token: string): void => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];    
}

// Create an Axios instance with default configuration
const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,  // Sends HttpOnly cookies (refresh token)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
    
);

// Response interceptor: handles 401 errors (expired access token)
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async(error: AxiosError) => {
        const originalRequest = error.config as RetryAxiosRequestConfig;

        // If 401 and request hasn't been retried, retry with refresh token
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('auth/refresh')
        ) {
            originalRequest._retry = true;

            // Prevent multiple refreshes
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        resolve(api(originalRequest));  // Retry with new token

                    });
                });
            }

            isRefreshing = true;

            try {
                // Call refresh endpoint to get a new access token
                const response = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }  // Sends HttpOnly cookies (refresh token)
                );

                // Update access token in memory
                const newAccessToken = response.data.access_token;
                setAccessToken(newAccessToken);

                // Notify subscribers
                onRefreshed(newAccessToken);

                // Retry the original request with the new access token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed -> user must login again
                console.error('Error refreshing access token:', refreshError);
                setAccessToken(null);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }

);

export default api;