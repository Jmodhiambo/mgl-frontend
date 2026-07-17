// src/apps/organizer/pages/BookingsView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import {
  Search, Ticket, User, DollarSign, Download,
  CheckCircle, Clock, XCircle, AlertCircle,
  ChevronDown, ChevronRight, Package,
} from 'lucide-react';
import BookingDetailsModal from '@organizer/components/modals/bookings/BookingDetailsModal';
import EmailModal from '@organizer/components/modals/bookings/EmailModal';
import BulkActionBar from '@organizer/components/modals/bookings/BulkActionBar';
import BookingsTable from '@organizer/components/modals/bookings/BookingsTable';
import {
  organizer_getEventBookings,
  organizer_getRecentBookings,
} from '@shared/api/user/bookingsApi';
import {
  getOrganizerOrders,
  type OrganizerOrderOut,
  type OrganizerOrderBookingLine,
} from '@shared/api/organizer/orgOrderApi';
import { formatKES } from '@shared/utils/format';
import { sendOrganizerEmail } from '@shared/api/organizer/orgEmailsApi';
 
// ── Types ─────────────────────────────────────────────────────────────────────
 
interface Booking {
  id: number;
  order_id?: number;       // parent order — customer-facing reference
  user_id: number;
  event_id?: number;
  ticket_type_id: number;
  quantity: number;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  event_title?: string;
  ticket_type_name?: string;
  venue?: string;
  event_date?: string;
}
 
export interface EmailTemplateExtraField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
}
 
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  extraFields?: EmailTemplateExtraField[];
}
 
type ViewTab = 'orders' | 'bookings';
 
// ── Email templates (unchanged) ───────────────────────────────────────────────
 
const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'organizer.reminder',
    name: 'Event Reminder',
    subject: 'Reminder: {{event_title}} is Coming Up!',
    body: `Dear {{customer_name}},
 
This is a friendly reminder that {{event_title}} is coming up soon!
 
Event Details:
- Venue: {{venue}}
- Date & Time: {{event_date}}
- Ticket Type: {{ticket_type}}
- Quantity: {{quantity}} ticket(s)
- Order: #{{order_id}}
 
Please arrive 30 minutes before the event starts and bring a valid ID.
 
We look forward to seeing you!
 
Best regards,
{{organizer_name}}`,
  },
  {
    id: 'organizer.update',
    name: 'Event Update',
    subject: 'Important Update: {{event_title}}',
    body: `Dear {{customer_name}},
 
We have an important update regarding {{event_title}}.
 
{{update_message}}
 
Your Booking:
- Ticket Type: {{ticket_type}}
- Quantity: {{quantity}} ticket(s)
- Order: #{{order_id}}
 
If you have any questions, please contact us immediately.
 
Best regards,
{{organizer_name}}`,
    extraFields: [
      { key: 'update_message', label: 'Update Details', placeholder: 'Describe what has changed...', type: 'textarea' },
    ],
  },
  {
    id: 'organizer.thank_you',
    name: 'Thank You',
    subject: 'Thank You for Attending {{event_title}}!',
    body: `Dear {{customer_name}},
 
Thank you so much for attending {{event_title}}! We hope you had a wonderful experience.
 
We'd love to hear your feedback — what did you enjoy most, and what could we improve?
 
We look forward to seeing you at our future events!
 
Warm regards,
{{organizer_name}}`,
  },
  {
    id: 'organizer.cancellation',
    name: 'Event Cancellation',
    subject: 'Important: {{event_title}} Has Been Cancelled',
    body: `Dear {{customer_name}},
 
We regret to inform you that {{event_title}} has been cancelled.
 
Reason: {{cancellation_reason}}
 
Your Booking:
- Ticket Type: {{ticket_type}}
- Quantity: {{quantity}} ticket(s)
- Amount Paid: KES {{total_price}}
- Order: #{{order_id}}
 
A full refund will be processed within 5–7 business days to your original payment method.
 
We sincerely apologise for any inconvenience caused.
 
Best regards,
{{organizer_name}}`,
    extraFields: [
      { key: 'cancellation_reason', label: 'Reason for Cancellation', placeholder: 'Explain why the event is being cancelled...', type: 'textarea' },
    ],
  },
  {
    id: 'organizer.venue_change',
    name: 'Venue Change',
    subject: 'Venue Change: {{event_title}}',
    body: `Dear {{customer_name}},
 
Important notice: The venue for {{event_title}} has been changed.
 
Previous Venue: {{old_venue}}
New Venue: {{new_venue}}
 
Date & Time: {{event_date}} (UNCHANGED)
Ticket Type: {{ticket_type}}
Quantity: {{quantity}} ticket(s)
Order: #{{order_id}}
 
Your booking is still valid for the new venue.
 
Best regards,
{{organizer_name}}`,
    extraFields: [
      { key: 'old_venue', label: 'Previous Venue', placeholder: 'e.g. Uhuru Gardens', type: 'text' },
      { key: 'new_venue', label: 'New Venue',      placeholder: 'e.g. KICC Grounds',  type: 'text' },
    ],
  },
  {
    id: 'organizer.time_change',
    name: 'Time Change',
    subject: 'Time Change: {{event_title}}',
    body: `Dear {{customer_name}},
 
Important notice: The date/time for {{event_title}} has been changed.
 
Previous Date/Time: {{old_date_time}}
New Date/Time: {{new_date_time}}
 
Venue: {{venue}} (UNCHANGED)
Ticket Type: {{ticket_type}}
Quantity: {{quantity}} ticket(s)
Order: #{{order_id}}
 
Best regards,
{{organizer_name}}`,
    extraFields: [
      { key: 'old_date_time', label: 'Previous Date & Time', placeholder: 'e.g. July 15, 2025 at 7:00 PM', type: 'text' },
      { key: 'new_date_time', label: 'New Date & Time',      placeholder: 'e.g. July 22, 2025 at 7:00 PM', type: 'text' },
    ],
  },
  { id: 'custom', name: 'Custom Message', subject: '', body: '' },
];
 
// ── Helpers ───────────────────────────────────────────────────────────────────
 
const bookingReplacements = (ref: Booking | null, orgName: string): Record<string, string> => ({
  customer_name:  ref?.customer_name        ?? '',
  event_title:    ref?.event_title          ?? '',
  ticket_type:    ref?.ticket_type_name     ?? '',
  quantity:       ref?.quantity?.toString() ?? '',
  order_id:       ref?.order_id?.toString() ?? ref?.id?.toString() ?? '',
  total_price:    ref?.total_price?.toLocaleString() ?? '',
  venue:          ref?.venue                ?? '',
  event_date:     ref?.event_date           ?? '',
  organizer_name: orgName,
});
 
const fillTokens = (text: string, rep: Record<string, string>): string =>
  text.replace(/\{\{(\w+)\}\}/g, (m, k) => k in rep ? rep[k] : m);
 
const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
 
const statusStyle: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};
 
const statusIcon: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle className="w-4 h-4" />,
  pending:   <Clock className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
};
 
// ── Orders tab ────────────────────────────────────────────────────────────────
 
const OrderRow: React.FC<{ order: OrganizerOrderOut }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
 
  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <td className="px-4 py-4 w-8">
          {expanded
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </td>
        <td className="px-4 py-4 text-sm font-medium text-gray-800">#{order.id}</td>
        <td className="px-4 py-4">
          <p className="text-sm font-medium text-gray-800">{order.customer_name}</p>
          <p className="text-xs text-gray-500">{order.customer_email}</p>
        </td>
        <td className="px-4 py-4">
          <button
            onClick={e => { e.stopPropagation(); navigate(`/events/${order.event_slug}`); }}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {order.event_title}
          </button>
        </td>
        <td className="px-4 py-4 text-sm text-gray-600">{order.bookings.length} type{order.bookings.length !== 1 ? 's' : ''}</td>
        <td className="px-4 py-4">
          <p className="text-sm font-bold text-gray-800">{formatKES(order.total_price)}</p>
          <p className="text-xs text-green-600">Net: {formatKES(order.organizer_net)}</p>
        </td>
        <td className="px-4 py-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
            {statusIcon[order.status]}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </td>
        <td className="px-4 py-4 text-xs text-gray-500">{formatDate(order.created_at)}</td>
      </tr>
 
      {/* Expanded booking line items */}
      {expanded && (
        <tr className="bg-blue-50">
          <td colSpan={8} className="px-8 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Booking line items
            </p>
            <div className="space-y-2">
              {order.bookings.map((b: OrganizerOrderBookingLine) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <Ticket className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{b.ticket_type_name}</p>
                      <p className="text-xs text-gray-500">{b.quantity} × ticket</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[b.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                    <span className="text-sm font-bold text-gray-800">{formatKES(b.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Commission breakdown for this order */}
            <div className="mt-3 flex items-center gap-6 text-xs text-gray-500 border-t border-blue-100 pt-3">
              <span>Commission: {order.commission_rate}%</span>
              <span>Platform cut: <span className="text-red-500 font-medium">{formatKES(order.platform_cut)}</span></span>
              <span>Your net: <span className="text-green-600 font-medium">{formatKES(order.organizer_net)}</span></span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
 
// ── Main Component ────────────────────────────────────────────────────────────
 
const BookingsView: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const { user }    = useAuth();
  const organizerName = user?.name.split(' ')[0] ?? 'Organizer';
 
  const [activeTab, setActiveTab] = useState<ViewTab>('bookings');
 
  // Orders state
  const [orders,          setOrders]          = useState<OrganizerOrderOut[]>([]);
  const [filteredOrders,  setFilteredOrders]  = useState<OrganizerOrderOut[]>([]);
  const [ordersLoading,   setOrdersLoading]   = useState(true);
  const [ordersError,     setOrdersError]     = useState<string | null>(null);
 
  // Bookings state
  const [bookings,         setBookings]         = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [bookingsLoading,  setBookingsLoading]  = useState(false);
  const [bookingsError,    setBookingsError]    = useState<string | null>(null);
 
  // Shared filter state
  const [searchQuery,   setSearchQuery]   = useState('');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [dateRange,     setDateRange]     = useState({ start: '', end: '' });
 
  // Bulk + modal state (bookings tab)
  const [isBulkMode,        setIsBulkMode]        = useState(false);
  const [selectedBookings,  setSelectedBookings]  = useState<number[]>([]);
  const [selectAll,         setSelectAll]         = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking,   setSelectedBooking]   = useState<Booking | null>(null);
  const [showEmailModal,    setShowEmailModal]    = useState(false);
  const [emailData, setEmailData] = useState({
    template: 'custom', rawBody: '', subject: '', message: '', extraValues: {} as Record<string, string>,
  });
  const [sendingEmail, setSendingEmail] = useState(false);
 
  // ── Load orders ──────────────────────────────────────────────────────────
 
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await getOrganizerOrders();
      // If we're on an event-specific page, filter client-side
      const filtered = eventId
        ? data.filter(o => o.event_id === Number(eventId))
        : data;
      setOrders(filtered);
      setFilteredOrders(filtered);
    } catch {
      setOrdersError('Failed to load orders. Please try again.');
    } finally {
      setOrdersLoading(false);
    }
  }, [eventId]);
 
  // ── Load bookings ────────────────────────────────────────────────────────
 
  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      let data: Booking[];
      if (eventId) {
        data = await organizer_getEventBookings(Number(eventId)) as Booking[];
      } else {
        data = await organizer_getRecentBookings(100) as Booking[];
      }
      setBookings(data);
      setFilteredBookings(data);
    } catch {
      setBookingsError('Failed to load bookings. Please try again.');
    } finally {
      setBookingsLoading(false);
    }
  }, [eventId]);
 
  useEffect(() => { loadOrders(); }, [loadOrders]);
 
  useEffect(() => {
    if (activeTab === 'bookings' && bookings.length === 0 && !bookingsLoading) {
      loadBookings();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps
 
  // ── Filter orders ────────────────────────────────────────────────────────
 
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredOrders(
      orders.filter(o => {
        const matchSearch =
          !q ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.event_title.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        const matchDate = (() => {
          if (!dateRange.start || !dateRange.end) return true;
          const d = new Date(o.created_at);
          return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
        })();
        return matchSearch && matchStatus && matchDate;
      }),
    );
  }, [orders, searchQuery, statusFilter, dateRange]);
 
  // ── Filter bookings ──────────────────────────────────────────────────────
 
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredBookings(
      bookings.filter(b => {
        const matchSearch =
          !q ||
          (b.customer_name ?? '').toLowerCase().includes(q) ||
          (b.customer_email ?? '').toLowerCase().includes(q) ||
          (b.ticket_type_name ?? '').toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || b.status === statusFilter;
        const matchDate = (() => {
          if (!dateRange.start || !dateRange.end) return true;
          const d = new Date(b.created_at);
          return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
        })();
        return matchSearch && matchStatus && matchDate;
      }),
    );
  }, [bookings, searchQuery, statusFilter, dateRange]);
 
  // ── Select all sync ──────────────────────────────────────────────────────
 
  useEffect(() => {
    if (filteredBookings.length > 0)
      setSelectAll(filteredBookings.every(b => selectedBookings.includes(b.id)));
  }, [selectedBookings, filteredBookings]);
 
  // ── Email token substitution ─────────────────────────────────────────────
 
  useEffect(() => {
    if (!emailData.rawBody) return;
    const merged = { ...bookingReplacements(selectedBooking, organizerName), ...emailData.extraValues };
    setEmailData(p => ({ ...p, message: fillTokens(p.rawBody, merged) }));
  }, [emailData.extraValues]); // eslint-disable-line react-hooks/exhaustive-deps
 
  // ── Stats ────────────────────────────────────────────────────────────────
 
  const orderStats = {
    totalOrders:   filteredOrders.length,
    totalRevenue:  filteredOrders.filter(o => o.status === 'confirmed').reduce((s, o) => s + o.total_price, 0),
    organizerNet:  filteredOrders.filter(o => o.status === 'confirmed').reduce((s, o) => s + o.organizer_net, 0),
  };
 
  const bookingStats = {
    totalBookings: filteredBookings.length,
    totalTickets:  filteredBookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.quantity, 0),
    totalRevenue:  filteredBookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.total_price, 0),
  };
 
  // ── Helpers ──────────────────────────────────────────────────────────────
 
  const getStatusBadge = (status: string) => (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyle[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {statusIcon[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
 
  const toggleBookingSelection = (id: number) =>
    setSelectedBookings(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
 
  const toggleSelectAll = () => {
    setSelectedBookings(selectAll ? [] : filteredBookings.map(b => b.id));
    setSelectAll(!selectAll);
  };
 
  const clearSelection = () => { setSelectedBookings([]); setSelectAll(false); setIsBulkMode(false); };
  const enterBulkMode  = () => { setIsBulkMode(true); setSelectedBookings([]); };
 
  const handleViewBooking   = (b: Booking) => { setSelectedBooking(b); setShowBookingDetails(true); };
  const closeBookingDetails = () => { setShowBookingDetails(false); setSelectedBooking(null); };
 
  const resetEmailData = () =>
    setEmailData({ template: 'custom', rawBody: '', subject: '', message: '', extraValues: {} });
 
  const openEmailModal = (b: Booking) => {
    setSelectedBookings([b.id]);
    setSelectedBooking(b);
    setShowEmailModal(true);
    resetEmailData();
  };
 
  const openBulkEmailModal = () => {
    if (!selectedBookings.length) { alert('Please select at least one booking'); return; }
    setSelectedBooking(bookings.find(b => selectedBookings.includes(b.id)) ?? null);
    setShowEmailModal(true);
    resetEmailData();
  };
 
  const handleTemplateChange = (templateId: string) => {
    const tpl = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    const base = bookingReplacements(selectedBooking, organizerName);
    setEmailData({
      template: templateId,
      rawBody:  tpl.body,
      subject:  fillTokens(tpl.subject, base),
      message:  fillTokens(tpl.body, base),
      extraValues: {},
    });
  };
 
  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.message) { alert('Please fill in subject and message'); return; }
    setSendingEmail(true);
    try {
      // Strip 'organizer.' prefix — backend expects e.g. 'reminder' not 'organizer.reminder'
      const template_used = emailData.template.replace('organizer.', '') || 'custom';

      const extra_variables = Object.keys(emailData.extraValues).length
        ? emailData.extraValues
        : undefined;

      const result = await sendOrganizerEmail({
        booking_ids: selectedBookings,
        template_used,
        subject: emailData.subject,
        custom_message: template_used === 'custom' ? emailData.message : undefined,
        extra_variables,
      });

      const msg = result.failed > 0
        ? `${result.queued} email(s) queued. ${result.failed} failed.`
        : `${result.queued} email(s) queued successfully.`;
      alert(msg);

      setShowEmailModal(false);
      resetEmailData();
      clearSelection();
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Failed to send email. Please try again.';
      alert(detail);
    } finally {
      setSendingEmail(false);
    }
  };
 
  const exportOrdersToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Event', 'Total (KES)', 'Net (KES)', 'Status', 'Date'];
    const rows = filteredOrders.map(o => [
      o.id, o.customer_name, o.customer_email, o.event_title,
      o.total_price, o.organizer_net, o.status,
      new Date(o.created_at).toLocaleDateString(),
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href  = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  // ── Render ────────────────────────────────────────────────────────────────
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
 
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {eventId ? 'Event Bookings' : 'All Bookings'}
          </h1>
          <p className="text-gray-600">
            {eventId ? 'Orders and bookings for this event' : 'All orders and bookings across your events'}
          </p>
        </div>
 
        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {([
            { value: 'bookings', label: 'Bookings', icon: <Ticket className="w-4 h-4" /> },
            { value: 'orders',   label: 'Orders',   icon: <Package className="w-4 h-4" /> },
          ] as { value: ViewTab; label: string; icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.value
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
 
        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Total Orders',  value: orderStats.totalOrders,              icon: <Package className="w-6 h-6 text-blue-600" />,   bg: 'bg-blue-100',  color: 'text-gray-800'  },
                { label: 'Gross Revenue', value: formatKES(orderStats.totalRevenue),  icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', color: 'text-green-600' },
                { label: 'Your Net',      value: formatKES(orderStats.organizerNet),  icon: <CheckCircle className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-100',  color: 'text-blue-700'  },
              ].map(({ label, value, icon, bg, color }) => (
                <div key={label} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                    <div className={`p-3 ${bg} rounded-lg`}>{icon}</div>
                  </div>
                </div>
              ))}
            </div>
 
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text" placeholder="Search by customer, email or event…"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={exportOrdersToCSV}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center font-medium hover:from-blue-600 hover:to-blue-700">
                    <Download className="w-4 h-4 mr-2" /> Export
                  </button>
                </div>
              </div>
            </div>
 
            {ordersError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">{ordersError}</p>
                <button onClick={loadOrders} className="ml-auto text-sm text-red-600 underline">Retry</button>
              </div>
            )}
 
            {ordersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Orders will appear here once customers start purchasing tickets'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="w-8 px-4 py-4" />
                        {['Order', 'Customer', 'Event', 'Items', 'Total', 'Status', 'Date'].map(h => (
                          <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map(order => (
                        <OrderRow key={order.id} order={order} />
                      ))}
                    </tbody>
                  </table>
                </div>
 
                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Order #{order.id}</p>
                          <p className="text-xs text-gray-500">{order.customer_name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{order.event_title}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800 text-sm">{formatKES(order.total_price)}</p>
                          <p className="text-xs text-green-600">Net: {formatKES(order.organizer_net)}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusStyle[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
 
        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Total Bookings', value: bookingStats.totalBookings,          icon: <Ticket className="w-6 h-6 text-blue-600" />,    bg: 'bg-blue-100',  color: 'text-gray-800'  },
                { label: 'Tickets Sold',   value: bookingStats.totalTickets,           icon: <User className="w-6 h-6 text-blue-600" />,      bg: 'bg-blue-100',  color: 'text-gray-800'  },
                { label: 'Total Revenue',  value: formatKES(bookingStats.totalRevenue), icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', color: 'text-green-600' },
              ].map(({ label, value, icon, bg, color }) => (
                <div key={label} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{label}</p>
                      <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    </div>
                    <div className={`p-3 ${bg} rounded-lg`}>{icon}</div>
                  </div>
                </div>
              ))}
            </div>
 
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text" placeholder="Search by customer name, email, or ticket type…"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input type="date" value={dateRange.start}
                    onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input type="date" value={dateRange.end}
                    onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
 
            {bookingsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">{bookingsError}</p>
                <button onClick={loadBookings} className="ml-auto text-sm text-red-600 underline">Retry</button>
              </div>
            )}
 
            <BulkActionBar
              selectedCount={selectedBookings.length}
              isBulkMode={isBulkMode}
              onEnterBulkMode={enterBulkMode}
              onClearSelection={clearSelection}
              onBulkEmail={openBulkEmailModal}
            />
 
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all' || dateRange.start
                    ? 'Try adjusting your filters'
                    : 'Bookings will appear here once customers start purchasing tickets'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table — BookingsTable renders its own bg/shadow container */}
                <div className="hidden md:block">
                  <BookingsTable
                    bookings={filteredBookings}
                    selectedBookings={selectedBookings}
                    selectAll={selectAll}
                    isBulkMode={isBulkMode}
                    onToggleSelectAll={toggleSelectAll}
                    onToggleBooking={toggleBookingSelection}
                    onViewBooking={handleViewBooking}
                    onEmailBooking={openEmailModal}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                  />
                </div>

                {/* Mobile cards */}
                <div className="md:hidden bg-white rounded-xl shadow-md overflow-hidden divide-y divide-gray-200">
                  {isBulkMode && filteredBookings.length > 0 && (
                    <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-sm font-medium text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Select all
                    </label>
                  )}
                  {filteredBookings.map(b => (
                    <div
                      key={b.id}
                      className={`p-4 ${isBulkMode && selectedBookings.includes(b.id) ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={isBulkMode ? 'flex items-start gap-3 flex-1 min-w-0' : 'flex-1 min-w-0'}>
                          {isBulkMode && (
                            <input
                              type="checkbox"
                              checked={selectedBookings.includes(b.id)}
                              onChange={() => toggleBookingSelection(b.id)}
                              className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                            />
                          )}
                          <div
                            className={!isBulkMode ? 'cursor-pointer min-w-0' : 'min-w-0'}
                            onClick={() => !isBulkMode && handleViewBooking(b)}
                          >
                            <p className="text-xs text-gray-400">#{b.id}</p>
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {b.customer_name ?? 'Unknown customer'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{b.customer_email}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {b.ticket_type_name} · {b.quantity} ticket{b.quantity !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-bold text-gray-800 text-sm">{formatKES(b.total_price)}</p>
                          <div className="mt-1">{getStatusBadge(b.status)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-400">{formatDate(b.created_at)}</p>
                        {!isBulkMode && (
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleViewBooking(b)}
                              className="text-xs font-medium text-blue-600 hover:underline"
                            >
                              View
                            </button>
                            <button
                              onClick={() => openEmailModal(b)}
                              className="text-xs font-medium text-green-600 hover:underline"
                            >
                              Email
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
 
      {showBookingDetails && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={closeBookingDetails}
          onSendEmail={() => { closeBookingDetails(); openEmailModal(selectedBooking); }}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      )}
 
      {showEmailModal && (
        <EmailModal
          selectedBookings={bookings.filter(b => selectedBookings.includes(b.id))}
          emailData={emailData}
          emailTemplates={EMAIL_TEMPLATES}
          sendingEmail={sendingEmail}
          onClose={() => { setShowEmailModal(false); resetEmailData(); }}
          onTemplateChange={handleTemplateChange}
          onEmailDataChange={data => setEmailData(p => ({ ...p, ...data }))}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};
 
export default BookingsView;