// src/shared/types/events.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all event-related TypeScript types across the
// user app, organizer app, and admin app.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Public (user-facing) ─────────────────────────────────────────────────────

/**
 * Matches backend EventOut.
 * Returned by GET /events and GET /events/{identifier}.
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

/**
 * Matches backend FavoriteOut.
 * Returned by POST /users/me/favorites (create).
 * Contains only IDs and timestamps — no embedded event.
 */
export interface FavoriteOut {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Matches backend FavoriteWithEventOut.
 * Returned by GET /users/me/favorites.
 * Each record includes the full EventOut so the frontend can render
 * event cards without a second fetch per favorite.
 */
export interface FavoriteWithEventOut {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
  event: EventOut;
}

// ─── Organizer portal ─────────────────────────────────────────────────────────

/**
 * Matches backend OrganizerEventOut.
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
 */
export interface EventStats {
  total_bookings: number;
  total_revenue: number;
  tickets_sold: number;
  tickets_remaining: number;
}

/**
 * Minimal booking record embedded inside EventDetails.
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
 */
export interface EventDetails {
  event: OrganizerEventOut;
  stats: EventStats;
  ticket_types: TicketTypeOut[];
  recent_bookings: BookingOutBrief[];
}

/**
 * Matches backend TopEvent.
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
 */
export interface AdminEventOut extends OrganizerEventOut {
  organizer_id: number;
  organizer_name: string;
}

// ─── Selected tickets (checkout state) ───────────────────────────────────────

/** Maps ticket_type_id → quantity selected by the user. */
export type SelectedTickets = Record<number, number>;


// Old types

// export interface Event {
//   id: number;
//   title: string;
//   organizer_id: number;
//   description?: string;
//   venue: string;
//   price?: number;
//   start_time: string;
//   end_time: string;
//   original_filename: string;
//   flyer_url: string;
//   status: string;
//   created_at: string;
//   update_at: string;
// }

// export interface EventCreate {
//     title: string;
//     description?: string;
//     venue: string;
//     start_time: string;
//     end_time: string;
// }

// export interface EventUpdate {
//     title?: string;
//     description?: string;
//     venue?: string;
//     start_time?: string;
//     end_time?: string;
// }

// export interface OrganizerEventsResponse extends Event {
//     approved: boolean;
//     rejected: boolean;
// }

// export interface EventStatus {
//     status: "upcoming" | "ongoing" | "completed" | "cancelled" | "deleted";
// }