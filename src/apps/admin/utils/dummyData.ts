// src/apps/admin/utils/dummyData.tsx
// ─── DUMMY DATA FOR UI VISUALIZATION ────────────────────────────────────────
// All data here is placeholder. To connect real data, update adminService.tsx.

import type {
  AdminUser, AdminEvent, AdminBooking, AdminPayment,
  ContactMessage, DashboardStats, AuditLog, AdminTicketType,
} from '@admin/types';

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export const dummyDashboardStats: DashboardStats = {
  total_users: 4_821,
  total_organizers: 312,
  total_events: 748,
  total_bookings: 18_450,
  total_revenue: 3_847_200,
  active_events: 47,
  pending_approvals: 12,
  open_messages: 8,
  new_users_this_week: 234,
  revenue_this_month: 428_500,
};

// ─── Charts ───────────────────────────────────────────────────────────────────
export const dummyRevenueChart = [
  { label: 'Oct', value: 280_000 },
  { label: 'Nov', value: 340_000 },
  { label: 'Dec', value: 520_000 },
  { label: 'Jan', value: 310_000 },
  { label: 'Feb', value: 390_000 },
  { label: 'Mar', value: 428_500 },
  { label: 'Apr', value: 195_000 },
];

export const dummyUserGrowthChart = [
  { label: 'Oct', value: 3_920 },
  { label: 'Nov', value: 4_100 },
  { label: 'Dec', value: 4_210 },
  { label: 'Jan', value: 4_380 },
  { label: 'Feb', value: 4_587 },
  { label: 'Mar', value: 4_821 },
];

export const dummyEventCategories = [
  { label: 'Music',   value: 28 },
  { label: 'Tech',    value: 18 },
  { label: 'Sports',  value: 15 },
  { label: 'Food',    value: 12 },
  { label: 'Comedy',  value: 10 },
  { label: 'Culture', value: 9  },
  { label: 'Other',   value: 8  },
];

export const dummyBookingStatuses = [
  { label: 'Confirmed', value: 14_200 },
  { label: 'Pending',   value: 1_840  },
  { label: 'Cancelled', value: 1_650  },
  { label: 'Refunded',  value: 760    },
];

// ─── Users ────────────────────────────────────────────────────────────────────
export const dummyUsers: AdminUser[] = [
  { id: 1,  first_name: 'Alice',  last_name: 'Mwangi',   email: 'alice@example.com',  role: 'admin',     is_active: true,  is_verified: true,  created_at: '2024-01-15T10:00:00Z', updated_at: '2024-03-01T12:00:00Z' },
  { id: 2,  first_name: 'Brian',  last_name: 'Otieno',   email: 'brian@example.com',  role: 'organizer', is_active: true,  is_verified: true,  created_at: '2024-02-10T08:30:00Z', updated_at: '2024-03-10T09:00:00Z' },
  { id: 3,  first_name: 'Carol',  last_name: 'Njoroge',  email: 'carol@example.com',  role: 'user',      is_active: true,  is_verified: true,  created_at: '2024-02-20T14:00:00Z', updated_at: '2024-02-20T14:00:00Z' },
  { id: 4,  first_name: 'David',  last_name: 'Kimani',   email: 'david@example.com',  role: 'user',      is_active: false, is_verified: false, created_at: '2024-03-01T11:00:00Z', updated_at: '2024-03-15T16:00:00Z' },
  { id: 5,  first_name: 'Eve',    last_name: 'Wanjiku',  email: 'eve@example.com',    role: 'organizer', is_active: true,  is_verified: true,  created_at: '2024-03-05T09:00:00Z', updated_at: '2024-03-05T09:00:00Z' },
  { id: 6,  first_name: 'Frank',  last_name: 'Odhiambo', email: 'frank@example.com',  role: 'user',      is_active: true,  is_verified: false, created_at: '2024-03-12T13:00:00Z', updated_at: '2024-03-12T13:00:00Z' },
  { id: 7,  first_name: 'Grace',  last_name: 'Achieng',  email: 'grace@example.com',  role: 'user',      is_active: true,  is_verified: true,  created_at: '2024-03-18T10:00:00Z', updated_at: '2024-03-18T10:00:00Z' },
  { id: 8,  first_name: 'Henry',  last_name: 'Muriuki',  email: 'henry@example.com',  role: 'organizer', is_active: true,  is_verified: true,  created_at: '2024-03-20T08:00:00Z', updated_at: '2024-03-20T08:00:00Z' },
  { id: 9,  first_name: 'Irene',  last_name: 'Chebet',   email: 'irene@example.com',  role: 'user',      is_active: false, is_verified: true,  created_at: '2024-03-22T15:00:00Z', updated_at: '2024-03-28T11:00:00Z' },
  { id: 10, first_name: 'James',  last_name: 'Gitonga',  email: 'james@example.com',  role: 'user',      is_active: true,  is_verified: true,  created_at: '2024-03-25T12:00:00Z', updated_at: '2024-03-25T12:00:00Z' },
  { id: 11, first_name: 'Karen',  last_name: 'Wambui',   email: 'karen@example.com',  role: 'organizer', is_active: true,  is_verified: true,  created_at: '2024-03-27T09:30:00Z', updated_at: '2024-03-27T09:30:00Z' },
  { id: 12, first_name: 'Leo',    last_name: 'Mutua',    email: 'leo@example.com',    role: 'user',      is_active: true,  is_verified: false, created_at: '2024-04-01T10:00:00Z', updated_at: '2024-04-01T10:00:00Z' },
];

// ─── Events ───────────────────────────────────────────────────────────────────
export const dummyEvents: AdminEvent[] = [
  { id: 1, title: 'Nairobi Jazz Festival',     slug: 'nairobi-jazz-festival',   description: 'Annual jazz festival.',          category: 'Music',   venue: 'KICC Grounds',       city: 'Nairobi', country: 'Kenya', start_time: '2025-05-15T18:00:00Z', end_time: '2025-05-15T23:00:00Z', organizer_id: 2,  organizer_name: 'Brian Otieno',  status: 'upcoming',  is_approved: true,  is_active: true,  created_at: '2025-03-01T10:00:00Z', updated_at: '2025-03-10T12:00:00Z', total_bookings: 450, total_revenue: 540000 },
  { id: 2, title: 'Tech Summit Nairobi 2025',  slug: 'tech-summit-2025',        description: 'East Africa tech conference.',   category: 'Tech',    venue: 'Radisson Blu',       city: 'Nairobi', country: 'Kenya', start_time: '2025-06-20T09:00:00Z', end_time: '2025-06-20T17:00:00Z', organizer_id: 5,  organizer_name: 'Eve Wanjiku',   status: 'upcoming',  is_approved: true,  is_active: true,  created_at: '2025-03-05T09:00:00Z', updated_at: '2025-03-15T10:00:00Z', total_bookings: 320, total_revenue: 960000 },
  { id: 3, title: 'Mombasa Beach Party',       slug: 'mombasa-beach-party',     description: 'Sunset beach party.',           category: 'Party',   venue: 'Bamburi Beach',      city: 'Mombasa', country: 'Kenya', start_time: '2025-04-12T16:00:00Z', end_time: '2025-04-13T02:00:00Z', organizer_id: 8,  organizer_name: 'Henry Muriuki', status: 'completed', is_approved: true,  is_active: false, created_at: '2025-02-10T08:00:00Z', updated_at: '2025-04-14T10:00:00Z', total_bookings: 680, total_revenue: 272000 },
  { id: 4, title: 'Food & Wine Festival',      slug: 'food-wine-festival-2025', description: 'Kenyan cuisine and wines.',     category: 'Food',    venue: 'The Hub Karen',      city: 'Nairobi', country: 'Kenya', start_time: '2025-07-05T12:00:00Z', end_time: '2025-07-05T20:00:00Z', organizer_id: 11, organizer_name: 'Karen Wambui',  status: 'upcoming',  is_approved: false, is_active: false, created_at: '2025-03-20T11:00:00Z', updated_at: '2025-03-20T11:00:00Z', total_bookings: 0,   total_revenue: 0 },
  { id: 5, title: 'Kisumu Comedy Night',       slug: 'kisumu-comedy-night',     description: 'Stand-up comedy night.',        category: 'Comedy',  venue: 'Imperial Hotel',     city: 'Kisumu',  country: 'Kenya', start_time: '2025-05-03T20:00:00Z', end_time: '2025-05-03T23:00:00Z', organizer_id: 2,  organizer_name: 'Brian Otieno',  status: 'upcoming',  is_approved: true,  is_active: true,  created_at: '2025-03-08T10:00:00Z', updated_at: '2025-03-18T09:00:00Z', total_bookings: 210, total_revenue: 105000 },
  { id: 6, title: 'Nairobi Marathon 2025',     slug: 'nairobi-marathon-2025',   description: 'Annual city marathon.',         category: 'Sports',  venue: 'Uhuru Park',         city: 'Nairobi', country: 'Kenya', start_time: '2025-08-10T06:00:00Z', end_time: '2025-08-10T14:00:00Z', organizer_id: 5,  organizer_name: 'Eve Wanjiku',   status: 'upcoming',  is_approved: true,  is_active: true,  created_at: '2025-02-25T10:00:00Z', updated_at: '2025-03-01T12:00:00Z', total_bookings: 890, total_revenue: 534000 },
  { id: 7, title: 'Afrobeats Night',           slug: 'afrobeats-night-april',   description: 'Live afrobeats music.',         category: 'Music',   venue: 'Alchemist Bar',      city: 'Nairobi', country: 'Kenya', start_time: '2025-04-25T21:00:00Z', end_time: '2025-04-26T03:00:00Z', organizer_id: 8,  organizer_name: 'Henry Muriuki', status: 'cancelled', is_approved: true,  is_active: false, created_at: '2025-03-10T10:00:00Z', updated_at: '2025-04-10T14:00:00Z', total_bookings: 45,  total_revenue: 0 },
  { id: 8, title: 'Nakuru Cultural Festival',  slug: 'nakuru-cultural-2025',    description: 'Celebrating Nakuru culture.',  category: 'Culture', venue: 'Nakuru Showground',  city: 'Nakuru',  country: 'Kenya', start_time: '2025-09-15T09:00:00Z', end_time: '2025-09-17T18:00:00Z', organizer_id: 11, organizer_name: 'Karen Wambui',  status: 'upcoming',  is_approved: false, is_active: false, created_at: '2025-04-01T10:00:00Z', updated_at: '2025-04-01T10:00:00Z', total_bookings: 0,   total_revenue: 0 },
];

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const dummyBookings: AdminBooking[] = [
  { id: 1, user_id: 3,  ticket_type_id: 1, quantity: 2, status: 'confirmed', total_price: 2400,  created_at: '2025-03-10T10:00:00Z', updated_at: '2025-03-10T10:00:00Z', customer_name: 'Carol Njoroge',  customer_email: 'carol@example.com',  event_title: 'Nairobi Jazz Festival',  ticket_type_name: 'General Admission', event_id: 1 },
  { id: 2, user_id: 6,  ticket_type_id: 2, quantity: 1, status: 'confirmed', total_price: 3000,  created_at: '2025-03-12T11:00:00Z', updated_at: '2025-03-12T11:00:00Z', customer_name: 'Frank Odhiambo', customer_email: 'frank@example.com',  event_title: 'Tech Summit Nairobi',    ticket_type_name: 'VIP',               event_id: 2 },
  { id: 3, user_id: 7,  ticket_type_id: 3, quantity: 4, status: 'confirmed', total_price: 1600,  created_at: '2025-03-15T09:00:00Z', updated_at: '2025-03-15T09:00:00Z', customer_name: 'Grace Achieng',  customer_email: 'grace@example.com',  event_title: 'Mombasa Beach Party',    ticket_type_name: 'Early Bird',        event_id: 3 },
  { id: 4, user_id: 9,  ticket_type_id: 1, quantity: 1, status: 'cancelled', total_price: 1200,  created_at: '2025-03-16T14:00:00Z', updated_at: '2025-03-20T10:00:00Z', customer_name: 'Irene Chebet',   customer_email: 'irene@example.com',  event_title: 'Nairobi Jazz Festival',  ticket_type_name: 'General Admission', event_id: 1 },
  { id: 5, user_id: 10, ticket_type_id: 5, quantity: 3, status: 'confirmed', total_price: 1500,  created_at: '2025-03-18T08:00:00Z', updated_at: '2025-03-18T08:00:00Z', customer_name: 'James Gitonga',  customer_email: 'james@example.com',  event_title: 'Kisumu Comedy Night',    ticket_type_name: 'Standard',          event_id: 5 },
  { id: 6, user_id: 12, ticket_type_id: 6, quantity: 1, status: 'pending',   total_price: 600,   created_at: '2025-03-20T12:00:00Z', updated_at: '2025-03-20T12:00:00Z', customer_name: 'Leo Mutua',      customer_email: 'leo@example.com',    event_title: 'Nairobi Marathon 2025',  ticket_type_name: '10KM',              event_id: 6 },
  { id: 7, user_id: 3,  ticket_type_id: 2, quantity: 2, status: 'refunded',  total_price: 6000,  created_at: '2025-03-22T15:00:00Z', updated_at: '2025-04-01T09:00:00Z', customer_name: 'Carol Njoroge',  customer_email: 'carol@example.com',  event_title: 'Tech Summit Nairobi',    ticket_type_name: 'VIP',               event_id: 2 },
  { id: 8, user_id: 7,  ticket_type_id: 7, quantity: 5, status: 'confirmed', total_price: 10000, created_at: '2025-03-25T10:00:00Z', updated_at: '2025-03-25T10:00:00Z', customer_name: 'Grace Achieng',  customer_email: 'grace@example.com',  event_title: 'Nairobi Marathon 2025',  ticket_type_name: 'Full Marathon',     event_id: 6 },
];

// ─── Payments ─────────────────────────────────────────────────────────────────
export const dummyPayments: AdminPayment[] = [
  { id: 1, booking_id: 1, amount: 2400,  status: 'completed', method: 'M-Pesa',        created_at: '2025-03-10T10:02:00Z', updated_at: '2025-03-10T10:02:00Z', user_name: 'Carol Njoroge'  },
  { id: 2, booking_id: 2, amount: 3000,  status: 'completed', method: 'Credit Card',   created_at: '2025-03-12T11:05:00Z', updated_at: '2025-03-12T11:05:00Z', user_name: 'Frank Odhiambo' },
  { id: 3, booking_id: 3, amount: 1600,  status: 'completed', method: 'M-Pesa',        created_at: '2025-03-15T09:03:00Z', updated_at: '2025-03-15T09:03:00Z', user_name: 'Grace Achieng'  },
  { id: 4, booking_id: 4, amount: 1200,  status: 'refunded',  method: 'M-Pesa',        created_at: '2025-03-16T14:02:00Z', updated_at: '2025-03-20T10:05:00Z', user_name: 'Irene Chebet'   },
  { id: 5, booking_id: 5, amount: 1500,  status: 'completed', method: 'Airtel Money',  created_at: '2025-03-18T08:02:00Z', updated_at: '2025-03-18T08:02:00Z', user_name: 'James Gitonga'  },
  { id: 6, booking_id: 6, amount: 600,   status: 'pending',   method: 'M-Pesa',        created_at: '2025-03-20T12:01:00Z', updated_at: '2025-03-20T12:01:00Z', user_name: 'Leo Mutua'      },
  { id: 7, booking_id: 7, amount: 6000,  status: 'refunded',  method: 'Credit Card',   created_at: '2025-03-22T15:02:00Z', updated_at: '2025-04-01T09:05:00Z', user_name: 'Carol Njoroge'  },
  { id: 8, booking_id: 8, amount: 10000, status: 'completed', method: 'Bank Transfer', created_at: '2025-03-25T10:03:00Z', updated_at: '2025-03-25T10:03:00Z', user_name: 'Grace Achieng'  },
];

// ─── Contact Messages ─────────────────────────────────────────────────────────
export const dummyMessages: ContactMessage[] = [
  { id: 1, reference_id: 'MSG-001', name: 'Alice Kamau',   email: 'alice.k@example.com', phone: undefined, subject: 'Issue with my booking',             category: 'booking', message: 'I booked tickets but never received a confirmation email. Booking ID #145.',                    status: 'new',      created_at: '2025-04-01T10:00:00Z', updated_at: '2025-04-01T10:00:00Z' },
  { id: 2, reference_id: 'MSG-002', name: 'Peter Njuguna', email: 'peter@example.com',   phone: undefined, subject: 'Refund request for cancelled event', category: 'refund',  message: 'The Afrobeats Night event was cancelled. I need a refund for my 3 tickets.',               status: 'responded', created_at: '2025-04-02T09:00:00Z', updated_at: '2025-04-03T14:00:00Z' },
  { id: 3, reference_id: 'MSG-003', name: 'Mary Wanjiku',  email: 'mary@example.com',    phone: undefined, subject: 'How to become an organizer?',        category: 'general', message: 'I want to start hosting events. What is the process to become a verified organizer?',        status: 'closed',    created_at: '2025-04-03T11:00:00Z', updated_at: '2025-04-04T10:00:00Z' },
  { id: 4, reference_id: 'MSG-004', name: 'John Mwenda',   email: 'john.m@example.com',  phone: undefined, subject: 'Payment failed but amount deducted', category: 'payment', message: 'My M-Pesa was deducted KES 1200 but booking shows as failed. Transaction ID: QH123456.',     status: 'new',      created_at: '2025-04-05T08:30:00Z', updated_at: '2025-04-05T08:30:00Z' },
  { id: 5, reference_id: 'MSG-005', name: 'Spam Bot 9000', email: 'spam@bot.com',        phone: undefined, subject: 'Buy cheap tickets!!!',               category: 'general', message: 'CLICK HERE FOR FREE TICKETS www.scam.com',                                                       status: 'spam',      created_at: '2025-04-05T12:00:00Z', updated_at: '2025-04-05T12:05:00Z' },
  { id: 6, reference_id: 'MSG-006', name: 'Diana Auma',    email: 'diana@example.com',   phone: undefined, subject: 'Event listing wrong date',           category: 'event',   message: 'The Nakuru Cultural Festival shows wrong start date. It says September 14 but should be 15.', status: 'new',      created_at: '2025-04-06T10:00:00Z', updated_at: '2025-04-06T10:00:00Z' },
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const dummyAuditLogs: AuditLog[] = [
  { id: 1, admin_id: 1, admin_name: 'Alice Mwangi', action: 'user_deactivated',    target_type: 'user',    target_id: 4,  details: { reason: 'Suspicious activity' },      created_at: '2025-04-06T10:00:00Z' },
  { id: 2, admin_id: 1, admin_name: 'Alice Mwangi', action: 'event_approved',      target_type: 'event',   target_id: 1,  details: { event_title: 'Nairobi Jazz Festival' }, created_at: '2025-03-10T12:00:00Z' },
  { id: 3, admin_id: 1, admin_name: 'Alice Mwangi', action: 'event_approved',      target_type: 'event',   target_id: 2,  details: { event_title: 'Tech Summit Nairobi' },   created_at: '2025-03-15T09:30:00Z' },
  { id: 4, admin_id: 1, admin_name: 'Alice Mwangi', action: 'user_role_changed',   target_type: 'user',    target_id: 11, details: { from: 'user', to: 'organizer' },        created_at: '2025-03-20T14:00:00Z' },
  { id: 5, admin_id: 1, admin_name: 'Alice Mwangi', action: 'message_marked_spam', target_type: 'message', target_id: 5,  details: { reference: 'MSG-005' },                 created_at: '2025-04-05T12:05:00Z' },
  { id: 6, admin_id: 1, admin_name: 'Alice Mwangi', action: 'event_rejected',      target_type: 'event',   target_id: 7,  details: { reason: 'Policy violation' },           created_at: '2025-04-10T14:00:00Z' },
  { id: 7, admin_id: 1, admin_name: 'Alice Mwangi', action: 'booking_refunded',    target_type: 'booking', target_id: 7,  details: { amount: 6000 },                         created_at: '2025-04-01T09:00:00Z' },
  { id: 8, admin_id: 1, admin_name: 'Alice Mwangi', action: 'user_verified',       target_type: 'user',    target_id: 6,  details: {},                                       created_at: '2025-04-06T15:00:00Z' },
];

// ─── Ticket Types ─────────────────────────────────────────────────────────────
export const dummyTicketTypes: AdminTicketType[] = [
  { id: 1, event_id: 1, name: 'General Admission', price: 1200, quantity: 500, quantity_sold: 350, is_active: true  },
  { id: 2, event_id: 2, name: 'VIP',               price: 3000, quantity: 100, quantity_sold: 80,  is_active: true  },
  { id: 3, event_id: 3, name: 'Early Bird',        price: 400,  quantity: 300, quantity_sold: 300, is_active: false },
  { id: 4, event_id: 3, name: 'Regular',           price: 500,  quantity: 400, quantity_sold: 380, is_active: false },
  { id: 5, event_id: 5, name: 'Standard',          price: 500,  quantity: 250, quantity_sold: 210, is_active: true  },
  { id: 6, event_id: 6, name: '10KM',              price: 600,  quantity: 500, quantity_sold: 420, is_active: true  },
  { id: 7, event_id: 6, name: 'Full Marathon',     price: 2000, quantity: 300, quantity_sold: 250, is_active: true  },
];

// ─── Activity Feed ────────────────────────────────────────────────────────────
export const dummyActivityFeed = [
  { id: 1, type: 'booking',  message: 'New booking by Grace Achieng for Nairobi Marathon',   time: '2 min ago',  icon: 'ticket'   },
  { id: 2, type: 'user',     message: 'New user registered: Leo Mutua',                       time: '8 min ago',  icon: 'user'     },
  { id: 3, type: 'event',    message: 'Tech Summit Nairobi 2025 submitted for approval',      time: '15 min ago', icon: 'calendar' },
  { id: 4, type: 'payment',  message: 'Payment of KES 10,000 received from Grace Achieng',   time: '22 min ago', icon: 'money'    },
  { id: 5, type: 'message',  message: 'New contact message from John Mwenda (payment issue)', time: '1 hr ago',   icon: 'message'  },
  { id: 6, type: 'approval', message: 'Food & Wine Festival pending your approval',           time: '2 hrs ago',  icon: 'check'    },
];

// ─── Formatters ───────────────────────────────────────────────────────────────
export const formatKES = (amount: number): string =>
  `KES ${amount.toLocaleString('en-KE')}`;

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export { timeAgo } from '@shared/utils/timeAgo';
