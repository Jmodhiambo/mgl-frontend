/**
 * Organizer Event API Module
 */

import api from '../axiosConfig'
import type { OrganizerEventsResponse as Organizer, EventCreate, EventUpdate, EventStatus } from '../../types/Event'

// Create a new event
export const createEvent = async (organizerId: number, data: EventCreate): Promise<Organizer> => {
  const response = await api.post<Organizer>(`/organizers/${organizerId}/events`, data)
  return response.data
}

// Get events by organizer ID
export const getEventsByOrganizerId = async (organizerId: number): Promise<Organizer> => {
  const response = await api.get<Organizer>(`/organizers/${organizerId}/events`)
  return response.data
}

// Update an existing event
export const updateEvent = async (organizerId: number, eventId: number, data: EventUpdate): Promise<Organizer> => {
  const response = await api.put<Organizer>(`/organizers/${organizerId}/events/${eventId}`, data)
  return response.data
}

// Update event status -> "upcoming" | "ongoing" | "completed" | "cancelled" | "deleted"
export const updateEventStatus = async (organizerId: number, eventId: number, status: EventStatus): Promise<Organizer> => {
  const response = await api.patch<Organizer>(`/organizers/${organizerId}/events/${eventId}`, status)
  return response.data
}

// Get total number of events by organizer ID
export const getTotalEventsCountByOrganizerId = async (organizerId: number): Promise<number> => {
  const response = await api.get(`/organizers/${organizerId}/events/count`)
  return response.data.count
}