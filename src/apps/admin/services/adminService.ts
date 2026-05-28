// src/apps/admin/services/adminService.ts
// ─────────────────────────────────────────────────────────────────────────────
// All admin API calls.
// To activate real API calls: uncomment the api.xxx() line and remove the
// dummy return in each function.  See existing functions for the pattern.
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

import type {
  AdminUser, AdminEvent, AdminBooking, AdminPayment, AdminMe, AdminProfileUpdate,
  ContactMessage, DashboardStats, AuditLog, RefreshSession, PlatformSettings,
  AdminNotificationPrefs, ContactMessageStats,
} from '@admin/types';

import {
  dummyEvents, dummyBookings, dummyPayments,
  dummyDashboardStats, dummyRevenueChart, dummyUserGrowthChart, dummyEventCategories,
} from '@admin/utils/dummyData';

// ─── Settings types ───────────────────────────────────────────────────────────

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
  return (await api.get('/admin/settings')).data;
  // return Promise.resolve({ ...dummyPlatformSettings });
};

export const updatePlatformSettings = async (
  updates: Partial<Omit<PlatformSettings, 'updated_at' | 'updated_by_user_id'>>,
): Promise<PlatformSettings> => {
  return (await api.put('/admin/settings', updates)).data;
  // return Promise.resolve({
  //   ...dummyPlatformSettings,
  //   ...updates,
  //   updated_at: new Date().toISOString(),
  // });
};

// ─── Admin Notification Preferences ──────────────────────────────────────────

export const getAdminNotificationPrefs = async (): Promise<AdminNotificationPrefs> => {
  return (await api.get('/admin/settings/notifications')).data;
  // return Promise.resolve({ ...dummyNotificationPrefs });
};

export const updateAdminNotificationPrefs = async (
  updates: Partial<Omit<AdminNotificationPrefs, 'user_id' | 'updated_at'>>,
): Promise<AdminNotificationPrefs> => {
  return (await api.put('/admin/settings/notifications', updates)).data;
  // return Promise.resolve({
  //   ...dummyNotificationPrefs,
  //   ...updates,
  //   updated_at: new Date().toISOString(),
  // });
};

// ─── Admin Profile — Update Profile ──────────────────────────────────────────

export const getMyAdminProfile = async (): Promise<AdminMe> => {
  return (await api.get('/admin/users/me')).data;
};
 
export const updateAdminProfile = async (payload: AdminProfileUpdate): Promise<AdminMe> => {
  return (await api.patch('/admin/users/me', payload)).data;
};

export const changeAdminPassword = async (
  current_password: string,
  new_password: string
): Promise<void> => {
  await api.patch('/users/me/change-password', { old_password: current_password, new_password });
};

// ─── Admin Profile — Active Sessions ─────────────────────────────────────────
// Backed by GET /admin/sessions → RefreshSession rows
 
export const getMyAdminSessions = async (): Promise<RefreshSession[]> => {
  return (await api.get('/admin/sessions')).data;
};
 
export const revokeAdminSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/admin/sessions/${sessionId}`);
};
 
export const revokeAllOtherAdminSessions = async (
  currentSessionId: string
): Promise<{ revoked_count: number; message: string }> => {
  return (await api.delete('/admin/sessions', {
    data: { current_session_id: currentSessionId },
  })).data;
};

// ─── Session Cleanup ──────────────────────────────────────────────────────────
// Backend: POST /admin/auth/cleanup-sessions?hours={n}
// Response: { deleted_count: number, active_sessions: number, cleanup_threshold_hours: number }
 
export const cleanupSessions = async (
  hours = 24,
): Promise<{ deleted_count: number; active_sessions: number; cleanup_threshold_hours: number }> => {
  return (await api.post(`/admin/auth/cleanup-sessions?hours=${hours}`)).data;
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const listAllUsers = async (): Promise<AdminUser[]> => {
  return (await api.get('/admin/users')).data;
  // return Promise.resolve(dummyUsers);
};

export const getUserById = async (userId: number): Promise<AdminUser> => {
  return (await api.get(`/admin/users/${userId}`)).data;
  // const user = dummyUsers.find(u => u.id === userId);
  // if (!user) throw new Error('User not found');
  // return Promise.resolve(user);
};

export const deleteUser = async (_userId: number): Promise<boolean> => {
  return (await api.delete(`/admin/users/${_userId}`)).data;
  // return Promise.resolve(true);
};

export const activateUser = async (userId: number): Promise<AdminUser> => {
  return (await api.patch(`/admin/users/${userId}/activate`)).data;
  // const user = dummyUsers.find(u => u.id === userId)!;
  // return Promise.resolve({ ...user, is_active: true });
};

export const deactivateUser = async (userId: number): Promise<AdminUser> => {
  return (await api.patch(`/admin/users/${userId}/deactivate`)).data;
  // const user = dummyUsers.find(u => u.id === userId)!;
  // return Promise.resolve({ ...user, is_active: false });
};

export const verifyUserEmail = async (userId: number): Promise<AdminUser> => {
  return (await api.patch(`/admin/users/${userId}/verify`)).data;
};

export const updateUserRole = async (
  userId: number,
  role: 'user' | 'organizer' | 'admin',
): Promise<AdminUser> => {
  return (await api.patch(`/admin/users/${userId}/update-role/${role}`)).data;
};

export const searchUsersByName = async (name: string): Promise<AdminUser[]> => {
  return (await api.get(`/admin/users/search?name=${name}`)).data;
  // return Promise.resolve(
  //   dummyUsers.filter(u =>
  //     `${u.first_name} ${u.last_name}`.toLowerCase().includes(name.toLowerCase())
  //   )
  // );
};

export const updateUserEmail = async (userId: number, newEmail: string): Promise<AdminUser> => {
  return (
    await api.patch('/admin/users/update-user-email/', {
      user_id: userId,
      new_email: newEmail,
    })
  ).data;
};

export const resendVerificationEmail = async (
  userId: number,
): Promise<{ success: boolean; message: string }> => {
  return (await api.post(`/admin/users/${userId}/resend-verification`)).data;
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

type ContactMessageStatus = 'new' | 'pending' | 'responded' | 'closed' | 'spam';

export const listContactMessages = async (): Promise<ContactMessage[]> => {
  return (await api.get('/admin/contact')).data;
  // return Promise.resolve(dummyMessages);
};

export const getContactMessage = async (messageId: number): Promise<ContactMessage> => {
  return (await api.get(`/admin/contact/${messageId}`)).data;
  // const msg = dummyMessages.find(m => m.id === messageId);
  // if (!msg) throw new Error('Message not found');
  // return Promise.resolve(msg);
};

export const updateContactMessageStatus = async (
  messageId: number,
  status: ContactMessageStatus,
): Promise<ContactMessage> => {
  return (await api.patch(`/admin/contact/${messageId}/status`, { status })).data;
  // const msg = dummyMessages.find(m => m.id === messageId)!;
  // return Promise.resolve({ ...msg, status });
};

export const deleteContactMessage = async (messageId: number): Promise<void> => {
  await api.delete(`/admin/contact/${messageId}`);
  // return Promise.resolve();
};

export const getContactMessageStats = async (): Promise<ContactMessageStats> => {
  return (await api.get('/admin/contact/stats/overview')).data;
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const getUnreadNotificationCount = async (): Promise<number> => {
  return (await api.get('/admin/notifications/count/unread')).data;
  // return Promise.resolve(3);
};

export const listAdminNotifications = async (limit = 50, offset = 0) => {
  return (await api.get(`/admin/notifications?limit=${limit}&offset=${offset}`)).data;
};

export const markNotificationRead = async (notificationId: number) => {
  return (await api.patch(`/admin/notifications/${notificationId}/read`)).data;
};

export const markAllNotificationsRead = async () => {
  return (await api.patch('/admin/notifications/read-all')).data;
};

export const dismissNotification = async (notificationId: number) => {
  return (await api.delete(`/admin/notifications/${notificationId}`)).data;
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
  const query = new URLSearchParams();
  if (params?.admin_id)    query.set('admin_id',    String(params.admin_id));
  if (params?.action)      query.set('action',      params.action);
  if (params?.target_type) query.set('target_type', params.target_type);
  if (params?.from)        query.set('from',        params.from);
  if (params?.to)          query.set('to',          params.to);
  if (params?.limit)       query.set('limit',       String(params.limit));
  if (params?.offset)      query.set('offset',      String(params.offset));
  return (await api.get(`/admin/audit-logs?${query.toString()}`)).data;
  // return Promise.resolve({ total: dummyAuditLogs.length, items: dummyAuditLogs });
};
 
export const getAuditLogById = async (logId: number): Promise<AuditLog> => {
  return (await api.get(`/admin/audit-logs/${logId}`)).data;
  // const log = dummyAuditLogs.find(l => l.id === logId);
  // if (!log) throw new Error('Audit log not found');
  // return Promise.resolve(log);
};
 
// ─── My Activity (MyProfile.tsx — 'My Activity' tab) ─────────────────────────
 
export const getMyActivity = async (): Promise<AuditLog[]> => {
  return (await api.get('/admin/audit-logs/my')).data;
  // return Promise.resolve(dummyAuditLogs);
};