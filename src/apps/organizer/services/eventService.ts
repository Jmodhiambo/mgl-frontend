// src/apps/organizer/services/eventService.ts
// ─────────────────────────────────────────────────────────────────────────────
// All event-related API calls for the organizer app.
//
// Endpoints used:
//   GET    /organizers/me/events                       → own events with stats
//   GET    /organizers/me/events/count                 → total event count
//   GET    /organizers/me/events/{id}/details          → full event bundle
//   GET    /organizers/me/events/{id}/stats            → stats only
//   GET    /organizers/me/top-events                   → top events by revenue
//   POST   /organizers/me/events                       → create event (multipart)
//   PUT    /organizers/me/events/{id}                  → update event fields
//   PATCH  /organizers/me/events/{id}                  → update event status
//   GET    /organizers/me/events/{id}/ticket-types     → list ticket types
//   POST   /organizers/me/events/{id}/ticket-types     → create ticket type
//   PUT    /organizers/me/ticket-types/{id}            → update ticket type
//   DELETE /organizers/me/ticket-types/{id}            → delete/deactivate
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
  start_time: string;  // ISO string
  end_time: string;    // ISO string
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

export interface CreateTicketTypePayload {
  name: string;
  description?: string;
  price: number;
  quantity_available: number;
}

export interface UpdateTicketTypePayload {
  name?: string;
  description?: string;
  price?: number;
  quantity_available?: number;
}

// ─── Events ───────────────────────────────────────────────────────────────────

/**
 * Get all events for the current organizer, with booking/revenue stats.
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
 * Get complete event details: event info + stats + ticket types +
 * 5 most recent bookings. Single call for the EventDetails page.
 * Used by: EventDetails.tsx (organizer)
 */
export const getEventDetails = async (eventId: number): Promise<EventDetails> => {
  return (await api.get(`/organizers/me/events/${eventId}/details`)).data;
};

/**
 * Get just the stats for a single event (bookings, revenue, tickets).
 * Use this when you only need the numbers without the full bundle.
 */
export const getEventStats = async (eventId: number): Promise<EventStats> => {
  return (await api.get(`/organizers/me/events/${eventId}/stats`)).data;
};

/**
 * Get the top events by revenue for the current organizer.
 * Used by the organizer dashboard.
 */
export const getTopEvents = async (limit = 5): Promise<TopEvent[]> => {
  return (await api.get(`/organizers/me/top-events?limit=${limit}`)).data;
};

/**
 * Create a new event. Uses multipart/form-data because a flyer
 * image upload is required.
 * Used by: EventForm.tsx (create mode)
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
 * Used by: EventForm.tsx (edit mode)
 */
export const updateEvent = async (
  eventId: number,
  payload: UpdateEventPayload,
): Promise<OrganizerEventOut> => {
  return (await api.put(`/organizers/me/events/${eventId}`, payload)).data;
};

/**
 * Update the status of an event (e.g. 'cancelled', 'deleted').
 * Used by: EventsList.tsx action menu, EventDetails.tsx
 */
export const updateEventStatus = async (
  eventId: number,
  state: string,
): Promise<boolean> => {
  return (await api.patch(`/organizers/me/events/${eventId}`, null, {
    params: { state },
  })).data;
};

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