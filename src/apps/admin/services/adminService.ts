// src/apps/admin/services/adminService.ts
// ─────────────────────────────────────────────────────────────────────────────
// All admin API calls.
// To activate real API calls: uncomment the api.xxx() line and remove the
// dummy return in each function.  See existing functions for the pattern.
// ─────────────────────────────────────────────────────────────────────────────

// import api from '@shared/api/axiosConfig';

import type {
  AdminUser, AdminEvent, AdminBooking, AdminPayment,
  ContactMessage, DashboardStats, AuditLog, RefreshSession
} from '@admin/types';

import {
  dummyUsers, dummyEvents, dummyBookings, dummyPayments,
  dummyMessages, dummyDashboardStats,
  dummyRevenueChart, dummyUserGrowthChart, dummyEventCategories,
  dummyAuditLogs, dummyRefreshSessions,
} from '@admin/utils/dummyData';

// ─── Settings types ───────────────────────────────────────────────────────────

export interface PlatformSettings {
  platform_name: string;
  platform_email: string;
  support_email: string;
  default_currency: string;
  timezone: string;
  platform_fee_percent: number;
  require_event_approval: boolean;
  allow_user_registration: boolean;
  allow_organizer_signup: boolean;
  enable_refunds: boolean;
  max_tickets_per_booking: number;
  session_timeout_hours: number;
  maintenance_mode: boolean;
  updated_at: string;
  updated_by_user_id: number | null;
}

export interface AdminNotificationPrefs {
  user_id: number;
  notify_new_event: boolean;
  notify_new_message: boolean;
  notify_payment_failure: boolean;
  notify_new_organizer: boolean;
  notify_refund_request: boolean;
  updated_at: string;
}

// ─── Dummy settings data (mirrors backend defaults) ───────────────────────────

const dummyPlatformSettings: PlatformSettings = {
  platform_name: 'MGLTickets',
  platform_email: 'admin@mgltickets.com',
  support_email: 'support@mgltickets.com',
  default_currency: 'KES',
  timezone: 'Africa/Nairobi',
  platform_fee_percent: 5,
  require_event_approval: true,
  allow_user_registration: true,
  allow_organizer_signup: true,
  enable_refunds: true,
  max_tickets_per_booking: 10,
  session_timeout_hours: 24,
  maintenance_mode: false,
  updated_at: new Date().toISOString(),
  updated_by_user_id: null,
};

const dummyNotificationPrefs: AdminNotificationPrefs = {
  user_id: 1,
  notify_new_event: true,
  notify_new_message: true,
  notify_payment_failure: true,
  notify_new_organizer: true,
  notify_refund_request: true,
  updated_at: new Date().toISOString(),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // return (await api.get('/admin/analytics/dashboard')).data;
  return Promise.resolve(dummyDashboardStats);
};

// ─── Analytics ────────────────────────────────────────────────────────────────
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/analytics/dashboard
//     Should return DashboardStats object with aggregated platform metrics
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/analytics/revenue?period=monthly
//     Should return array of { label, value } for revenue chart
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/analytics/user-growth?period=monthly
//     Should return array of { label, value } for user growth chart
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/analytics/events-by-category
//     Should return array of { label, value } for category distribution
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/analytics/count (and /admin/analytics/count/:role)
//     Should return total user count, or count filtered by role

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

// ─── Platform Settings ────────────────────────────────────────────────────────

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
  // return (await api.get('/admin/settings')).data;
  return Promise.resolve({ ...dummyPlatformSettings });
};

export const updatePlatformSettings = async (
  updates: Partial<Omit<PlatformSettings, 'updated_at' | 'updated_by_user_id'>>,
): Promise<PlatformSettings> => {
  // return (await api.put('/admin/settings', updates)).data;
  return Promise.resolve({
    ...dummyPlatformSettings,
    ...updates,
    updated_at: new Date().toISOString(),
  });
};

// ─── Admin Notification Preferences ──────────────────────────────────────────

export const getAdminNotificationPrefs = async (): Promise<AdminNotificationPrefs> => {
  // return (await api.get('/admin/settings/notifications')).data;
  return Promise.resolve({ ...dummyNotificationPrefs });
};

export const updateAdminNotificationPrefs = async (
  updates: Partial<Omit<AdminNotificationPrefs, 'user_id' | 'updated_at'>>,
): Promise<AdminNotificationPrefs> => {
  // return (await api.put('/admin/settings/notifications', updates)).data;
  return Promise.resolve({
    ...dummyNotificationPrefs,
    ...updates,
    updated_at: new Date().toISOString(),
  });
};

// ─── Admin Profile — Active Sessions ─────────────────────────────────────────
// Backed by GET /admin/sessions → RefreshSession rows
 
export const getMyAdminSessions = async (): Promise<RefreshSession[]> => {
  // return (await api.get('/admin/sessions')).data;
  return Promise.resolve(dummyRefreshSessions);
};
 
export const revokeAdminSession = async (sessionId: string): Promise<void> => {
  // await api.delete(`/admin/sessions/${sessionId}`);
  return Promise.resolve();
};
 
export const revokeAllOtherAdminSessions = async (
  currentSessionId: string
): Promise<{ revoked_count: number; message: string }> => {
  // return (await api.delete('/admin/sessions', {
  //   data: { current_session_id: currentSessionId },
  // })).data;
  const others = dummyRefreshSessions.filter(s => s.session_id !== currentSessionId);
  return Promise.resolve({
    revoked_count: others.length,
    message: `${others.length} other session(s) have been signed out.`,
  });
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

// ─── Audit Logs (full list — AuditLogs.tsx page) ─────────────────────────────
 
export const listAuditLogs = async (params?: {
  admin_id?: number;
  action?: string;
  target_type?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; items: AuditLog[] }> => {
  // const query = new URLSearchParams();
  // if (params?.admin_id)    query.set('admin_id',    String(params.admin_id));
  // if (params?.action)      query.set('action',      params.action);
  // if (params?.target_type) query.set('target_type', params.target_type);
  // if (params?.from)        query.set('from',        params.from);
  // if (params?.to)          query.set('to',          params.to);
  // if (params?.limit)       query.set('limit',       String(params.limit));
  // if (params?.offset)      query.set('offset',      String(params.offset));
  // return (await api.get(`/admin/audit-logs?${query.toString()}`)).data;
  return Promise.resolve({ total: dummyAuditLogs.length, items: dummyAuditLogs });
};
 
export const getAuditLogById = async (logId: number): Promise<AuditLog> => {
  // return (await api.get(`/admin/audit-logs/${logId}`)).data;
  const log = dummyAuditLogs.find(l => l.id === logId);
  if (!log) throw new Error('Audit log not found');
  return Promise.resolve(log);
};
 
// ─── My Activity (MyProfile.tsx — 'My Activity' tab) ─────────────────────────
 
export const getMyActivity = async (): Promise<AuditLog[]> => {
  // return (await api.get('/admin/audit-logs/my')).data;
  return Promise.resolve(dummyAuditLogs);
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const cleanupSessions = async (hours = 24): Promise<{ deleted: number }> => {
  // return (await api.post(`/admin/auth/cleanup-sessions?hours=${hours}`)).data;
  return Promise.resolve({ deleted: 42 });
};