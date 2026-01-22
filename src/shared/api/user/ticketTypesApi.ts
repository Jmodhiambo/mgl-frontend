/**
 * User Ticket Types API Module
 */

import api from '@shared/api/axiosConfig';
import type { TicketType } from "@shared/types/TicketType";

// Get all Ticket Types for an Event
export const getTicketTypes = async (eventId: number): Promise<TicketType[]> => {
  const response = await api.get<TicketType[]>(`/events/${eventId}/ticket-types`);
  return response.data;
};

// Get a Ticket Type by ID
export const getTicketType = async (ticketTypeId: number): Promise<TicketType> => {
  const response = await api.get<TicketType>(`/ticket-types/${ticketTypeId}`);
  return response.data;
};