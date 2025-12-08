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