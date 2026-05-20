/**
 * Admin API Module
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls to backend admin endpoints.
 * Currently uses dummy data for UI visualization.
 * To activate: uncomment the api.xxx() calls and remove dummy data returns.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// import api from '@shared/api/axiosConfig';
import type {
  AdminUser, AdminEvent, AdminBooking, AdminPayment,
  ContactMessage, DashboardStats,
} from '../types';
import {
  dummyUsers, dummyEvents, dummyBookings, dummyPayments,
  dummyMessages, dummyDashboardStats,
} from '../utils/dummyData';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // return (await api.get('/admin/analytics/dashboard')).data;
  return Promise.resolve(dummyDashboardStats);
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

export const deleteUser = async (userId: number): Promise<boolean> => {
  // return (await api.delete(`/admin/users/${userId}`)).data;
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

export const countUsersByRole = async (role?: string): Promise<number> => {
  // return (await api.get(`/admin/analytics/count${role ? `/${role}` : ''}`)).data;
  if (!role) return Promise.resolve(dummyUsers.length);
  return Promise.resolve(dummyUsers.filter(u => u.role === role).length);
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

export const approveEvent = async (eventId: number): Promise<boolean> => {
  // return (await api.patch(`/admin/events/${eventId}/approve`)).data;
  return Promise.resolve(true);
};

export const rejectEvent = async (eventId: number): Promise<boolean> => {
  // return (await api.patch(`/admin/events/${eventId}/reject`)).data;
  return Promise.resolve(true);
};

export const deleteEvent = async (eventId: number): Promise<boolean> => {
  // return (await api.delete(`/admin/events/${eventId}`)).data;
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

export const deleteBooking = async (bookingId: number): Promise<void> => {
  // await api.delete(`/admin/bookings/${bookingId}`);
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
  return Promise.resolve({ ...msg, status: 'responded' });
};

export const markMessageAsClosed = async (messageId: number): Promise<ContactMessage> => {
  // return (await api.patch(`/admin/contact/${messageId}/close`)).data;
  const msg = dummyMessages.find(m => m.id === messageId)!;
  return Promise.resolve({ ...msg, status: 'closed' });
};

export const markMessageAsSpam = async (messageId: number): Promise<ContactMessage> => {
  // return (await api.patch(`/admin/contact/${messageId}/spam`)).data;
  const msg = dummyMessages.find(m => m.id === messageId)!;
  return Promise.resolve({ ...msg, status: 'spam' });
};

// ─── Analytics ────────────────────────────────────────────────────────────────
// NOTE: These endpoints need to be added to the backend ─────────────────────────
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/analytics/dashboard
//     Should return DashboardStats object with aggregated platform metrics
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/analytics/revenue?period=monthly
//     Should return array of { label, value } for revenue chart
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/analytics/user-growth?period=monthly
//     Should return array of { label, value } for user growth chart
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/analytics/events-by-category
//     Should return array of { label, value } for category distribution

export const getRevenueChart = async () => {
  // return (await api.get('/admin/analytics/revenue?period=monthly')).data;
  const { dummyRevenueChart } = await import('../utils/dummyData');
  return Promise.resolve(dummyRevenueChart);
};

export const getUserGrowthChart = async () => {
  // return (await api.get('/admin/analytics/user-growth?period=monthly')).data;
  const { dummyUserGrowthChart } = await import('../utils/dummyData');
  return Promise.resolve(dummyUserGrowthChart);
};

export const getEventCategories = async () => {
  // return (await api.get('/admin/analytics/events-by-category')).data;
  const { dummyEventCategories } = await import('../utils/dummyData');
  return Promise.resolve(dummyEventCategories);
};

// ─── Auth / Sessions ──────────────────────────────────────────────────────────

export const cleanupSessions = async (hours = 24): Promise<{ deleted: number }> => {
  // return (await api.post(`/admin/auth/cleanup-sessions?hours=${hours}`)).data;
  return Promise.resolve({ deleted: 42 });
};
