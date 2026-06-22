// src/shared/api/organizer/orgOrderApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Order-related API calls for the organizer app.
//
// Endpoints:
//   GET /organizers/me/orders          → all orders (with nested bookings)
//   GET /organizers/me/orders/recent   → recent N orders (dashboard widget)
//   GET /organizers/me/stats           → dashboard KPI stats
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

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
 * All orders for the current organizer's events.
 * Each order includes nested booking line items and commission breakdown.
 * Used by BookingsView — Orders tab.
 */
export const getOrganizerOrders = async (): Promise<OrganizerOrderOut[]> => {
  return (await api.get('/organizers/me/orders')).data;
};

/**
 * Most recent N orders — used by the dashboard recent-activity widget.
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