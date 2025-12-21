/**
 * User API Module
 */

import api from '../axiosConfig';
import type { User, UserPasswordChange, UserPasswordUpdate, UserUpdate } from '../../types/User';

// Get user by ID
export const getUserById = async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
}

// Update user details
export const updateUserContact = async (userData: UserUpdate): Promise<User> => {
    const response = await api.patch(`/users/me/contact`, userData);
    return response.data;
}

// Update user password
export const updateUserPassword = async (passwordData: UserPasswordUpdate): Promise<void> => {
    await api.patch(`/users/me/password`, passwordData);
}

// Change user password
export const changeUserPassword = async (passwordData: UserPasswordChange): Promise<void> => {
    await api.post(`/users/me/change-password`, passwordData);
}

// Deactivate user account
export const deactivateUserAccount = async (): Promise<void> => {
    await api.delete(`/users/me/deactivate`);
}

// Reactivate user account
export const reactivateUserAccount = async (): Promise<void> => {
    await api.post(`/users/me/reactivate`);
}

// Verify user email
export const verifyUserEmail = async (token: string): Promise<void> => {
    await api.post(`/users/me/verify-email`, { token });
}