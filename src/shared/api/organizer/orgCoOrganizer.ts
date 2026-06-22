// src/shared/api/organizer/orgCoOrganizer.ts
// ─────────────────────────────────────────────────────────────────────────────
// Co-organizer API calls for the organizer app.
//
// Endpoints:
//   POST   /organizers/me/events/{eventId}/co-organizers/{email}  → invite
//   GET    /organizers/me/co-organizers                           → list all (every event)
//   GET    /organizers/me/co-organizers/event/{eventId}           → list for one event
//   PATCH  /organizers/me/co-organizers/{id}                      → update create flag
//   DELETE /organizers/me/co-organizers/{id}                      → remove
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';
import type { CoOrganizer } from '@shared/types/User';

/**
 * Invite a user (by email) as a co-organizer for a specific event.
 * The user must already have an MGLTickets account.
 */
export const createCoOrganizer = async (
  eventId: number,
  email: string,
): Promise<CoOrganizer> => {
  return (
    await api.post<CoOrganizer>(
      `/organizers/me/events/${eventId}/co-organizers/${encodeURIComponent(email)}`,
    )
  ).data;
};

/**
 * List co-organizers across ALL of the current organizer's events.
 */
export const getAllCoOrganizers = async (): Promise<CoOrganizer[]> => {
  return (await api.get<CoOrganizer[]>('/organizers/me/co-organizers')).data;
};

/**
 * List co-organizers for a single event owned by the current organizer.
 */
export const getCoOrganizersForEvent = async (
  eventId: number,
): Promise<CoOrganizer[]> => {
  return (await api.get<CoOrganizer[]>(`/organizers/me/co-organizers/event/${eventId}`)).data;
};

/**
 * Toggle the `create_co_organizer` permission flag for a co-organizer.
 */
export const updateCoOrganizerPermission = async (
  coOrganizerId: number,
  canCreate: boolean,
): Promise<CoOrganizer> => {
  return (
    await api.patch<CoOrganizer>(
      `/organizers/me/co-organizers/${coOrganizerId}`,
      null,
      { params: { create_co_organizer: canCreate } },
    )
  ).data;
};

/**
 * Remove a co-organizer. Only the user who invited them can do this.
 */
export const deleteCoOrganizer = async (coOrganizerId: number): Promise<void> => {
  await api.delete(`/organizers/me/co-organizers/${coOrganizerId}`);
};