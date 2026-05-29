// src/apps/user/services/eventService.ts
// ─────────────────────────────────────────────────────────────────────────────
// All event-related API calls for the user app.
// Covers both unauthenticated pages (Events, EventDetails) and
// authenticated pages (BrowseEvents, BrowseEventDetails).
//
// Endpoints used:
//   GET  /events                          → list approved events
//   GET  /events/{identifier}             → single event by id or slug
//   GET  /events/search/                  → search events
//   GET  /events/latest                   → latest events
//   GET  /events/{id}/ticket-types        → ticket types for an event
//   GET  /users/me/favorites              → user's saved favorites
//   POST /users/me/favorites              → add a favorite
//   DELETE /users/me/favorites/{event_id} → remove a favorite
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';
import type { EventOut, TicketTypeOut, Favorite } from '@shared/types/Event';

// ─── Events ───────────────────────────────────────────────────────────────────

/**
 * Fetch all approved events.
 * Used by: Events.tsx (unauthenticated), BrowseEvents.tsx (authenticated)
 */
export const getApprovedEvents = async (): Promise<EventOut[]> => {
  return (await api.get('/events')).data;
};

/**
 * Fetch a single event by numeric ID or slug.
 * The backend GET /events/{identifier} handles both automatically.
 * Used by: EventDetails.tsx, BrowseEventDetails.tsx
 */
export const getEventByIdentifier = async (
  identifier: string | number,
): Promise<EventOut> => {
  return (await api.get(`/events/${identifier}`)).data;
};

/**
 * Fetch the latest approved events.
 */
export const getLatestEvents = async (limit = 10): Promise<EventOut[]> => {
  return (await api.get(`/events/latest?limit=${limit}`)).data;
};

/**
 * Search events. Pass at least one filter.
 * All params are optional — only the first truthy one is used by the backend.
 */
export const searchEvents = async (params: {
  title?: string;
  venue?: string;
  country?: string;
  start_date?: string; // ISO string
  end_date?: string;   // ISO string
}): Promise<EventOut[]> => {
  const query = new URLSearchParams();
  if (params.title)      query.set('title',      params.title);
  if (params.venue)      query.set('venue',      params.venue);
  if (params.country)    query.set('country',    params.country);
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date)   query.set('end_date',   params.end_date);
  return (await api.get(`/events/search/?${query.toString()}`)).data;
};

/**
 * Get events sorted by start_time or end_time.
 */
export const getSortedEvents = async (params: {
  sort_by?: 'start_time' | 'end_time';
  order?: 'asc' | 'desc';
}): Promise<EventOut[]> => {
  const query = new URLSearchParams();
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.order)   query.set('order',   params.order);
  return (await api.get(`/events/sorted/?${query.toString()}`)).data;
};

// ─── Ticket Types ─────────────────────────────────────────────────────────────

/**
 * Fetch ticket types for a specific event.
 * Used by: EventDetails.tsx, BrowseEventDetails.tsx
 */
export const getTicketTypesByEvent = async (
  eventId: number,
): Promise<TicketTypeOut[]> => {
  return (await api.get(`/events/${eventId}/ticket-types`)).data;
};

// ─── Favorites (authenticated users only) ────────────────────────────────────

/**
 * Get the current user's favorited events.
 * Only call this when isAuthenticated === true.
 */
export const getFavorites = async (): Promise<Favorite[]> => {
  return (await api.get('/users/me/favorites')).data;
};

/**
 * Add an event to favorites. Returns the new Favorite record.
 */
export const addFavorite = async (eventId: number): Promise<Favorite> => {
  return (await api.post('/users/me/favorites', { event_id: eventId })).data;
};

/**
 * Remove an event from favorites.
 * The backend endpoint takes the event_id (not the favorite row id).
 */
export const removeFavorite = async (eventId: number): Promise<void> => {
  await api.delete(`/users/me/favorites/${eventId}`);
};