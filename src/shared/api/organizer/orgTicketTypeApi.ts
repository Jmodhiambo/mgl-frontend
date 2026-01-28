/**
 * Organizer Booking API Module
 */

import api from '@shared/api/axiosConfig';
import type { TicketType } from '@shared/types/TicketType';


// Create a new ticket type
export const createTicketType = async (eventId: number, data: TicketType): Promise<TicketType> => {
  const response = await api.post<TicketType>(`/organizers/me/events/${eventId}/ticket-types`, data);
  return response.data;
};


// Get ticket types for an event
export const getTicketTypes = async (eventId: number): Promise<TicketType[]> => {
  const response = await api.get<TicketType[]>(`/organizers/me/events/${eventId}/ticket-types`);
  return response.data;
};

// Get a Ticket Type by ID
export const getTicketType = async (ticketTypeId: number): Promise<TicketType> => {
  const response = await api.get<TicketType>(`/organizers/me/ticket-types/${ticketTypeId}`);
  return response.data;
};

// Update a ticket type
export const updateTicketType = async (eventId: number, ticketTypeId: number, data: TicketType): Promise<TicketType> => {
  const response = await api.put<TicketType>(`/organizers/me/events/${eventId}/ticket-types/${ticketTypeId}`, data);
  return response.data;
};

// Delete a ticket type
export const deleteTicketType = async (eventId: number, ticketTypeId: number): Promise<TicketType> => {
  const response = await api.delete<TicketType>(`/organizers/me/events/${eventId}/ticket-types/${ticketTypeId}`);
  return response.data;
};