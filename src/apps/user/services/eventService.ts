// src/apps/user/services/eventService.ts
// ─────────────────────────────────────────────────────────────────────────────
// All event-related API calls for the user app.
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';
import type {
  EventOut,
  TicketTypeOut,
  FavoriteOut,
  FavoriteWithEventOut,
} from '@shared/types/Event';

// ─── Events ───────────────────────────────────────────────────────────────────

export const getApprovedEvents = async (): Promise<EventOut[]> =>
  (await api.get('/events')).data;

export const getEventByIdentifier = async (
  identifier: string | number,
): Promise<EventOut> =>
  (await api.get(`/events/${identifier}`)).data;

export const getLatestEvents = async (limit = 10): Promise<EventOut[]> =>
  (await api.get(`/events/latest?limit=${limit}`)).data;

export const searchEvents = async (params: {
  title?: string;
  venue?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
}): Promise<EventOut[]> => {
  const query = new URLSearchParams();
  if (params.title)      query.set('title',      params.title);
  if (params.venue)      query.set('venue',      params.venue);
  if (params.country)    query.set('country',    params.country);
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date)   query.set('end_date',   params.end_date);
  return (await api.get(`/events/search/?${query.toString()}`)).data;
};

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

export const getTicketTypesByEvent = async (
  eventId: number,
): Promise<TicketTypeOut[]> =>
  (await api.get(`/events/${eventId}/ticket-types`)).data;

// ─── Favorites ────────────────────────────────────────────────────────────────

/**
 * Get the current user's favorites with embedded event objects.
 * Returns FavoriteWithEventOut[] — each item has an `event` field
 * so the frontend can render event cards without a second fetch.
 */
export const getFavorites = async (): Promise<FavoriteWithEventOut[]> =>
  (await api.get('/users/me/favorites')).data;

/**
 * Add an event to favorites.
 * Returns bare FavoriteOut (id, user_id, event_id, timestamps).
 */
export const addFavorite = async (eventId: number): Promise<FavoriteOut> =>
  (await api.post(`/users/me/favorites?event_id=${eventId}`)).data;

/**
 * Remove an event from favorites by event_id.
 */
export const removeFavorite = async (eventId: number): Promise<void> =>
  await api.delete(`/users/me/favorites/${eventId}`);