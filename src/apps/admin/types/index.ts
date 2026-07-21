// src/apps/admin/types/index.ts

export type EventLifecycleStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'pending_deletion' | 'deleted';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'organizer' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  profile_picture_url?: string;
}

export interface CreateEventForm {
  title: string;
  description: string;
  venue: string;
  city: string;
  country: string;
  category: string;
  start_time: string;
  end_time: string;
  organizer_id: number | '';
  flyer: File | null;
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
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'deleted' | 'pending_deletion';
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_bookings?: number;
  total_revenue?: number;
  unresolved_bookings_count?: number;
}

export interface AdminBooking {
  id: number;
  order_id: number;
  user_id: number;
  event_id: number;
  ticket_type_id: number;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  total_price: number;
  created_at: string;
  updated_at: string;
  // Enriched fields — populated by the joined backend query
  customer_name?: string;
  customer_email?: string;
  event_title?: string;
  ticket_type_name?: string;
  venue?: string;
  event_date?: string;
}

export interface AdminPayment {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  // M-Pesa fields — all nullable; only populated after Daraja callback arrives
  mpesa_phone: string | null;
  mpesa_ref: string | null;         // MpesaReceiptNumber — present only on success
  mpesa_checkout_request_id: string | null;
  callback_payload: string | null;
  created_at: string;
  updated_at: string;
  // Enriched field from backend joined query (booking → user)
  user_name: string;                // display name for the admin payments table
}

export interface AdminTicketType {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  price: number;
  total_quantity: number;      // the ceiling — set at creation, raised by organizer
  quantity_available: number;  // computed server-side: total_quantity - quantity_sold
  quantity_sold: number;
  /** Cap on how many of this ticket type a single buyer can take in one order. */
  max_per_booking: number;
  is_active: boolean;
  // Presence of suspended_by_admin_id is the source of truth for "is this
  // suspended" — check `ticket.suspended_by_admin_id != null`, not a
  // separate boolean. Name/reason/timestamp are denormalized for display.
  suspended_by_admin_id: number | null;
  suspended_by_admin_name: string | null;
  suspension_reason: string | null;
  suspended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminTicketInstance {
  id: number;
  booking_id: number;
  ticket_type_id: number;
  status: 'valid' | 'used' | 'cancelled';
  qr_code?: string;
  created_at: string;
}

export interface CreateTicketTypePayload {
  event_id: number;
  name: string;
  description?: string;
  price: number;
  total_quantity: number;
  max_per_booking?: number;
  is_active?: boolean;
}

export interface ContactMessage {
  id: number;
  reference_id: string;
  source: string;               // will always be "organizer" from this endpoint
  event_title?: string | null;  // only populated for organizer messages
  user_id?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  category: string;
  message: string;
  status: 'new' | 'pending' | 'responded' | 'closed' | 'spam';
  priority: string;
  created_at: string;
  updated_at: string;
  responded_at?: string | null;
  closed_at?: string | null;
}

export interface DashboardStats {
  total_users: number;
  total_organizers: number;
  total_admins: number;
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

export interface AuditLogWithTotalCount {
  total: number;
  items: AuditLog[];
}

export type SortDirection = 'asc' | 'desc';
export type UserRole = 'user' | 'organizer' | 'admin';
export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'deleted' | 'pending_deletion';
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

export interface RefreshSession {
  session_id: string;        // PK — use this as the unique key in React lists
  user_id: number;
  device_info: string | null;
  ip_address: string | null;
  location: string | null;
  created_at: string;
  last_used_at: string;      // effectively "last active" — updated on every request
  expires_at: string;
  revoked_at: string | null;
  replaced_by_sid: string | null;
  is_active: boolean;        // computed property from the ORM model
}

export interface AdminMe {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  bio: string | null;
  created_at: string;
}
 
export interface AdminProfileUpdate {
  name?: string;
  phone_number?: string;
  bio?: string;
}

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

export interface ContactMessageStats {
  total: number;
  new: number;
  pending: number;
  responded: number;
  closed: number;
  spam: number;
}

export interface AdminOrderBookingLine {
  id: number;                 // Booking.id — the line item itself
  ticket_type_id: number;
  ticket_type_name: string;
  quantity: number;
  total_price: number;        // line total for this ticket type
  status: string;
}
 
export interface AdminOrder {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  event_id: number;
  event_title: string;
  total_price: number;
  status: string;             // pending | confirmed | cancelled
 
  // Payment fields — merged in (Order:Payment is 1:1)
  payment_id: number | null;
  payment_method: string | null;   // 'mpesa' | 'card' | null (no payment yet)
  payment_status: string | null;   // 'pending' | 'completed' | 'failed' | null
  mpesa_ref: string | null;
  mpesa_phone: string | null;
 
  created_at: string;
  updated_at: string;
  bookings: AdminOrderBookingLine[];
}

// Profile form types
export interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string | null;
}

export interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}