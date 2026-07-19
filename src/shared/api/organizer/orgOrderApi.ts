// src/shared/api/organizer/orgOrderApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Order-related API calls for the organizer app.
//
// Endpoints:
//   GET /organizers/me/orders?limit=&offset=&event_id=  → paginated orders (with nested bookings)
//   GET /organizers/me/orders/recent                    → recent N orders (dashboard widget)
//   GET /organizers/me/stats                             → dashboard KPI stats
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Generic paginated list envelope — mirrors the backend's
 * app.schemas.pagination.PaginatedResponse[T].
 *
 * TODO: move to @shared/types/Pagination — duplicated across orgCoOrganizer.ts,
 * bookingsApi.ts, and here. Consolidate once that shared file exists.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface OrganizerOrderBookingLine {
  id: number;
  ticket_type_id: number;
  ticket_type_name: string;
  quantity: number;
  total_price: number;
  status: string;
}

export interface OrganizerOrderOut {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  event_id: number;
  event_title: string;
  event_slug: string;
  total_price: number;
  status: string;             // pending | confirmed | cancelled
  created_at: string;
  updated_at: string;
  // Payment
  payment_id: number | null;
  payment_status: string | null;
  mpesa_ref: string | null;
  mpesa_phone: string | null;
  // Commission breakdown
  commission_rate: number;
  platform_cut: number;
  organizer_net: number;
  // Line items
  bookings: OrganizerOrderBookingLine[];
}

export interface DashboardStats {
  total_events: number;
  active_events: number;
  upcoming_events: number;
  completed_events: number;
  monthly_growth: number;
  total_bookings: number;
  tickets_sold: number;
  // Revenue split
  total_revenue: number;
  platform_cut: number;
  organizer_net: number;
}

export interface TopEvent {
  id: number;
  title: string;
  bookings: number;
  revenue: number;
  tickets_sold: number;
  platform_cut: number;
  organizer_net: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * KPI stats for the organizer dashboard.
 * Returns event counts, booking totals, and revenue split.
 */
export const getOrganizerStats = async (): Promise<DashboardStats> => {
  return (await api.get('/organizers/me/stats')).data;
};

/**
 * Paginated orders for the current organizer's events, optionally scoped to
 * a single event (used by the event-specific BookingsView route so it only
 * ever sees that event's orders, not the organizer's full history).
 * Each order includes nested booking line items and commission breakdown.
 * Used by BookingsView — Orders tab.
 */
export const getOrganizerOrders = async (
  limit = 20,
  offset = 0,
  eventId?: number,
): Promise<PaginatedResponse<OrganizerOrderOut>> => {
  return (
    await api.get('/organizers/me/orders', {
      params: {
        limit,
        offset,
        ...(eventId !== undefined ? { event_id: eventId } : {}),
      },
    })
  ).data;
};

/**
 * Most recent N orders — used by the dashboard recent-activity widget.
 * Not paginated — separate endpoint from the Orders tab above.
 */
export const getRecentOrganizerOrders = async (
  limit = 10,
): Promise<OrganizerOrderOut[]> => {
  return (await api.get(`/organizers/me/orders/recent?limit=${limit}`)).data;
};

/**
 * Top events by revenue — dashboard widget.
 */
export const getTopEvents = async (limit = 5): Promise<TopEvent[]> => {
  return (await api.get(`/organizers/me/top-events?limit=${limit}`)).data;
};