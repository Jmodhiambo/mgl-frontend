/**
 * Organizer Co-Organizer API Module
 */

import api from '@shared/api/axiosConfig';
import type { User as CoOrganizer } from '@shared/types/User';


// Create Co-Organizer
export const createCoOrganizer = async (email: string): Promise<CoOrganizer> => {
  const response = await api.post<CoOrganizer>(`/organizers/me/co-organizers`, { email })
  return response.data
}

// Get all Co-Organizers
export const getAllCoOrganizers = async (): Promise<CoOrganizer[]> => {
  const response = await api.get<CoOrganizer[]>(`/organizers/me/co-organizers`)
  return response.data
}

// Update Co-Organizer
export const updateCoOrganizer = async (coOrganizerId: number, data: CoOrganizer): Promise<CoOrganizer> => {
  const response = await api.put<CoOrganizer>(`/organizers/me/co-organizers/${coOrganizerId}`, data)
  return response.data
}

// Delete Co-Organizer
export const deleteCoOrganizer = async (coOrganizerId: number): Promise<void> => {
  await api.delete<void>(`/organizers/me/co-organizers/${coOrganizerId}`)
}