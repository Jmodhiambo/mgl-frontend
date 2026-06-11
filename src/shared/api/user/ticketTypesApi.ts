// src/shared/services/ticketTypeService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Ticket type API calls — user, organizer, and admin scopes.
//
// NOTE: The user app's eventService.ts already has getTicketTypesByEvent().
// That function is intentionally kept there for co-location with event fetching.
// This service covers organizer CRUD and admin read/management.
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TicketTypeOut {
  id: number;
  event_id: number;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  total_quantity: number;      // the ceiling — never decrements
  quantity_available: number;  // computed: total_quantity - quantity_sold
  quantity_sold: number;
  created_at: string;
  updated_at: string;
}

export interface TicketTypeCreate {
  event_id: number;
  name: string;
  description?: string;
  price: number;
  is_active?: boolean;
  total_quantity: number;
}

export interface TicketTypeUpdate {
  name?: string;
  description?: string;
  price?: number;
  is_active?: boolean;
  total_quantity?: number;
}

// ── User (public read) ────────────────────────────────────────────────────────
// getTicketTypesByEvent lives in @user/services/eventService — left there
// intentionally for co-location. Import from there in user-app pages.

// ── Organizer ─────────────────────────────────────────────────────────────────

export const organizer_getEventTicketTypes = async (
  eventId: number,
): Promise<TicketTypeOut[]> => {
  return (
    await api.get(`/organizers/me/events/${eventId}/ticket-types`)
  ).data;
};

export const organizer_getTicketTypeById = async (
  ticketTypeId: number,
): Promise<TicketTypeOut> => {
  return (
    await api.get(`/organizers/me/ticket-types/${ticketTypeId}`)
  ).data;
};

export const organizer_createTicketType = async (
  eventId: number,
  data: TicketTypeCreate,
): Promise<TicketTypeOut> => {
  return (
    await api.post(`/organizers/me/events/${eventId}/ticket-types`, data)
  ).data;
};

export const organizer_updateTicketType = async (
  ticketTypeId: number,
  data: TicketTypeUpdate,
): Promise<TicketTypeOut> => {
  return (
    await api.put(`/organizers/me/ticket-types/${ticketTypeId}`, data)
  ).data;
};

export const organizer_deleteTicketType = async (
  ticketTypeId: number,
): Promise<{ detail: string }> => {
  return (
    await api.delete(`/organizers/me/ticket-types/${ticketTypeId}`)
  ).data;
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const admin_getEventTicketTypes = async (
  eventId: number,
): Promise<TicketTypeOut[]> => {
  return (
    await api.get(`/admin/events/${eventId}/ticket-types`)
  ).data;
};

export const admin_getTicketTypeById = async (
  ticketTypeId: number,
): Promise<TicketTypeOut> => {
  return (await api.get(`/admin/ticket-types/${ticketTypeId}`)).data;
};

export const admin_createTicketType = async (
  data: TicketTypeCreate,
): Promise<TicketTypeOut> => {
  return (await api.post('/admin/ticket-types', data)).data;
};

export const admin_updateTicketType = async (
  ticketTypeId: number,
  data: TicketTypeUpdate,
): Promise<TicketTypeOut> => {
  return (
    await api.put(`/admin/ticket-types/${ticketTypeId}`, data)
  ).data;
};

export const admin_deleteTicketType = async (
  ticketTypeId: number,
): Promise<{ detail: string }> => {
  return (
    await api.delete(`/admin/ticket-types/${ticketTypeId}`)
  ).data;
};