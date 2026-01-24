/**
 * Organizer Event API Module
 */

import api from '@shared/api/axiosConfig'
import type { OrganizerEventsResponse as Organizer, EventCreate, EventUpdate, EventStatus } from '@shared/types/Event'

// Create a new event
export const createEvent = async (data: EventCreate): Promise<Organizer> => {
  const response = await api.post<Organizer>(`/organizers/me/events`, data)
  return response.data
}

// Get events by organizer ID
export const getOrganizerEvents = async (): Promise<Organizer> => {
  const response = await api.get<Organizer>(`/organizers/me/events`)
  return response.data
}

// Update an existing event
export const updateEvent = async (eventId: number, data: EventUpdate): Promise<Organizer> => {
  const response = await api.put<Organizer>(`/organizers/me/events/${eventId}`, data)
  return response.data
}

// Update event status -> "upcoming" | "ongoing" | "completed" | "cancelled" | "deleted"
export const updateEventStatus = async (eventId: number, status: EventStatus): Promise<Organizer> => {
  const response = await api.patch<Organizer>(`/organizers/me/events/${eventId}`, status)
  return response.data
}

// Get total number of events by organizer ID
export const getTotalEventsCountByOrganizerId = async (): Promise<number> => {
  const response = await api.get(`/organizers/me/events/count`)
  return response.data.count
}