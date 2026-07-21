// src/apps/organizer/services/ticketTypeService.ts
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';
import type {
  TicketTypeOut
} from '@shared/types/Event';

// ─── Ticket payload types ──────────────────────────────────────────────────────

export interface CreateTicketTypePayload {
  name: string;
  description?: string;
  price: number;
  total_quantity: number;
  max_per_booking?: number;
}

export interface UpdateTicketTypePayload {
  name?: string;
  description?: string;
  price?: number;
  total_quantity?: number;
  max_per_booking?: number;
}

// ─── Ticket Types ─────────────────────────────────────────────────────────────

/**
 * List all ticket types for a specific event.
 * Used by: EventDetails.tsx (organizer) ticket types tab.
 */
export const getTicketTypesByEvent = async (
  eventId: number,
): Promise<TicketTypeOut[]> => {
  return (await api.get(`/organizers/me/events/${eventId}/ticket-types`)).data;
};

/**
 * Create a new ticket type for an event.
 * event_id comes from the URL path — the service layer injects it
 * into the payload before hitting the repo.
 */
export const createTicketType = async (
  eventId: number,
  payload: CreateTicketTypePayload,
): Promise<TicketTypeOut> => {
  return (
    await api.post(
      `/organizers/me/events/${eventId}/ticket-types`,
      payload,
    )
  ).data;
};

/**
 * Update an existing ticket type.
 */
export const updateTicketType = async (
  ticketTypeId: number,
  payload: UpdateTicketTypePayload,
): Promise<TicketTypeOut> => {
  return (
    await api.put(`/organizers/me/ticket-types/${ticketTypeId}`, payload)
  ).data;
};

/**
 * Delete a ticket type. If it has existing bookings the backend will
 * deactivate it instead and return a 400 — handle that in the UI.
 */
export const deleteTicketType = async (ticketTypeId: number): Promise<void> => {
  await api.delete(`/organizers/me/ticket-types/${ticketTypeId}`);
};