/**
 * User Ticket Types API Module
 */

import api from '../axiosConfig';
import type { TicketType } from "../../types/TicketType";

// Get all Ticket Types for an Event
export const getTicketTypes = async (eventId: number): Promise<TicketType[]> => {
  const response = await api.get<TicketType[]>(`events/${eventId}/ticket-types`);
  return response.data;
};