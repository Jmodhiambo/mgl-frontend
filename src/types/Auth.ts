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
    email: string;
    password: string;
    full_name?: string;
}

export interface RegisterResponse {
    id: number;
    email: string;
    full_name?: string;
}