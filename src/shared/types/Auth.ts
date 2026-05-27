/**
 * Authentication Types
 */

import type { User } from "@shared/types/User";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    session_id?: string;
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
    user: User | null;
    sessionId: string | null;
    login: (loginResponse: { access_token: string; session_id?: string }) => Promise<void>;
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

export interface RefreshSession {
  session_id: string;
  user_id: number;
  device_info: string | null;
  ip_address: string | null;
  location: string | null;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  revoked_at: string | null;
  replaced_by_sid: string | null;
  is_active: boolean;
}