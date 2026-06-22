// src/shared/api/organizer/orgUserApi.ts

import api from '@shared/api/axiosConfig'
import type { Organizer, OrganizerCreate } from '@shared/types/User'

// Create a new organizer
export const upgradeUserToOrganizer = async (data: OrganizerCreate): Promise<Organizer> => {
  const response = await api.patch<Organizer>(`/organizers/me/promote`, data)
  return response.data
}

// Get organizer details by user ID
export const getOrganizerProfile = async (): Promise<Organizer> => {
  const response = await api.get<Organizer>(`/organizers/me`)
  return response.data
}

/**
 * Update organizer details.
 *
 * Backend route: PATCH /organizers/me/profile-update, multipart/form-data.
 * Pass a FormData object built by the caller (see Profile.tsx) — this
 * function does NOT construct the FormData itself, since the caller knows
 * which fields changed and whether a new profile picture was selected.
 *
 * Explicitly setting the multipart Content-Type header (rather than relying
 * on axios to infer it) avoids any ambiguity when FormData is passed through
 * an `any`-typed payload, which is how Profile.tsx currently calls this.
 */
export const updateOrganizerProfile = async (data: FormData): Promise<Organizer> => {
  const response = await api.patch<Organizer>(`/organizers/me/profile-update`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteOrganizerProfilePicture = async (): Promise<void> => {
  await api.delete<void>(`/organizers/me/profile-picture`)
}