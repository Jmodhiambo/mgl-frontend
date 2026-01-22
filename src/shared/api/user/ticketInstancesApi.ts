/**
 * User Ticket Instance API Module
 */

import api from '@shared/api/axiosConfig';
import type { TicketInstance } from '@shared/types/TicketInstance';

// Get all Ticket Instances for a User
export const getTicketInstances = async (): Promise<TicketInstance[]> => {
  const response = await api.get<TicketInstance[]>(`/users/me/ticket-instances`);
  return response.data;
}

// Get a Ticket Instance by ID
export const getTicketInstance = async (ti_id: number): Promise<TicketInstance> => {
  const response = await api.get<TicketInstance>(`/users/me/ticket-instances/${ti_id}`);
  return response.data;
}