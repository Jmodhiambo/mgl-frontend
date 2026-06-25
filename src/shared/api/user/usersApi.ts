/**
 * User API Module
 */

import api from '@shared/api/axiosConfig';
import type { User, UserPasswordChange, UserPasswordUpdate, UserUpdate } from '@shared/types/User';

// Get current user details
export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
}

// Get user by ID
export const getUserById = async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
}

// Update user contact details (name, phone_number)
export const updateUserContact = async (userData: UserUpdate): Promise<User> => {
    const response = await api.patch(`/users/me/profile-update`, userData);
    return response.data;
}

/**
 * Delete the current user's profile picture.
 * Backend route: DELETE /users/me/profile-picture
 *
 * Note: OrganizerProfileSetup (user app) uses deleteOrganizerProfilePicture
 * from orgUserApi instead, since organizers are scoped to /organizers/me/*.
 * This function is for non-organizer user contexts.
 */
export const deleteUserProfilePicture = async (): Promise<void> => {
    await api.delete<void>('/users/me/profile-picture');
}

// // Update user password
// export const updateUserPassword = async (passwordData: UserPasswordUpdate): Promise<void> => {
//     await api.patch(`/users/me/password`, passwordData);
// }

// Change user password
export const changeUserPassword = async (passwordData: UserPasswordChange): Promise<void> => {
    await api.patch(`/users/me/change-password`, passwordData);
}