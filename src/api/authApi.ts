/**
 * Authentication API Module
 */

import api from './axiosConfig';
import type { LoginCredentials, LoginResponse, RegisterUserInfo, RegisterResponse } from '../types/Auth';

// Login function
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // using URLSearchParams for form data as OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();

    formData.append('username', credentials.email); // maps email to username
    formData.append('password', credentials.password);

    const response = await api.post<LoginResponse>('/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
};

// Registration function
export const registerUser = async (userInfo: RegisterUserInfo): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/register', userInfo);
    return response.data;
};

// Logout function
export const logoutUser = async (): Promise<void> => {
    await api.post('/logout');
};