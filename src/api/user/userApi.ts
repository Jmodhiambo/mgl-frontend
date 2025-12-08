/**
 * API module for handling user-related operations.
 */

import api from '../axiosConfig';
import type { User, UserPasswordChange, UserPasswordUpdate, UserUpdate, UserCreate } from '../../types/User';

// Register a new user
export const registerUser = async (userData: UserCreate): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
}

// Get user by ID
export const getUserById = async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
}

// Update user details
export const updateUserContact = async (userId: number, userData: UserUpdate): Promise<User> => {
    const response = await api.patch(`/users/${userId}/contact`, userData);
    return response.data;
}

// Update user password
export const updateUserPassword = async (userId: number, passwordData: UserPasswordUpdate): Promise<void> => {
    await api.patch(`/users/${userId}/password`, passwordData);
}

// Change user password
export const changeUserPassword = async (userId: number, passwordData: UserPasswordChange): Promise<void> => {
    await api.post(`/users/${userId}/change-password`, passwordData);
}

// Deactivate user account
export const deactivateUserAccount = async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}/deactivate`);
}

// Reactivate user account
export const reactivateUserAccount = async (userId: number): Promise<void> => {
    await api.post(`/users/${userId}/reactivate`);
}

// Verify user email
export const verifyUserEmail = async (userId: number, token: string): Promise<void> => {
    await api.post(`/users/${userId}/verify-email`, { token });
}