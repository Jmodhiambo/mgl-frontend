// src/apps/user/services/dashboardService.ts
import api from '@shared/api/axiosConfig';

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

// Enriched ticket instance from GET /users/me/ticket-instances
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
  // enriched fields from the join
  event_title: string;
  venue: string;
  event_date: string | null;
  ticket_type_name: string;
}

// Shaped types the Dashboard consumes
export interface DashboardBookingRow {
  id: number;
  event_title: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  event_date: string;
}

export interface DashboardUpcomingEvent {
  id: number;
  title: string;
  date: string;
  venue: string;
  tickets: number; // number of valid ticket instances for this event
}

export interface DashboardStats {
  totalBookings: number;
  activeTickets: number;    // ticket instances with status === 'issued'
  totalSpent: number;       // sum of confirmed booking total_prices
  upcomingEvents: number;   // distinct future events the user has tickets for
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function fetchCurrentUser(): Promise<UserMe> {
  const res = await api.get<UserMe>('/users/me');
  return res.data;
}

export async function fetchUserBookings(): Promise<UserBooking[]> {
  const res = await api.get<UserBooking[]>('/users/me/bookings');
  return res.data;
}

export async function fetchUserTicketInstances(): Promise<UserTicketInstance[]> {
  const res = await api.get<UserTicketInstance[]>('/users/me/ticket-instances');
  return res.data;
}

// ── Derived data helpers ──────────────────────────────────────────────────────

/**
 * Build dashboard stats from raw bookings + ticket instances.
 * No extra network calls needed — all data is already fetched.
 */
export function computeStats(
  bookings: UserBooking[],
  tickets: UserTicketInstance[],
): DashboardStats {
  const now = new Date();

  const totalBookings = bookings.length;

  const activeTickets = tickets.filter((t) => t.status === 'issued').length;

  const totalSpent = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.total_price, 0);

  // Count distinct future events the user holds an issued ticket for
  const futureEventIds = new Set(
    tickets
      .filter((t) => t.status === 'issued' && t.event_date && new Date(t.event_date) > now)
      .map((t) => t.event_title), // event_id isn't on the enriched shape — use title as key
  );
  const upcomingEvents = futureEventIds.size;

  return { totalBookings, activeTickets, totalSpent, upcomingEvents };
}

/**
 * Build the "Recent Bookings" list.
 *
 * Plain bookings don't carry event_title/event_date, but ticket instances do.
 * We group ticket instances by booking_id and use the first instance per
 * booking to get the event context, then merge with booking data for
 * quantity/total_price/status.
 *
 * Falls back to event_title = "Unknown Event" / event_date = created_at
 * if no matching ticket instance is found (edge case: booking with no issued tickets yet).
 */
export function buildRecentBookings(
  bookings: UserBooking[],
  tickets: UserTicketInstance[],
  limit = 5,
): DashboardBookingRow[] {
  // Index: booking_id → first ticket instance for that booking
  const ticketByBooking = new Map<number, UserTicketInstance>();
  for (const t of tickets) {
    if (!ticketByBooking.has(t.booking_id)) {
      ticketByBooking.set(t.booking_id, t);
    }
  }

  return [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((b) => {
      const ti = ticketByBooking.get(b.id);
      return {
        id: b.id,
        event_title: ti?.event_title ?? 'Unknown Event',
        quantity: b.quantity,
        total_price: b.total_price,
        status: b.status,
        created_at: b.created_at,
        event_date: ti?.event_date ?? b.created_at,
      };
    });
}

/**
 * Build the "Upcoming Events" sidebar list.
 *
 * Groups future issued ticket instances by event_title, counts tickets per
 * event, and returns the soonest events first.
 */
export function buildUpcomingEvents(
  tickets: UserTicketInstance[],
  limit = 5,
): DashboardUpcomingEvent[] {
  const now = new Date();

  // Group by event_title (proxy for event identity since event_id isn't in the enriched shape)
  const map = new Map<
    string,
    { title: string; date: string; venue: string; tickets: number; id: number }
  >();

  for (const t of tickets) {
    if (t.status !== 'issued' || !t.event_date || new Date(t.event_date) <= now) continue;

    if (map.has(t.event_title)) {
      map.get(t.event_title)!.tickets += 1;
    } else {
      map.set(t.event_title, {
        id: t.booking_id, // closest proxy for a unique key
        title: t.event_title,
        date: t.event_date,
        venue: t.venue,
        tickets: 1,
      });
    }
  }

  return [...map.values()]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}