/**
 * Axios instance + interceptors 
 */

import axios, { AxiosError } from "axios";
import type {
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse
} from "axios";

// Base API URL from environment variables or default to localhost
const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

// In-memory storage for access token
let accessToken: string | null = null;

// Function to set access token in memory after login or refresh
export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

// Function to get current access token (useful for debugging)
export const getAccessToken = () => accessToken;

// Extend Axios request config to include retry flag
interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

// Refresh control flags to prevent race conditions
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Create an Axios instance with default configuration
const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,  // Sends HttpOnly cookies (refresh token) with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: adds Authorization header with access token to outgoing requests
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // Skip adding token for public auth endpoints
        if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
            return config;
        }

        // Add Bearer token to Authorization header if available
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Helper function to refresh the access token using refresh token cookie
const refreshAccessToken = async (): Promise<string> => {
    try {
        // Call refresh endpoint with HttpOnly cookie
        // Using base axios instance to avoid interceptor loops
        const response = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
        );

        // Extract and store new access token
        const newAccessToken = response.data.access_token;
        setAccessToken(newAccessToken);
        return newAccessToken;
    } catch (error) {
        // Refresh failed - clear token and redirect to login
        setAccessToken(null);

        // Redirect based on subdomain
        const currentDomain = window.location.hostname;
        if (currentDomain.includes('organizer')) {
            window.location.href = 'https://organizer.mgltickets.com/login';
        } else if (currentDomain.includes('admin')) {
            window.location.href = 'https://admin.mgltickets.com/login';
        } else {
            window.location.href = 'https://mgltickets.com/login';
        }
        throw error;
    }
};

// Response interceptor: handles 401 errors by refreshing token and retrying request
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryAxiosRequestConfig;

        // Check if this is a 401 error that should trigger token refresh
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&  // Haven't already retried this request
            !originalRequest.url?.includes('/auth/')  // Not an auth endpoint itself
        ) {
            originalRequest._retry = true;  // Mark request as retried

            // If a refresh is already in progress, wait for it to complete
            if (refreshPromise) {
                try {
                    const newAccessToken = await refreshPromise;
                    // Update original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }
                    // Retry the original request with new token
                    return api(originalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }

            // Start a new refresh process
            isRefreshing = true;
            refreshPromise = refreshAccessToken();

            try {
                const newAccessToken = await refreshPromise;
                // Update original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                // Retry the original request with new token
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            } finally {
                // Reset refresh flags
                isRefreshing = false;
                refreshPromise = null;
            }
        }

        // For all other errors, reject as normal
        return Promise.reject(error);
    }
);

export default api;