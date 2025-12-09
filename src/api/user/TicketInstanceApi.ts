/**
 * User Ticket Instance API Module
 */

import api from '../axiosConfig';
import type { TicketInstance } from '../../types/TicketInstance';

// Get all Ticket Instances for a User
export const getTicketInstances = async (userId: number): Promise<TicketInstance[]> => {
  const response = await api.get<TicketInstance[]>(`users/${userId}/ticket-instances`);
  return response.data;
}

// Get a Ticket Instance by ID
export const getTicketInstance = async (userId: number, id: number): Promise<TicketInstance> => {
  const response = await api.get<TicketInstance>(`users/${userId}/ticket-instances/${id}`);
  return response.data;
}