// src/shared/api/emailVerificationApi.ts
/**
 * Email Verification API Module
 */

import api from '@shared/auth/axiosConfig';

export interface VerificationResponse {
    success: boolean;
    message: string;
    user?: {
        email: string;
        name: string;
    };
}

export interface EmailVerificationRequest {
    token: string;
}

export interface EmailResendRequest {
    email: string;
}

export interface EmailResendResponse {
    success: boolean;
    message: string;
}

/**
 * Verify email with token
 * Throws error for 410 (expired) and 400 (invalid) status codes
 */
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

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (
    email: string
): Promise<EmailResendResponse> => {
    const response = await api.post<EmailResendResponse>(
        '/auth/resend-verification',
        { email }
    );
    return response.data;
};