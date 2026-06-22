// src/apps/admin/services/adminService.ts
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

import type {
  AdminUser, AdminEvent, AdminBooking, AdminPayment, AdminMe, AdminProfileUpdate,
  ContactMessage, DashboardStats, AuditLog, RefreshSession, PlatformSettings,
  AdminNotificationPrefs, ContactMessageStats, AdminTicketType, CreateTicketTypePayload,
  EventLifecycleStatus
} from '@admin/types';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return (await api.get('/admin/analytics/dashboard')).data;
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getRevenueChart = async (months = 7): Promise<{ label: string; value: number }[]> => {
  return (await api.get(`/admin/analytics/revenue?months=${months}`)).data;
};

export const getUserGrowthChart = async (months = 6): Promise<{ label: string; value: number }[]> => {
  return (await api.get(`/admin/analytics/user-growth?months=${months}`)).data;
};

export const getEventCategories = async (): Promise<{ label: string; value: number }[]> => {
  return (await api.get('/admin/analytics/events-by-category')).data;
};

export const getBookingStatuses = async (): Promise<{ label: string; value: number }[]> => {
  return (await api.get('/admin/analytics/booking-statuses')).data;
};

export interface ActivityFeedItem {
  id: number;
  message: string;
  icon: string;
  time: string;
  action: string;
}

export const getActivityFeed = async (limit = 20): Promise<ActivityFeedItem[]> => {
  return (await api.get(`/admin/analytics/activity-feed?limit=${limit}`)).data;
};

// ─── Platform Settings ────────────────────────────────────────────────────────

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
  return (await api.get('/admin/settings')).data;
};

export const updatePlatformSettings = async (
  updates: Partial<Omit<PlatformSettings, 'updated_at' | 'updated_by_user_id'>>,
): Promise<PlatformSettings> => {
  return (await api.put('/admin/settings', updates)).data;
};

// ─── Admin Notification Preferences ──────────────────────────────────────────

export const getAdminNotificationPrefs = async (): Promise<AdminNotificationPrefs> => {
  return (await api.get('/admin/settings/notifications')).data;
};

export const updateAdminNotificationPrefs = async (
  updates: Partial<Omit<AdminNotificationPrefs, 'user_id' | 'updated_at'>>,
): Promise<AdminNotificationPrefs> => {
  return (await api.put('/admin/settings/notifications', updates)).data;
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

export const cleanupSessions = async (
  hours = 24,
): Promise<{ deleted_count: number; active_sessions: number; cleanup_threshold_hours: number }> => {
  return (await api.post(`/admin/auth/cleanup-sessions?hours=${hours}`)).data;
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const listAllUsers = async (): Promise<AdminUser[]> => {
  return (await api.get('/admin/users')).data;
};

export const getUserById = async (userId: number): Promise<AdminUser> => {
  return (await api.get(`/admin/users/${userId}`)).data;
};

export const deleteUser = async (_userId: number): Promise<boolean> => {
  return (await api.delete(`/admin/users/${_userId}`)).data;
};

export const activateUser = async (userId: number): Promise<AdminUser> => {
  return (await api.patch(`/admin/users/${userId}/activate`)).data;
};

export const deactivateUser = async (userId: number): Promise<AdminUser> => {
  return (await api.patch(`/admin/users/${userId}/deactivate`)).data;
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

export const listOrganizers = async (): Promise<AdminUser[]> => {
  // The existing listAllUsers endpoint returns everyone; filter server-side
  // if your backend supports it, otherwise filter client-side:
  const users = await listAllUsers();
  return users.filter(u => u.role === 'organizer');
  // If the backend later exposes GET /admin/users?role=organizer, use that:
  // return (await api.get('/admin/users?role=organizer')).data;
};

// ─── Events ───────────────────────────────────────────────────────────────────

export const listAllEvents = async (): Promise<AdminEvent[]> => {
  return (await api.get('/admin/all-events')).data;
};
 
export const getEventById = async (eventId: number): Promise<AdminEvent> => {
  return (await api.get(`/admin/events/${eventId}`)).data;
};

export const createEvent = async (
  form: {
    title: string;
    description: string;
    venue: string;
    city: string;
    country: string;
    category: string;
    start_time: string;   // ISO string
    end_time: string;     // ISO string
    organizer_id: number;
    flyer: File | null;
  },
): Promise<AdminEvent> => {
  const fd = new FormData();
  fd.append('title',        form.title);
  fd.append('description',  form.description);
  fd.append('venue',        form.venue);
  fd.append('city',         form.city);
  fd.append('country',      form.country);
  fd.append('category',     form.category);
  fd.append('start_time',   form.start_time);
  fd.append('end_time',     form.end_time);
  fd.append('organizer_id', String(form.organizer_id));
  if (form.flyer) fd.append('flyer', form.flyer);
 
  return (
    await api.post('/admin/events', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  ).data;
};
 
export const approveEvent = async (eventId: number): Promise<AdminEvent> => {
  // Backend route returns a plain bool, not the updated event — re-fetch
  // the full AdminEventOut afterwards so callers get correctly-typed data.
  const ok = (await api.patch(`/admin/events/${eventId}/approve`)).data as boolean;
  if (!ok) throw new Error('Failed to approve event.');
  return getEventById(eventId);
};
 
export const rejectEvent = async (eventId: number): Promise<AdminEvent> => {
  const ok = (await api.patch(`/admin/events/${eventId}/reject`)).data as boolean;
  if (!ok) throw new Error('Failed to reject event.');
  return getEventById(eventId);
};

export const updateEventStatus = async (
  eventId: number,
  newStatus: EventLifecycleStatus,
): Promise<AdminEvent> => {
  return (await api.patch(`/admin/events/${eventId}/status/${newStatus}`)).data;
};
 

export const deleteEvent = async (eventId: number): Promise<void> => {
  await api.delete(`/admin/events/${eventId}`);
};
 
export const getUnapprovedEvents = async (): Promise<AdminEvent[]> => {
  return (await api.get('/admin/events/unapproved')).data;
};
 
export const getEventsByOrganizer = async (organizerId: number): Promise<AdminEvent[]> => {
  return (await api.get(`/admin/events/organizer/${organizerId}`)).data;
}; 

// ─── Ticket Types ─────────────────────────────────────────────────────────────
 
export const createTicketType = async (
  payload: CreateTicketTypePayload,
): Promise<AdminTicketType> => {
  return (await api.post('/admin/ticket-types', payload)).data;
};
 
export const updateTicketType = async (
  ticketTypeId: number,
  payload: Partial<Omit<CreateTicketTypePayload, 'event_id'>>,
): Promise<AdminTicketType> => {
  return (await api.put(`/admin/ticket-types/${ticketTypeId}`, payload)).data;
};
 
export const deleteTicketType = async (ticketTypeId: number): Promise<void> => {
  await api.delete(`/admin/ticket-types/${ticketTypeId}`);
};
 
export const getTicketTypeById = async (ticketTypeId: number): Promise<AdminTicketType> => {
  return (await api.get(`/admin/ticket-types/${ticketTypeId}`)).data;
};
 
export const getTicketTypesByEvent = async (eventId: number): Promise<AdminTicketType[]> => {
  return (await api.get(`/admin/events/${eventId}/ticket-types`)).data;
};
 
// ─── Bookings ─────────────────────────────────────────────────────────────────

export const listAllBookings = async (): Promise<AdminBooking[]> => {
  return (await api.get('/admin/bookings')).data;
};

export const getBookingById = async (bookingId: number): Promise<AdminBooking> => {
  return (await api.get(`/admin/bookings/${bookingId}`)).data;
};

export const deleteBooking = async (_bookingId: number): Promise<void> => {
  await api.delete(`/admin/bookings/${_bookingId}`);
};

export const getBookingsByStatus = async (status: string): Promise<AdminBooking[]> => {
  return (await api.get(`/admin/bookings/status/${status}`)).data;
};

export const getRecentBookings = async (limit = 10): Promise<AdminBooking[]> => {
  return (await api.get(`/admin/bookings/recent?limit=${limit}`)).data;
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const listAllPayments = async (): Promise<AdminPayment[]> => {
  return (await api.get('/admin/payments')).data;
};

export const countPayments = async (): Promise<number> => {
  return (await api.get('/admin/payments/count')).data;
};

// ─── Contact Messages ─────────────────────────────────────────────────────────

type ContactMessageStatus = 'new' | 'pending' | 'responded' | 'closed' | 'spam';

export const listContactMessages = async (): Promise<ContactMessage[]> => {
  return (await api.get('/admin/contact')).data;
};

export const getContactMessage = async (messageId: number): Promise<ContactMessage> => {
  return (await api.get(`/admin/contact/${messageId}`)).data;
};

export const updateContactMessageStatus = async (
  messageId: number,
  status: ContactMessageStatus,
): Promise<ContactMessage> => {
  return (await api.patch(`/admin/contact/${messageId}/status`, { status })).data;
};

export const deleteContactMessage = async (messageId: number): Promise<void> => {
  await api.delete(`/admin/contact/${messageId}`);
};

export const getContactMessageStats = async (): Promise<ContactMessageStats> => {
  return (await api.get('/admin/contact/stats/overview')).data;
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const getUnreadNotificationCount = async (): Promise<number> => {
  return (await api.get('/admin/notifications/count/unread')).data;
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

export const clearReadNotifications = async (): Promise<{ deleted: number; message: string }> => {
  return (await api.delete('/admin/notifications/clear-read')).data;
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
};
 
export const getAuditLogById = async (logId: number): Promise<AuditLog> => {
  return (await api.get(`/admin/audit-logs/${logId}`)).data;
};
 
// ─── My Activity (MyProfile.tsx — 'My Activity' tab) ─────────────────────────
 
export const getMyActivity = async (): Promise<AuditLog[]> => {
  return (await api.get('/admin/audit-logs/my')).data;
};