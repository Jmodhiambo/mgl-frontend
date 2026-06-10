// src/organizer/pages/BookingsView.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { Search, Ticket, User, DollarSign, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import BookingDetailsModal from '@organizer/components/modals/bookings/BookingDetailsModal';
import EmailModal from '@organizer/components/modals/bookings/EmailModal';
import BulkActionBar from '@organizer/components/modals/bookings/BulkActionBar';
import BookingsTable from '@organizer/components/modals/bookings/BookingsTable';

interface Booking {
  id: number;
  user_id: number;
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
  subject: string;  // raw — all tokens use {{key}} syntax
  body: string;     // raw — all tokens use {{key}} syntax
  extraFields?: EmailTemplateExtraField[];
}

/**
 * EMAIL TEMPLATES — fully synchronised with backend organizer templates.
 *
 * Token convention (uniform throughout):
 *   {{key}}  — replaced immediately on template select if the value comes
 *              from the booking object.
 *   {{key}}  — left visible in the preview if the value must be typed by
 *              the organizer (extra fields). It updates live as they type.
 *   {{organizer_name}} — filled from the authenticated organizer's profile
 *              via useAuth().
 */
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
- Booking ID: #{{booking_id}}

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
- Booking ID: #{{booking_id}}

If you have any questions, please contact us immediately.

Best regards,
{{organizer_name}}`,
    extraFields: [
      {
        key: 'update_message',
        label: 'Update Details',
        placeholder: 'Describe what has changed or the important update...',
        type: 'textarea',
      },
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
- Booking ID: #{{booking_id}}

A full refund will be processed within 5–7 business days to your original payment method.

We sincerely apologise for any inconvenience caused.

Best regards,
{{organizer_name}}`,
    extraFields: [
      {
        key: 'cancellation_reason',
        label: 'Reason for Cancellation',
        placeholder: 'Explain why the event is being cancelled...',
        type: 'textarea',
      },
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
Booking ID: #{{booking_id}}

Your booking is still valid for the new venue. If this change is inconvenient, please contact us within 48 hours to request a refund.

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
Booking ID: #{{booking_id}}

Your booking is still valid for the new date and time. If you cannot attend, please contact us within 48 hours to request a refund.

Best regards,
{{organizer_name}}`,
    extraFields: [
      { key: 'old_date_time', label: 'Previous Date & Time', placeholder: 'e.g. July 15, 2025 at 7:00 PM', type: 'text' },
      { key: 'new_date_time', label: 'New Date & Time',      placeholder: 'e.g. July 22, 2025 at 7:00 PM', type: 'text' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Message',
    subject: '',
    body: '',
  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Build the booking-level replacement map from a Booking object. */
const bookingReplacements = (
  ref: Booking | null,
  organizerName: string,
): Record<string, string> => ({
  customer_name:  ref?.customer_name        ?? '',
  event_title:    ref?.event_title          ?? '',
  ticket_type:    ref?.ticket_type_name     ?? '',
  quantity:       ref?.quantity?.toString() ?? '',
  booking_id:     ref?.id?.toString()       ?? '',
  total_price:    ref?.total_price?.toLocaleString() ?? '',
  venue:          ref?.venue                ?? '',
  event_date:     ref?.event_date           ?? '',
  organizer_name: organizerName,
});

/**
 * Replace {{key}} tokens.
 * Tokens with no matching value are left as {{key}} so the organizer can
 * see which dynamic fields are still pending.
 */
const fillTokens = (
  text: string,
  replacements: Record<string, string>,
): string =>
  text.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    key in replacements ? replacements[key] : match,
  );

// ─── component ────────────────────────────────────────────────────────────────

const BookingsView: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const { user } = useAuth();
  const organizerName = user ? user?.name.split(' ')[0] : 'Organizer';

  const [bookings, setBookings]               = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading]                 = useState(false);

  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange]       = useState({ start: '', end: '' });

  const [isBulkMode, setIsBulkMode]           = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [selectAll, setSelectAll]             = useState(false);

  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking]       = useState<Booking | null>(null);
  const [showEmailModal, setShowEmailModal]         = useState(false);

  /**
   * emailData:
   *  rawBody     — the template's original body with ALL {{tokens}} intact.
   *                Stored so we can re-run fillTokens whenever extraValues change.
   *  subject     — substituted subject shown in the input.
   *  message     — substituted body shown in the preview textarea.
   *  extraValues — organizer-typed values keyed by extraField.key.
   */
  const [emailData, setEmailData] = useState({
    template:    'custom',
    rawBody:     '',
    subject:     '',
    message:     '',
    extraValues: {} as Record<string, string>,
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => { loadBookings(); }, [eventId]);
  useEffect(() => { filterBookings(); }, [bookings, searchQuery, statusFilter, dateRange]);
  useEffect(() => {
    if (filteredBookings.length > 0) {
      setSelectAll(filteredBookings.every(b => selectedBookings.includes(b.id)));
    }
  }, [selectedBookings, filteredBookings]);

  /**
   * Live substitution: whenever the organizer types into an extra field,
   * re-run fillTokens on the stored rawBody (merging booking replacements
   * with the latest extraValues) and update the preview textarea.
   */
  useEffect(() => {
    if (!emailData.rawBody) return;
    const merged = { ...bookingReplacements(selectedBooking, organizerName), ...emailData.extraValues };
    setEmailData(prev => ({ ...prev, message: fillTokens(prev.rawBody, merged) }));
  }, [emailData.extraValues]);

  // ── data ───────────────────────────────────────────────────────────────────

  const loadBookings = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    const mockBookings: Booking[] = [
      {
        id: 1, user_id: 101, ticket_type_id: 1, quantity: 2, status: 'confirmed',
        total_price: 10000, created_at: '2025-01-24T10:30:00Z', updated_at: '2025-01-24T10:30:00Z',
        customer_name: 'John Doe',       customer_email: 'john@example.com',
        event_title: 'Summer Music Festival', ticket_type_name: 'VIP Pass',
        venue: 'Uhuru Gardens', event_date: 'July 15, 2025 at 7:00 PM',
      },
      {
        id: 2, user_id: 102, ticket_type_id: 2, quantity: 4, status: 'confirmed',
        total_price: 6000, created_at: '2025-01-24T09:15:00Z', updated_at: '2025-01-24T09:15:00Z',
        customer_name: 'Jane Smith',     customer_email: 'jane@example.com',
        event_title: 'Summer Music Festival', ticket_type_name: 'Regular Admission',
        venue: 'Uhuru Gardens', event_date: 'July 15, 2025 at 7:00 PM',
      },
      {
        id: 3, user_id: 103, ticket_type_id: 3, quantity: 2, status: 'pending',
        total_price: 2000, created_at: '2025-01-23T16:45:00Z', updated_at: '2025-01-23T16:45:00Z',
        customer_name: 'Mike Johnson',   customer_email: 'mike@example.com',
        event_title: 'Summer Music Festival', ticket_type_name: 'Student Ticket',
        venue: 'Uhuru Gardens', event_date: 'July 15, 2025 at 7:00 PM',
      },
      {
        id: 4, user_id: 104, ticket_type_id: 1, quantity: 1, status: 'confirmed',
        total_price: 5000, created_at: '2025-01-23T14:20:00Z', updated_at: '2025-01-23T14:20:00Z',
        customer_name: 'Sarah Williams', customer_email: 'sarah@example.com',
        event_title: 'Summer Music Festival', ticket_type_name: 'VIP Pass',
        venue: 'Uhuru Gardens', event_date: 'July 15, 2025 at 7:00 PM',
      },
      {
        id: 5, user_id: 105, ticket_type_id: 2, quantity: 3, status: 'cancelled',
        total_price: 4500, created_at: '2025-01-22T11:30:00Z', updated_at: '2025-01-23T09:00:00Z',
        customer_name: 'Robert Brown',   customer_email: 'robert@example.com',
        event_title: 'Summer Music Festival', ticket_type_name: 'Regular Admission',
        venue: 'Uhuru Gardens', event_date: 'July 15, 2025 at 7:00 PM',
      },
    ];
    setBookings(mockBookings);
    setFilteredBookings(mockBookings);
    setLoading(false);
  };

  const filterBookings = () => {
    let filtered = bookings;
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ticket_type_name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(b => b.status === statusFilter);
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(b => {
        const d = new Date(b.created_at);
        return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
      });
    }
    setFilteredBookings(filtered);
  };

  // ── formatting ─────────────────────────────────────────────────────────────

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending:   'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const icons: Record<string, React.ReactNode> = {
      confirmed: <CheckCircle className="w-4 h-4" />,
      pending:   <Clock className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTotalStats = () => {
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed');
    return {
      totalRevenue:  confirmed.reduce((s, b) => s + b.total_price, 0),
      totalTickets:  confirmed.reduce((s, b) => s + b.quantity, 0),
      totalBookings: filteredBookings.length,
    };
  };

  // ── selection ──────────────────────────────────────────────────────────────

  const toggleBookingSelection = (id: number) =>
    setSelectedBookings(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleSelectAll = () => {
    setSelectedBookings(selectAll ? [] : filteredBookings.map(b => b.id));
    setSelectAll(!selectAll);
  };

  const clearSelection = () => { setSelectedBookings([]); setSelectAll(false); setIsBulkMode(false); };
  const enterBulkMode  = () => { setIsBulkMode(true); setSelectedBookings([]); setSelectAll(false); };

  // ── modal handlers ─────────────────────────────────────────────────────────

  const handleViewBooking   = (booking: Booking) => { setSelectedBooking(booking); setShowBookingDetails(true); };
  const closeBookingDetails = () => { setShowBookingDetails(false); setSelectedBooking(null); };

  const resetEmailData = () =>
    setEmailData({ template: 'custom', rawBody: '', subject: '', message: '', extraValues: {} });

  const openEmailModal = (booking: Booking) => {
    setSelectedBookings([booking.id]);
    setSelectedBooking(booking);
    setShowEmailModal(true);
    resetEmailData();
  };

  const openBulkEmailModal = () => {
    if (selectedBookings.length === 0) { alert('Please select at least one booking'); return; }
    setSelectedBooking(bookings.find(b => selectedBookings.includes(b.id)) ?? null);
    setShowEmailModal(true);
    resetEmailData();
  };

  const closeEmailModal = () => { setShowEmailModal(false); resetEmailData(); };

  // ── template change ────────────────────────────────────────────────────────

  const handleTemplateChange = (templateId: string) => {
    const tpl = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    const base = bookingReplacements(selectedBooking, organizerName);

    setEmailData({
      template:    templateId,
      rawBody:     tpl.body,                        // stored raw for live re-substitution
      subject:     fillTokens(tpl.subject, base),
      message:     fillTokens(tpl.body, base),      // extra-field tokens stay as {{key}}
      extraValues: {},
    });
  };

  // ── send ───────────────────────────────────────────────────────────────────

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.message) {
      alert('Please fill in both subject and message');
      return;
    }
    setSendingEmail(true);
    try {
      const recipients = bookings.filter(b => selectedBookings.includes(b.id));

      if (emailData.template === 'custom') {
        // TODO: POST /api/organizer/emails/custom
        // await apiFetch('/api/organizer/emails/custom', {
        //   method: 'POST',
        //   body: { booking_ids: selectedBookings, subject: emailData.subject, body: emailData.message },
        // });
      } else {
        // TODO: POST /api/organizer/emails/bulk
        // The backend receives template_id + booking_ids + extra_variables.
        // It merges extra_variables with the per-booking fields and calls
        // email_manager.send_from_template() for each recipient.
        // await apiFetch('/api/organizer/emails/bulk', {
        //   method: 'POST',
        //   body: {
        //     template_id:     emailData.template,     // e.g. 'organizer.cancellation'
        //     booking_ids:     selectedBookings,
        //     extra_variables: emailData.extraValues,  // e.g. { cancellation_reason: '...' }
        //   },
        // });
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Email sent successfully to ${recipients.length} recipient(s)`);
      closeEmailModal();
      clearSelection();
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // ── export ─────────────────────────────────────────────────────────────────

  const exportToCSV = () => {
    try {
      const headers = ['Booking ID','Customer Name','Customer Email','Event Title','Ticket Type','Quantity','Total Price (KES)','Status','Booking Date'];
      const rows = filteredBookings.map(b => [
        b.id, b.customer_name ?? 'N/A', b.customer_email ?? 'N/A',
        b.event_title ?? 'N/A', b.ticket_type_name ?? 'N/A',
        b.quantity, b.total_price, b.status,
        new Date(b.created_at).toLocaleDateString('en-US'),
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Failed to export data. Please try again.');
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {eventId ? 'Event Bookings' : 'All Bookings'}
          </h1>
          <p className="text-gray-600">
            {eventId
              ? 'View and manage bookings for this event'
              : 'View and manage all bookings across your events'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Bookings', value: stats.totalBookings, icon: <Ticket className="w-6 h-6 text-blue-600" />,  bg: 'bg-blue-100',  color: 'text-gray-800'  },
            { label: 'Tickets Sold',   value: stats.totalTickets,  icon: <User className="w-6 h-6 text-blue-600" />,    bg: 'bg-blue-100',  color: 'text-gray-800'  },
            { label: 'Total Revenue',  value: `KES ${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', color: 'text-green-600' },
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

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name, email, or ticket type..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={exportToCSV}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
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

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selectedBookings.length}
          isBulkMode={isBulkMode}
          onEnterBulkMode={enterBulkMode}
          onClearSelection={clearSelection}
          onBulkEmail={openBulkEmailModal}
        />

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || dateRange.start || dateRange.end
                ? 'Try adjusting your filters'
                : 'Bookings will appear here once customers start purchasing tickets'}
            </p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={closeBookingDetails}
          onSendEmail={() => { closeBookingDetails(); openEmailModal(selectedBooking); }}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          selectedBookings={bookings.filter(b => selectedBookings.includes(b.id))}
          emailData={emailData}
          emailTemplates={EMAIL_TEMPLATES}
          sendingEmail={sendingEmail}
          onClose={closeEmailModal}
          onTemplateChange={handleTemplateChange}
          onEmailDataChange={data => setEmailData(prev => ({ ...prev, ...data }))}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};

export default BookingsView;