/**
 * Event types and interfaces
 */

export interface Event {
  id: number;
  title: string;
  organizer_id: number;
  description?: string;
  venue: string;
  price?: number;
  start_time: string;
  end_time: string;
  original_filename: string;
  flyer_url: string;
  status: string;
  created_at: string;
  update_at: string;
}

export interface EventCreate {
    title: string;
    description?: string;
    venue: string;
    start_time: string;
    end_time: string;
}

export interface EventUpdate {
    title?: string;
    description?: string;
    venue?: string;
    start_time?: string;
    end_time?: string;
}

export interface OrganizerEventsResponse extends Event {
    approved: boolean;
    rejected: boolean;
}

export interface EventStatus {
    status: "upcoming" | "ongoing" | "completed" | "cancelled" | "deleted";
}



// src/shared/types/events.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all event-related TypeScript types across the
// user app, organizer app, and admin app.
//
// Mirror of the backend schemas in app/schemas/event.py:
//   EventOut          → public/user-facing
//   OrganizerEventOut → organizer portal
//   AdminEventOut     → admin portal
// ─────────────────────────────────────────────────────────────────────────────

// ─── Public (user-facing) ─────────────────────────────────────────────────────

/**
 * Matches backend EventOut.
 * Returned by GET /events and GET /events/{identifier}.
 * Used by Events.tsx and EventDetails.tsx (unauthenticated)
 * and BrowseEvents.tsx and BrowseEventDetails.tsx (authenticated).
 */
export interface EventOut {
  id: number;
  title: string;
  slug: string;
  organizer_id: number;
  description: string | null;
  venue: string;
  start_time: string;   // ISO 8601
  end_time: string;     // ISO 8601
  original_filename: string;
  flyer_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── Ticket types ─────────────────────────────────────────────────────────────

/**
 * Matches backend TicketTypeOut.
 * Returned by GET /events/{id}/ticket-types and organizer equivalents.
 */
export interface TicketTypeOut {
  id: number;
  event_id: number;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  quantity_available: number;
  quantity_sold: number;
  created_at: string;
  updated_at: string;
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export interface Favorite {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
}

// ─── Organizer portal ─────────────────────────────────────────────────────────

/**
 * Matches backend OrganizerEventOut.
 * Returned by GET /organizers/me/events and related organizer endpoints.
 * Includes city/country/category, approval state, and aggregated stats.
 */
export interface OrganizerEventOut {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  venue: string;
  city: string;
  country: string;
  category: string;
  start_time: string;
  end_time: string;
  flyer_url: string;
  status: string;
  is_approved: boolean;
  is_active: boolean;
  total_bookings: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

/**
 * Matches backend EventStats.
 * Returned by GET /organizers/me/events/{id}/stats.
 */
export interface EventStats {
  total_bookings: number;
  total_revenue: number;
  tickets_sold: number;
  tickets_remaining: number;
}

/**
 * Minimal booking record used inside EventDetails.
 * Matches backend BookingOut as embedded in EventDetails.
 */
export interface BookingOutBrief {
  id: number;
  user_id: number;
  ticket_type_id: number;
  quantity: number;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

/**
 * Matches backend EventDetails.
 * Returned by GET /organizers/me/events/{id}/details.
 * Single call that bundles event + stats + ticket types + recent bookings.
 */
export interface EventDetails {
  event: OrganizerEventOut;
  stats: EventStats;
  ticket_types: TicketTypeOut[];
  recent_bookings: BookingOutBrief[];
}

/**
 * Matches backend TopEvent.
 * Returned by GET /organizers/me/top-events.
 */
export interface TopEvent {
  id: number;
  title: string;
  bookings: number;
  revenue: number;
  tickets_sold: number;
}

// ─── Admin portal ─────────────────────────────────────────────────────────────

/**
 * Matches backend AdminEventOut.
 * Extends OrganizerEventOut with organizer identity fields.
 * Returned by all /admin/events and /admin/all-events endpoints.
 */
export interface AdminEventOut extends OrganizerEventOut {
  organizer_id: number;
  organizer_name: string;
}

// ─── Selected tickets (checkout state) ───────────────────────────────────────

/** Maps ticket_type_id → quantity selected by the user. */
export type SelectedTickets = Record<number, number>;