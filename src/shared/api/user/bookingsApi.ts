// src/shared/services/bookingService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Booking API calls — used across user, organizer, and admin apps.
// Scoped by function prefix:
//   (no prefix)   → user-facing  (/users/me/...)
//   organizer___  → organizer    (/organizers/me/...)
//   admin___      → admin        (/admin/...)
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BookingOut {
  id: number;
  order_id: number;          // groups this booking with sibling line items under one Order
  user_id: number;
  event_id: number;
  ticket_type_id: number;
  quantity: number;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface BookingUpdate {
  quantity: number;
  status: string;
  total_price: number;
}

// Enriched shape returned by organizer + admin joined queries
export interface BookingEnriched extends BookingOut {
  customer_name: string;
  customer_email: string;
  event_title: string;
  ticket_type_name: string;
  venue?: string;
  event_date?: string;
}

// ── Orders ────────────────────────────────────────────────────────────────────
// A single checkout — one or more ticket types for ONE event.
// Each item becomes its own Booking row under this Order.
// Pricing is computed entirely server-side from TicketType prices.
 
export interface OrderItemCreate {
  ticket_type_id: number;
  quantity: number;
}
 
export interface OrderCreate {
  event_id: number;
  items: OrderItemCreate[];
}
 
export interface OrderOut {
  id: number;
  user_id: number;
  event_id: number;
  total_price: number;       // backend-computed: sum of (ticket_type.price * quantity) across all line items
  status: string;
  created_at: string;
  updated_at: string;
  bookings: BookingOut[];     // one per ticket type — useful for receipts/breakdowns
}
 
// ── Orders ────────────────────────────────────────────────────────────────────
 
export const createOrder = async (data: OrderCreate): Promise<OrderOut> => {
  return (await api.post('/users/me/orders', data)).data;
};
 
export const getUserOrders = async (): Promise<OrderOut[]> => {
  return (await api.get('/users/me/orders')).data;
};
 
export const getUserOrderById = async (orderId: number): Promise<OrderOut> => {
  return (await api.get(`/users/me/orders/${orderId}`)).data;
};

// ── User ──────────────────────────────────────────────────────────────────────

export const getUserBookings = async (): Promise<BookingOut[]> => {
  return (await api.get('/users/me/bookings')).data;
};

export const getUserBookingById = async (
  bookingId: number,
): Promise<BookingOut> => {
  return (await api.get(`/users/me/bookings/${bookingId}`)).data;
};

export const getUserBookingsByStatus = async (
  status: string,
): Promise<BookingOut[]> => {
  return (await api.get(`/users/me/bookings/status/${status}`)).data;
};

export const getUserBookingCount = async (): Promise<number> => {
  return (await api.get('/users/me/bookings/count')).data;
};

export const cancelBooking = async (bookingId: number): Promise<void> => {
  await api.patch(`/users/me/bookings/${bookingId}`);
};

// ── Organizer ─────────────────────────────────────────────────────────────────

// organizer_getRecentBookings returns BookingEnriched (backend does the join).
// All other organizer booking endpoints currently return plain BookingOut.
// Phase 3 will add joins to those endpoints so BookingsView.tsx can show
// customer_name, event_title, ticket_type_name. Update return types then.
export const organizer_getEventBookings = async (
  eventId: number,
): Promise<BookingOut[]> => {
  return (
    await api.get(`/organizers/me/events/${eventId}/bookings`)
  ).data;
};

export const organizer_getBookingById = async (
  bookingId: number,
): Promise<BookingOut> => {
  return (await api.get(`/organizers/me/bookings/${bookingId}`)).data;
};

export const organizer_getBookingsByTicketType = async (
  eventId: number,
  ticketTypeId: number,
): Promise<BookingOut[]> => {
  return (
    await api.get(
      `/organizers/me/events/${eventId}/ticket-types/${ticketTypeId}/bookings`,
    )
  ).data;
};

export const organizer_getRecentBookings = async (
  limit = 10,
): Promise<BookingEnriched[]> => {
  return (
    await api.get(`/organizers/me/recent-bookings?limit=${limit}`)
  ).data;
};

export const organizer_getLatestEventBookings = async (
  eventId: number,
): Promise<BookingOut[]> => {
  return (
    await api.get(`/organizers/me/events/${eventId}/latest-bookings`)
  ).data;
};

export const organizer_getBookingsInDateRange = async (
  start: string,
  end: string,
): Promise<BookingOut[]> => {
  return (
    await api.get(
      `/organizers/me/bookings/date-range/${start}-${end}`,
    )
  ).data;
};

// ── Admin ─────────────────────────────────────────────────────────────────────

// NOTE: admin booking endpoints currently return BookingOut (not enriched).
// Phase 3 will add a joined query on the backend returning customer_name,
// event_title, ticket_type_name. At that point, update these return types
// to BookingEnriched[]. The Bookings.tsx page relies on those fields.
export const admin_listAllBookings = async (): Promise<BookingOut[]> => {
  return (await api.get('/admin/bookings')).data;
};

export const admin_getBookingById = async (
  bookingId: number,
): Promise<BookingOut> => {
  return (await api.get(`/admin/bookings/${bookingId}`)).data;
};

export const admin_getRecentBookings = async (
  limit = 10,
): Promise<BookingOut[]> => {
  return (await api.get(`/admin/bookings/recent?limit=${limit}`)).data;
};

export const admin_getBookingsByStatus = async (
  status: string,
): Promise<BookingOut[]> => {
  return (await api.get(`/admin/bookings/status/${status}`)).data;
};

export const admin_getBookingsByUser = async (
  userId: number,
): Promise<BookingOut[]> => {
  return (await api.get(`/admin/bookings/user/${userId}`)).data;
};

export const admin_updateBooking = async (
  bookingId: number,
  data: BookingUpdate,
): Promise<BookingOut> => {
  return (await api.put(`/admin/bookings/${bookingId}`, data)).data;
};

export const admin_updateBookingStatus = async (
  bookingId: number,
  status: string,
): Promise<void> => {
  await api.patch(`/admin/bookings/${bookingId}/status`, null, {
    params: { booking_status: status },
  });
};

export const admin_deleteBooking = async (
  bookingId: number,
): Promise<void> => {
  await api.delete(`/admin/bookings/${bookingId}`);
};

export const admin_getBookingsInDateRange = async (
  start: string,
  end: string,
): Promise<BookingOut[]> => {
  return (
    await api.get(`/admin/bookings/date-range/${start}/${end}`)
  ).data;
};