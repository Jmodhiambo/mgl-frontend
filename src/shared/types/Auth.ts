/**
 * Authentication Types
 */

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterUserInfo {
    name: string;
    email: string;
    phone_number: string;
    password: string;
}

export interface RegisterResponse {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    role: string;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    login: (accessToken: string) => void;
    logout: () => Promise<void>;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
  }

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
  }

export interface ReactivateAccountResponse {
    success: boolean;
    message: string;
  }

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
