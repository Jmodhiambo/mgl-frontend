// src/shared/types/Events.ts
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
  category: string;
  start_time: string;   // ISO 8601
  end_time: string;     // ISO 8601
  original_filename: string;
  flyer_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TicketTypeOrganizerOut extends TicketTypeOut {
  suspended_by_admin_name: string | null;
  suspension_reason: string | null;
  suspended_at: string | null;
}

export interface TicketTypeAdminOut extends TicketTypeOut {
  suspended_by_admin_id: number | null;
  suspended_by_admin_name: string | null;
  suspension_reason: string | null;
  suspended_at: string | null;
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
 *
 * Commission fields are locked onto the event at creation time (copied from
 * platform_settings.platform_fee_percent unless negotiated by an admin).
 * platform_cut and organizer_net are computed server-side from
 * total_revenue × commission_rate — never compute these on the frontend,
 * always read them straight from the API response.
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
  total_revenue: number;          // gross confirmed revenue
  unresolved_bookings_count: number;

  // ── Commission ──────────────────────────────────────────────────────────
  commission_rate: number;                 // % locked in at event creation
  commission_source: 'platform_default' | 'negotiated';
  commission_approved_by: number | null;        // admin user ID (negotiated only)
  commission_approved_by_name: string | null;   // denormalised admin name
  commission_approved_at: string | null;        // ISO 8601 (negotiated only)

  // ── Computed revenue split ─────────────────────────────────────────────
  platform_cut: number;           // total_revenue * (commission_rate / 100)
  organizer_net: number;          // total_revenue - platform_cut

  created_at: string;
  updated_at: string;
}

/**
 * Matches backend EventStats.
 * Commission fields mirror the rate locked onto the parent event.
 */
export interface EventStats {
  total_bookings: number;
  total_revenue: number;
  tickets_sold: number;
  tickets_remaining: number;
  commission_rate: number;
  platform_cut: number;
  organizer_net: number;
}

/**
 * Matches backend CommissionBreakdown.
 * Not embedded in any response today, but available for reuse if a
 * standalone "revenue breakdown" component needs its own typed prop.
 */
export interface CommissionBreakdown {
  gross_revenue: number;
  platform_cut: number;
  organizer_net: number;
  commission_rate: number;
  commission_source: 'platform_default' | 'negotiated';
}

/**
 * Minimal booking record embedded inside EventDetails.
 */
export interface BookingOutBrief {
  id: number;
  order_id: number;
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
  ticket_types: TicketTypeOrganizerOut[];
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
  platform_cut: number;
  organizer_net: number;
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

// ─── Co-Organizer (MyEvents page on User app) ─────────────────────────────────────────────────────────────

/**
 * Mirrors the backend CoOrganizerWithEvent schema.
 *
 * A co-organizer is NOT a role — any user (user / organizer / admin) can be
 * invited. The relationship record carries the invite metadata alongside the
 * full event object.
 *
 * Backend: GET /users/me/events/co-organizing → list[CoOrganizerWithEvent]
 */
export interface CoOrganizerWithEvent {
  co_organizer_id:     number;   // CoOrganizer.id — the join-table row
  invited_by:          number;   // user_id of whoever sent the invite
  create_co_organizer: boolean;  // may this co-organizer further invite others?
  created_at:          string;   // ISO — when the relationship was created
  event:               OrganizerEventOut;
}


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