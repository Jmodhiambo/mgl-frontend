/**
 * Organizer User API Module
 */

import api from '../../auth/axiosConfig'
import type { Organizer, OrganizerCreate, OrganizerUpdate } from '@shared/types/User'

// Create a new organizer
export const upgradeUserToOrganizer = async (data: OrganizerCreate): Promise<Organizer> => {
  const response = await api.patch<Organizer>(`/organizers/me/promote`, data)
  return response.data
}

// Get organizer details by user ID
export const getOrganizerByUserId = async (): Promise<Organizer> => {
  const response = await api.get<Organizer>(`/organizers/me/profile`)
  return response.data
}

// Update organizer details
export const updateOrganizer = async (data: OrganizerUpdate): Promise<Organizer> => {
  const response = await api.put<Organizer>(`/organizers/me/profile-update`, data)
  return response.data
}

export const deleteOrganizerProfilePicture = async (): Promise<void> => {
  await api.delete<void>(`/organizers/me/profile-picture`)
}