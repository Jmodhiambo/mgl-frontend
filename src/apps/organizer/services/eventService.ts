// src/apps/organizer/services/eventService.ts
// ─────────────────────────────────────────────────────────────────────────────
// All event-related API calls for the organizer app.
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';
import type {
  OrganizerEventOut,
  EventDetails,
  EventStats,
  TopEvent,
  TicketTypeOut,
} from '@shared/types/Event';

// ─── Event payload types ──────────────────────────────────────────────────────

export interface CreateEventForm {
  title: string;
  description: string;
  venue: string;
  city: string;
  country: string;
  category: string;
  start_time: string;   // ISO string
  end_time: string;     // ISO string
  flyer: File | null;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  venue?: string;
  city?: string;
  country?: string;
  category?: string;
  start_time?: string;
  end_time?: string;
}

// ─── Events ───────────────────────────────────────────────────────────────────

/**
 * Get event details by its ID.
 * @param eventId - The ID of the event to retrieve.
 * @returns A promise resolving to the event details.
 */

export const getEventById = async (eventId: number): Promise<OrganizerEventOut> => {
  return (await api.get(`/organizers/me/events/${eventId}`)).data;
}
/**
 * Get all events for the current organizer with booking/revenue stats
 * and commission breakdown (commission_rate, platform_cut, organizer_net).
 * Used by: EventsList.tsx
 */
export const getMyEvents = async (): Promise<OrganizerEventOut[]> => {
  return (await api.get('/organizers/me/events')).data;
};

/**
 * Get the total number of events for the current organizer.
 */
export const getMyEventCount = async (): Promise<number> => {
  return (await api.get('/organizers/me/events/count')).data;
};

/**
 * Get complete event details by SLUG: event info + stats + ticket types +
 * 5 most recent bookings. This is the preferred call for the organizer portal.
 * Used by: EventDetails.tsx (organizer)
 */
export const getEventDetailsBySlug = async (slug: string): Promise<EventDetails> => {
  return (await api.get(`/organizers/me/events/by-slug/${slug}/details`)).data;
};

/**
 * Get complete event details by numeric ID (kept for backwards-compat).
 * Prefer getEventDetailsBySlug for new navigation.
 */
export const getEventDetails = async (eventId: number): Promise<EventDetails> => {
  return (await api.get(`/organizers/me/events/${eventId}/details`)).data;
};

/**
 * Get just the stats for a single event.
 */
export const getEventStats = async (eventId: number): Promise<EventStats> => {
  return (await api.get(`/organizers/me/events/${eventId}/stats`)).data;
};

/**
 * Get the top events by revenue for the current organizer.
 */
export const getTopEvents = async (limit = 5): Promise<TopEvent[]> => {
  return (await api.get(`/organizers/me/top-events?limit=${limit}`)).data;
};

/**
 * Create a new event (multipart/form-data).
 * The backend injects commission_rate from platform settings — never sent by client.
 */
export const createEvent = async (
  form: CreateEventForm,
): Promise<OrganizerEventOut> => {
  const fd = new FormData();
  fd.append('title',       form.title);
  fd.append('description', form.description);
  fd.append('venue',       form.venue);
  fd.append('city',        form.city);
  fd.append('country',     form.country);
  fd.append('category',    form.category);
  fd.append('start_time',  form.start_time);
  fd.append('end_time',    form.end_time);
  if (form.flyer) fd.append('flyer', form.flyer);

  return (
    await api.post('/organizers/me/events', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  ).data;
};

/**
 * Update event details (title, description, venue, dates, etc.).
 */
export const updateEvent = async (
  eventId: number,
  payload: UpdateEventPayload,
): Promise<OrganizerEventOut> => {
  return (await api.put(`/organizers/me/events/${eventId}`, payload)).data;
};

/**
 * Update the status of an event (e.g. 'cancelled', 'deleted').
 */
export const updateEventStatus = async (
  eventId: number,
  state: string,
): Promise<OrganizerEventOut> => {
  return (await api.patch(`/organizers/me/events/${eventId}`, null, {
    params: { state },
  })).data;
};

// ─── Ticket Types ─────────────────────────────────────────────────────────────

export const getTicketTypesByEvent = async (eventId: number): Promise<TicketTypeOut[]> => {
  return (await api.get(`/organizers/me/events/${eventId}/ticket-types`)).data;
};