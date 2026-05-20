/**
 * src/apps/admin/services/adminService.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * All admin API calls.
 *
 * IMPORTANT — folder is named "services/" NOT "api/" deliberately.
 * Vite's dev server proxies every path starting with /api/ to FastAPI.
 * A folder called "api/" would cause Vite to rewrite relative imports like
 * "../api/adminService" into the URL "/api/adminService.tsx", which then
 * gets proxied to the backend and returns 404.
 * Naming it "services/" keeps it completely outside the proxy rule.
 *
 * To activate real API calls:
 *   1. Uncomment:  import api from '@shared/api/axiosConfig';
 *   2. In each function, uncomment the api.xxx() line and remove the dummy return.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// import api from '@shared/api/axiosConfig';

import type {
  AdminUser, AdminEvent, AdminBooking, AdminPayment,
  ContactMessage, DashboardStats,
} from '@admin/types';

import {
  dummyUsers, dummyEvents, dummyBookings, dummyPayments,
  dummyMessages, dummyDashboardStats,
  dummyRevenueChart, dummyUserGrowthChart, dummyEventCategories,
} from '@admin/utils/dummyData';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // return (await api.get('/admin/analytics/dashboard')).data;
  return Promise.resolve(dummyDashboardStats);
};

// ─── Charts ───────────────────────────────────────────────────────────────────

export const getRevenueChart = async (): Promise<{ label: string; value: number }[]> => {
  // return (await api.get('/admin/analytics/revenue')).data;
  return Promise.resolve(dummyRevenueChart);
};

export const getUserGrowthChart = async (): Promise<{ label: string; value: number }[]> => {
  // return (await api.get('/admin/analytics/user-growth')).data;
  return Promise.resolve(dummyUserGrowthChart);
};

export const getEventCategories = async (): Promise<{ label: string; value: number }[]> => {
  // return (await api.get('/admin/analytics/events-by-category')).data;
  return Promise.resolve(dummyEventCategories);
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const listAllUsers = async (): Promise<AdminUser[]> => {
  // return (await api.get('/admin/users')).data;
  return Promise.resolve(dummyUsers);
};

export const getUserById = async (userId: number): Promise<AdminUser> => {
  // return (await api.get(`/admin/users/${userId}`)).data;
  const user = dummyUsers.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  return Promise.resolve(user);
};

export const deleteUser = async (_userId: number): Promise<boolean> => {
  // return (await api.delete(`/admin/users/${_userId}`)).data;
  return Promise.resolve(true);
};

export const activateUser = async (userId: number): Promise<AdminUser> => {
  // return (await api.patch(`/admin/users/${userId}/activate`)).data;
  const user = dummyUsers.find(u => u.id === userId)!;
  return Promise.resolve({ ...user, is_active: true });
};

export const deactivateUser = async (userId: number): Promise<AdminUser> => {
  // return (await api.patch(`/admin/users/${userId}/deactivate`)).data;
  const user = dummyUsers.find(u => u.id === userId)!;
  return Promise.resolve({ ...user, is_active: false });
};

export const verifyUserEmail = async (userId: number): Promise<AdminUser> => {
  // return (await api.patch(`/admin/users/${userId}/verify`)).data;
  const user = dummyUsers.find(u => u.id === userId)!;
  return Promise.resolve({ ...user, is_verified: true });
};

export const promoteToOrganizer = async (userId: number): Promise<AdminUser> => {
  // return (await api.patch(`/admin/users/${userId}/role/user-to-organizer`)).data;
  const user = dummyUsers.find(u => u.id === userId)!;
  return Promise.resolve({ ...user, role: 'organizer' });
};

export const promoteToAdmin = async (userId: number): Promise<AdminUser> => {
  // return (await api.patch(`/admin/users/${userId}/role/user-to-admin`)).data;
  const user = dummyUsers.find(u => u.id === userId)!;
  return Promise.resolve({ ...user, role: 'admin' });
};

export const demoteFromAdmin = async (userId: number): Promise<AdminUser> => {
  // return (await api.patch(`/admin/users/${userId}/role/admin-to-user`)).data;
  const user = dummyUsers.find(u => u.id === userId)!;
  return Promise.resolve({ ...user, role: 'user' });
};

export const demoteFromOrganizer = async (userId: number): Promise<AdminUser> => {
  // return (await api.patch(`/admin/users/${userId}/role/organizer-to-user`)).data;
  const user = dummyUsers.find(u => u.id === userId)!;
  return Promise.resolve({ ...user, role: 'user' });
};

export const searchUsersByName = async (name: string): Promise<AdminUser[]> => {
  // return (await api.get(`/admin/users/search?name=${name}`)).data;
  return Promise.resolve(
    dummyUsers.filter(u =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(name.toLowerCase())
    )
  );
};

// ─── Events ───────────────────────────────────────────────────────────────────

export const listAllEvents = async (): Promise<AdminEvent[]> => {
  // return (await api.get('/admin/events')).data;
  return Promise.resolve(dummyEvents);
};

export const getEventById = async (eventId: number): Promise<AdminEvent> => {
  // return (await api.get(`/admin/events/${eventId}`)).data;
  const event = dummyEvents.find(e => e.id === eventId);
  if (!event) throw new Error('Event not found');
  return Promise.resolve(event);
};

export const approveEvent = async (_eventId: number): Promise<boolean> => {
  // return (await api.patch(`/admin/events/${_eventId}/approve`)).data;
  return Promise.resolve(true);
};

export const rejectEvent = async (_eventId: number): Promise<boolean> => {
  // return (await api.patch(`/admin/events/${_eventId}/reject`)).data;
  return Promise.resolve(true);
};

export const deleteEvent = async (_eventId: number): Promise<boolean> => {
  // return (await api.delete(`/admin/events/${_eventId}`)).data;
  return Promise.resolve(true);
};

export const getUnapprovedEvents = async (): Promise<AdminEvent[]> => {
  // return (await api.get('/admin/events/unapproved')).data;
  return Promise.resolve(dummyEvents.filter(e => !e.is_approved));
};

export const getEventsByOrganizer = async (organizerId: number): Promise<AdminEvent[]> => {
  // return (await api.get(`/admin/events/organizer/${organizerId}`)).data;
  return Promise.resolve(dummyEvents.filter(e => e.organizer_id === organizerId));
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const listAllBookings = async (): Promise<AdminBooking[]> => {
  // return (await api.get('/admin/bookings')).data;
  return Promise.resolve(dummyBookings);
};

export const getBookingById = async (bookingId: number): Promise<AdminBooking> => {
  // return (await api.get(`/admin/bookings/${bookingId}`)).data;
  const booking = dummyBookings.find(b => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');
  return Promise.resolve(booking);
};

export const deleteBooking = async (_bookingId: number): Promise<void> => {
  // await api.delete(`/admin/bookings/${_bookingId}`);
  return Promise.resolve();
};

export const getBookingsByStatus = async (status: string): Promise<AdminBooking[]> => {
  // return (await api.get(`/admin/bookings/status/${status}`)).data;
  return Promise.resolve(dummyBookings.filter(b => b.status === status));
};

export const getRecentBookings = async (limit = 10): Promise<AdminBooking[]> => {
  // return (await api.get(`/admin/bookings/recent?limit=${limit}`)).data;
  return Promise.resolve(dummyBookings.slice(0, limit));
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const listAllPayments = async (): Promise<AdminPayment[]> => {
  // return (await api.get('/admin/payments')).data;
  return Promise.resolve(dummyPayments);
};

export const countPayments = async (): Promise<number> => {
  // return (await api.get('/admin/payments/count')).data;
  return Promise.resolve(dummyPayments.length);
};

// ─── Contact Messages ─────────────────────────────────────────────────────────

export const listContactMessages = async (): Promise<ContactMessage[]> => {
  // return (await api.get('/admin/contact')).data;
  return Promise.resolve(dummyMessages);
};

export const getContactMessage = async (messageId: number): Promise<ContactMessage> => {
  // return (await api.get(`/admin/contact/${messageId}`)).data;
  const msg = dummyMessages.find(m => m.id === messageId);
  if (!msg) throw new Error('Message not found');
  return Promise.resolve(msg);
};

export const markMessageAsResponded = async (messageId: number): Promise<ContactMessage> => {
  // return (await api.patch(`/admin/contact/${messageId}/respond`)).data;
  const msg = dummyMessages.find(m => m.id === messageId)!;
  return Promise.resolve({ ...msg, status: 'responded' as const });
};

export const markMessageAsClosed = async (messageId: number): Promise<ContactMessage> => {
  // return (await api.patch(`/admin/contact/${messageId}/close`)).data;
  const msg = dummyMessages.find(m => m.id === messageId)!;
  return Promise.resolve({ ...msg, status: 'closed' as const });
};

export const markMessageAsSpam = async (messageId: number): Promise<ContactMessage> => {
  // return (await api.patch(`/admin/contact/${messageId}/spam`)).data;
  const msg = dummyMessages.find(m => m.id === messageId)!;
  return Promise.resolve({ ...msg, status: 'spam' as const });
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const cleanupSessions = async (hours = 24): Promise<{ deleted: number }> => {
  // return (await api.post(`/admin/auth/cleanup-sessions?hours=${hours}`)).data;
  return Promise.resolve({ deleted: 42 });
};