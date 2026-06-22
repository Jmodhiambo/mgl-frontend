// src/apps/user/services/dashboardService.ts
import api from '@shared/api/axiosConfig';
import { getEventById } from '@user/services/eventService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserMe {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

// One ticket-type line item within an enriched order
export interface OrderBookingLine {
  id: number; // booking id
  ticket_type_id: number;
  ticket_type_name: string;
  quantity: number;
  total_price: number;
  status: string;
}

// Matches backend OrderEnrichedOut — GET /users/me/orders/enriched
// This is the single source of truth for Dashboard + My Tickets. It replaces
// the old pattern of separately fetching plain bookings and ticket instances
// and joining them client-side by event title, which broke silently for any
// order that hadn't had ticket instances issued yet (still pending payment).
export interface UserOrderEnriched {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  event_id: number;
  event_title: string;
  total_price: number;
  status: string; // order status: pending | confirmed | cancelled
  created_at: string;
  updated_at: string;

  payment_id: number | null;
  payment_method: string | null;
  payment_status: 'pending' | 'completed' | 'failed' | null;
  mpesa_ref: string | null;
  mpesa_phone: string | null;

  bookings: OrderBookingLine[];
}

// Enriched ticket instance from GET /users/me/ticket-instances
// Still used for QR codes / ticket codes, which only exist once an order
// is confirmed and ticket instances have been issued.
export interface UserTicketInstance {
  id: number;
  booking_id: number;
  ticket_type_id: number;
  user_id: number;
  code: string;
  status: 'issued' | 'used' | 'cancelled';
  price: number;
  issued_to: string | null;
  created_at: string;
  updated_at: string;
  used_at: string | null;
  event_title: string;
  venue: string;
  event_date: string | null;
  ticket_type_name: string;
}

// Shaped types the Dashboard consumes
export interface DashboardBookingRow {
  id: number; // order id
  event_title: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  event_date: string;
}

export interface DashboardUpcomingEvent {
  id: number; // event id
  title: string;
  date: string;
  venue: string;
  tickets: number;
}

export interface DashboardStats {
  totalBookings: number;
  activeTickets: number;
  totalSpent: number;
  upcomingEvents: number;
}


// Plain booking from GET /users/me/bookings
export interface UserBooking {
  id: number;
  user_id: number;
  event_id: number;
  ticket_type_id: number;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  total_price: number;
  created_at: string;
  updated_at: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function fetchCurrentUser(): Promise<UserMe> {
  const res = await api.get<UserMe>('/users/me');
  return res.data;
}

/**
 * Fetch the current user's orders, enriched with event title, payment
 * status, and ticket-type line items. Replaces fetchUserBookings().
 */
export async function fetchUserOrdersEnriched(): Promise<UserOrderEnriched[]> {
  const res = await api.get<UserOrderEnriched[]>('/users/me/orders/enriched');
  return res.data;
}

export async function fetchUserTicketInstances(): Promise<UserTicketInstance[]> {
  const res = await api.get<UserTicketInstance[]>('/users/me/ticket-instances');
  return res.data;
}

// ── Derived data helpers ──────────────────────────────────────────────────────

/**
 * Build dashboard stats from orders + ticket instances.
 *
 * totalBookings counts orders (each order = one checkout), not individual
 * booking line items — this matches what the user thinks of as "a booking."
 *
 * upcomingEvents is computed from `eventStartTimes` (event_id -> start_time),
 * NOT from ticket instance event_date. Ticket instance event_date can be
 * null/missing depending on enrichment edge cases, which previously made
 * this silently report 0 upcoming events even when the user clearly had
 * active tickets. The event's own start_time, fetched once per distinct
 * event_id, is the reliable source.
 */
export function computeStats(
  orders: UserOrderEnriched[],
  tickets: UserTicketInstance[],
  eventStartTimes: Map<number, string>,
): DashboardStats {
  const now = new Date();
 
  const totalBookings = orders.length;
  const activeTickets = tickets.filter((t) => t.status === 'issued').length;
 
  const totalSpent = orders
    .filter((o) => o.status === 'confirmed')
    .reduce((sum, o) => sum + o.total_price, 0);
 
  const upcomingEventIds = new Set(
    orders
      .filter((o) => o.status === 'confirmed')
      .filter((o) => {
        const startTime = eventStartTimes.get(o.event_id);
        return !!startTime && new Date(startTime) > now;
      })
      .map((o) => o.event_id),
  );
 
  return {
    totalBookings,
    activeTickets,
    totalSpent,
    upcomingEvents: upcomingEventIds.size,
  };
}
 
/**
 * Build the "Recent Bookings" list directly from enriched orders. The order
 * itself carries event_title and event_id directly — no more cross
 * referencing ticket instances just to find the event title.
 *
 * quantity is summed across all ticket-type line items in the order, since
 * an order can contain multiple ticket types (e.g. 2 VIP + 1 Regular).
 */
export function buildRecentBookings(
  orders: UserOrderEnriched[],
  eventStartTimes: Map<number, string>,
  limit = 5,
): DashboardBookingRow[] {
  return [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((o) => {
      const quantity = o.bookings.reduce((sum, b) => sum + b.quantity, 0);
      return {
        id: o.id,
        event_title: o.event_title,
        quantity,
        total_price: o.total_price,
        status: o.status,
        created_at: o.created_at,
        event_date: eventStartTimes.get(o.event_id) ?? o.created_at,
      };
    });
}
 
/**
 * Build the "Upcoming Events" sidebar list.
 *
 * Driven by confirmed orders + each event's own start_time (reliable),
 * decorated with the count of issued ticket instances for that event
 * (cosmetic — falls back to the order's ticket quantity if no ticket
 * instances have been issued yet for some reason, e.g. a brand-new
 * confirmation where instance issuance hasn't completed).
 */
export function buildUpcomingEvents(
  orders: UserOrderEnriched[],
  tickets: UserTicketInstance[],
  eventStartTimes: Map<number, string>,
  eventVenues: Map<number, string>,
  limit = 5,
): DashboardUpcomingEvent[] {
  const now = new Date();
 
  // booking_id -> order, to recover event_id when counting issued tickets
  const orderByBookingId = new Map<number, UserOrderEnriched>();
  for (const o of orders) {
    for (const b of o.bookings) {
      orderByBookingId.set(b.id, o);
    }
  }
 
  const issuedCountByEvent = new Map<number, number>();
  for (const t of tickets) {
    if (t.status !== 'issued') continue;
    const eventId = orderByBookingId.get(t.booking_id)?.event_id;
    if (eventId == null) continue;
    issuedCountByEvent.set(eventId, (issuedCountByEvent.get(eventId) ?? 0) + 1);
  }
 
  const map = new Map<number, DashboardUpcomingEvent>();
 
  for (const o of orders) {
    if (o.status !== 'confirmed') continue;
    const startTime = eventStartTimes.get(o.event_id);
    if (!startTime || new Date(startTime) <= now) continue;
    if (map.has(o.event_id)) continue;
 
    const fallbackQty = o.bookings.reduce((sum, b) => sum + b.quantity, 0);
    map.set(o.event_id, {
      id: o.event_id,
      title: o.event_title,
      date: startTime,
      venue: eventVenues.get(o.event_id) ?? '',
      tickets: issuedCountByEvent.get(o.event_id) ?? fallbackQty,
    });
  }
 
  return [...map.values()]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}
 
/**
 * Fetch start_time + venue for every distinct event_id referenced by a set
 * of orders, in parallel, deduplicated. Failures for an individual event are
 * swallowed (that event is simply omitted from the maps) so one bad
 * event_id can't break the whole dashboard.
 */
export async function fetchEventDetailsForOrders(
  orders: UserOrderEnriched[],
): Promise<{ startTimes: Map<number, string>; venues: Map<number, string> }> {
  const distinctEventIds = [...new Set(orders.map((o) => o.event_id))];
 
  const results = await Promise.allSettled(
    distinctEventIds.map((id) => getEventById(id)),
  );
 
  const startTimes = new Map<number, string>();
  const venues = new Map<number, string>();
 
  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      const event = result.value;
      startTimes.set(distinctEventIds[idx], event.start_time);
      venues.set(distinctEventIds[idx], event.venue);
    }
  });
 
  return { startTimes, venues };
}