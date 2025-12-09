/**
 * Organizer User API Module
 */

import api from '../axiosConfig'
import type { Organizer, OrganizerCreate, OrganizerUpdate } from '../../types/User'

// Create a new organizer
export const upgradeUserToOrganizer = async (userId: number, data: OrganizerCreate): Promise<Organizer> => {
  const response = await api.patch<Organizer>(`/organizers/${userId}/promote`, data)
  return response.data
}

// Get organizer details by user ID
export const getOrganizerByUserId = async (userId: number): Promise<Organizer> => {
  const response = await api.get<Organizer>(`/organizers/${userId}/profile`)
  return response.data
}

// Update organizer details
export const updateOrganizer = async (userId: number, data: OrganizerUpdate): Promise<Organizer> => {
  const response = await api.put<Organizer>(`/organizers/${userId}/profile-update`, data)
  return response.data
}

export const deleteOrganizerProfilePicture = async (userId: number): Promise<void> => {
  await api.delete<void>(`/organizers/${userId}/profile-picture`)
}