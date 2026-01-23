/**
 * Authentication API Module
 */

import api from '@shared/api/axiosConfig';
import type { LoginCredentials, LoginResponse, RegisterUserInfo, RegisterResponse, EmailResendResponse } from '@shared/types/Auth';
import type { ForgotPasswordResponse, ResetPasswordResponse, ReactivateAccountResponse, VerificationResponse } from '@shared/types/Auth';

// Login function
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // using URLSearchParams for form data as OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();

    formData.append('username', credentials.email); // maps email to username
    formData.append('password', credentials.password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
};

// Registration function
export const registerUser = async (userInfo: RegisterUserInfo): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', userInfo);
    return response.data;
};

// Logout function
export const logoutUser = async (): Promise<void> => {
    await api.post('/auth/logout');
};

// Forgot password function
export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

// Reset password function
export const resetPassword = async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
};

// Verify email function
export const verifyUserEmail = async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
};

// Reactivate account function
export const reactivateUserAccount = async (email: string): Promise<ReactivateAccountResponse> => {
    const response = await api.post(`/auth/reactivate`, { email });
    return response.data;
}

// Deactivate user account
export const deactivateUserAccount = async (): Promise<void> => {
    await api.patch(`/auth/deactivate`);
}

// Email verification
export const emailVerification = async (
    verificationToken: string
): Promise<VerificationResponse> => {
    // Send token in request body, not params
    const response = await api.post<VerificationResponse>(
        `/auth/verify-email`,
        { token: verificationToken }  // Send in body
    );
    return response.data;
};

// Resend verification email
export const resendVerificationEmail = async (
    email: string
): Promise<EmailResendResponse> => {
    const response = await api.post<EmailResendResponse>(
        '/auth/resend-verification',
        { email }
    );
    return response.data;
};