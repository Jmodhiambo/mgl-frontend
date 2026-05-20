// src/apps/admin/types/index.ts

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'user' | 'organizer' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profile_picture_url?: string;
}

export interface AdminEvent {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  country: string;
  start_time: string;
  end_time: string;
  organizer_id: number;
  organizer_name?: string;
  flyer_url?: string;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'deleted';
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_bookings?: number;
  total_revenue?: number;
}

export interface AdminBooking {
  id: number;
  user_id: number;
  ticket_type_id: number;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  total_price: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  event_title?: string;
  ticket_type_name?: string;
  event_id?: number;
}

export interface AdminPayment {
  id: number;
  booking_id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface AdminTicketType {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  quantity_sold: number;
  sale_start?: string;
  sale_end?: string;
  is_active: boolean;
}

export interface AdminTicketInstance {
  id: number;
  booking_id: number;
  ticket_type_id: number;
  status: 'valid' | 'used' | 'cancelled';
  qr_code?: string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'responded' | 'closed' | 'spam';
  created_at: string;
  updated_at: string;
  handled_by?: number;
}

export interface DashboardStats {
  total_users: number;
  total_organizers: number;
  total_events: number;
  total_bookings: number;
  total_revenue: number;
  active_events: number;
  pending_approvals: number;
  open_messages: number;
  new_users_this_week: number;
  revenue_this_month: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface AuditLog {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: number;
  details: Record<string, unknown>;
  created_at: string;
}

export type SortDirection = 'asc' | 'desc';
export type UserRole = 'user' | 'organizer' | 'admin';
export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'deleted';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type MessageStatus = 'open' | 'responded' | 'closed' | 'spam';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface FilterState {
  search: string;
  status?: string;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}
