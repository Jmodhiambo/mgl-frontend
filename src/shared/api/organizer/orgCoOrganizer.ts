// src/shared/api/organizer/orgCoOrganizer.ts
// ─────────────────────────────────────────────────────────────────────────────
// Co-organizer API calls for the organizer app.
//
// Endpoints:
//   POST   /organizers/me/events/{eventId}/co-organizers/{email}  → invite
//   GET    /organizers/me/co-organizers                           → list all (every event)
//   GET    /organizers/me/co-organizers/event/{eventId}           → list for one event
//   PATCH  /organizers/me/co-organizers/{id}                      → toggle create flag
//   DELETE /organizers/me/co-organizers/{id}                      → remove
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

/**
 * Raw co-organizer record returned by POST (create).
 * Mirrors CoOrganizerOut from the backend — relationship metadata only,
 * no user or event fields (the caller already knows the context).
 *
 * TODO: move to @shared/types/CoOrganizer once that file exists.
 */
export interface CoOrganizerOut {
  id: number;
  user_id: number;
  organizer_id: number;
  event_id: number;
  invited_by: number;
  create_co_organizer: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Enriched co-organizer row returned by the list endpoints.
 * Mirrors CoOrganizerWithUserAndEvent from the backend.
 *
 * `id`      → co_organizers table PK — pass this to PATCH and DELETE.
 * `user_id` → the invited user's own PK (kept separate for profile linking).
 *
 * One row per co-organizer/event pairing, so a person co-organising two
 * events appears twice — matching the event-name column in the UI table.
 *
 * TODO: move to @shared/types/CoOrganizer once that file exists.
 */
export interface CoOrganizerWithUserAndEvent {
  id: number;
  event_id: number;
  event_title: string;
  invited_by: number;
  create_co_organizer: boolean;
  created_at: string;
  user_id: number;
  name: string;
  email: string;
  phone_number?: string;
  role: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Invite a user (by email) as a co-organizer for a specific event.
 * The user must already have an MGLTickets account.
 * Returns the raw co-organizer record (CoOrganizerOut).
 */
export const createCoOrganizer = async (
  eventId: number,
  email: string,
): Promise<CoOrganizerOut> => {
  return (
    await api.post<CoOrganizerOut>(
      `/organizers/me/events/${eventId}/co-organizers/${encodeURIComponent(email)}`,
    )
  ).data;
};

/**
 * List co-organizers across ALL of the current organizer's events.
 * Returns enriched rows including user info and event title.
 */
export const getAllCoOrganizers = async (): Promise<CoOrganizerWithUserAndEvent[]> => {
  return (
    await api.get<CoOrganizerWithUserAndEvent[]>('/organizers/me/co-organizers')
  ).data;
};

/**
 * List co-organizers for a single event owned by the current organizer.
 * Returns enriched rows including user info and event title.
 */
export const getCoOrganizersForEvent = async (
  eventId: number,
): Promise<CoOrganizerWithUserAndEvent[]> => {
  return (
    await api.get<CoOrganizerWithUserAndEvent[]>(
      `/organizers/me/co-organizers/event/${eventId}`,
    )
  ).data;
};

/**
 * Toggle the `create_co_organizer` permission flag for a co-organizer.
 * Only the original inviter may call this. Returns 204 No Content.
 */
export const updateCoOrganizerPermission = async (
  coOrganizerId: number,
  canCreate: boolean,
): Promise<void> => {
  await api.patch(
    `/organizers/me/co-organizers/${coOrganizerId}`,
    null,
    { params: { create_co_organizer: canCreate } },
  );
};

/**
 * Remove a co-organizer. Only the user who invited them may do this.
 * Returns 204 No Content.
 */
export const deleteCoOrganizer = async (coOrganizerId: number): Promise<void> => {
  await api.delete(`/organizers/me/co-organizers/${coOrganizerId}`);
};