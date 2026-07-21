// src/shared/api/user/ticketTypeService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Ticket type API calls — user, organizer, and admin scopes.
//
// NOTE: The user app's eventService.ts already has getTicketTypesByEvent().
// That function is intentionally kept there for co-location with event fetching.
// This service covers organizer CRUD and admin read/management.
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';
import type { 
  TicketTypeCreate, TicketTypeUpdate, TicketTypeOrganizerOut, TicketTypeAdminOut
} from '@shared/types/Event';

// ── User (public read) ────────────────────────────────────────────────────────
// getTicketTypesByEvent lives in @user/services/eventService — left there
// intentionally for co-location. Import from there in user-app pages.

// ── Organizer ─────────────────────────────────────────────────────────────────

export const organizer_getEventTicketTypes = async (
  eventId: number,
): Promise<TicketTypeOrganizerOut[]> => {
  return (
    await api.get(`/organizers/me/events/${eventId}/ticket-types`)
  ).data;
};

export const organizer_getTicketTypeById = async (
  ticketTypeId: number,
): Promise<TicketTypeOrganizerOut> => {
  return (
    await api.get(`/organizers/me/ticket-types/${ticketTypeId}`)
  ).data;
};

export const organizer_createTicketType = async (
  eventId: number,
  data: TicketTypeCreate,
): Promise<TicketTypeOrganizerOut> => {
  return (
    await api.post(`/organizers/me/events/${eventId}/ticket-types`, data)
  ).data;
};

export const organizer_updateTicketType = async (
  ticketTypeId: number,
  data: TicketTypeUpdate,
): Promise<TicketTypeOrganizerOut> => {
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
): Promise<TicketTypeAdminOut[]> => {
  return (
    await api.get(`/admin/events/${eventId}/ticket-types`)
  ).data;
};

export const admin_getTicketTypeById = async (
  ticketTypeId: number,
): Promise<TicketTypeAdminOut> => {
  return (await api.get(`/admin/ticket-types/${ticketTypeId}`)).data;
};

export const admin_createTicketType = async (
  data: TicketTypeCreate,
): Promise<TicketTypeAdminOut> => {
  return (await api.post('/admin/ticket-types', data)).data;
};

export const admin_updateTicketType = async (
  ticketTypeId: number,
  data: TicketTypeUpdate,
): Promise<TicketTypeAdminOut> => {
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