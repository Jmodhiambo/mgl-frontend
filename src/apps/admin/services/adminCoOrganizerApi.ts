// src/apps/admin/services/adminCoOrganizerApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Co-organizer API calls for the admin app.
//
// Endpoints:
//   POST   /admin/me/co-organizers                → add by email
//   GET    /admin/me/co-organizers?event_id={id}  → list for an event
//   PATCH  /admin/me/co-organizers/{id}           → toggle create flag
//   DELETE /admin/me/co-organizers/{id}           → remove
//   GET    /admin/me/events/co-organizing?user_id → events a user co-organises
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';
import type { CoOrganizerOut, CoOrganizerWithUserAndEvent } from '@shared/api/organizer/orgCoOrganizer';
import type { EventOut } from '@shared/types/Event';

/**
 * Shape of each item returned by GET /admin/me/events/co-organizing.
 * Mirrors CoOrganizerWithEvent from the backend — full EventOut bundled with
 * the relationship metadata (invited_by, create_co_organizer, joined_at).
 *
 * TODO: move to @shared/types/CoOrganizer once that file exists.
 */
export interface CoOrganizerWithEvent {
  co_organizer_id: number;
  invited_by: number;
  create_co_organizer: boolean;
  created_at: string;
  event: EventOut;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Add a co-organizer to any event by email address.
 * invited_by is set server-side to the acting admin's ID.
 */
export const adminAddCoOrganizer = async (
  email: string,
  eventId: number,
): Promise<CoOrganizerOut> => {
  return (
    await api.post<CoOrganizerOut>('/admin/me/co-organizers', null, {
      params: { email, event_id: eventId },
    })
  ).data;
};

/**
 * List all co-organizers for a given event (no ownership filter — admin view).
 * Returns enriched rows including user info and event title.
 */
export const adminGetCoOrganizersForEvent = async (
  eventId: number,
): Promise<CoOrganizerWithUserAndEvent[]> => {
  return (
    await api.get<CoOrganizerWithUserAndEvent[]>('/admin/me/co-organizers', {
      params: { event_id: eventId },
    })
  ).data;
};

/**
 * Toggle the `create_co_organizer` permission flag. Returns 204 No Content.
 */
export const adminUpdateCoOrganizerPermission = async (
  coOrganizerId: number,
  canCreate: boolean,
): Promise<void> => {
  await api.patch(`/admin/me/co-organizers/${coOrganizerId}`, null, {
    params: { create_co_organizer: canCreate },
  });
};

/**
 * Remove a co-organizer record. Returns 204 No Content.
 */
export const adminDeleteCoOrganizer = async (coOrganizerId: number): Promise<void> => {
  await api.delete(`/admin/me/co-organizers/${coOrganizerId}`);
};

/**
 * List all events a user is co-organising, each bundled with the full EventOut
 * and the co-organizer relationship metadata.
 */
export const adminGetUserCoOrganisingEvents = async (
  userId: number,
): Promise<CoOrganizerWithEvent[]> => {
  return (
    await api.get<CoOrganizerWithEvent[]>('/admin/me/events/co-organizing', {
      params: { user_id: userId },
    })
  ).data;
};