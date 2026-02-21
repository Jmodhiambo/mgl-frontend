import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, Ticket, User, DollarSign, Download, Eye, CheckCircle, Clock, XCircle, Mail, Send } from 'lucide-react';

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
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const BookingsView: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    template: 'custom',
    subject: '',
    message: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  const emailTemplates: EmailTemplate[] = [
    {
      id: 'reminder',
      name: 'Event Reminder',
      subject: 'Reminder: Your Event is Coming Up!',
      body: `Dear {{customer_name}},

This is a friendly reminder that {{event_title}} is coming up soon!

Event Details:
- Ticket Type: {{ticket_type}}
- Quantity: {{quantity}} ticket(s)
- Booking ID: #{{booking_id}}

We look forward to seeing you at the event!

Best regards,
The Event Team`
    },
    {
      id: 'update',
      name: 'Event Update',
      subject: 'Important Update: {{event_title}}',
      body: `Dear {{customer_name}},

We have an important update regarding {{event_title}}.

[Please provide the update details here]

If you have any questions, please don't hesitate to contact us.

Best regards,
The Event Team`
    },
    {
      id: 'thank_you',
      name: 'Thank You',
      subject: 'Thank You for Attending {{event_title}}',
      body: `Dear {{customer_name}},

Thank you for attending {{event_title}}! We hope you had a wonderful experience.

We'd love to hear your feedback and see you at our future events.

Best regards,
The Event Team`
    },
    {
      id: 'custom',
      name: 'Custom Message',
      subject: '',
      body: ''
    }
  ];

  useEffect(() => {
    loadBookings();
  }, [eventId]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter, dateRange]);

  const loadBookings = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    
    const mockBookings: Booking[] = [
      {
        id: 1,
        user_id: 101,
        ticket_type_id: 1,
        quantity: 2,
        status: 'confirmed',
        total_price: 10000,
        created_at: '2025-01-24T10:30:00Z',
        updated_at: '2025-01-24T10:30:00Z',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        event_title: 'Summer Music Festival',
        ticket_type_name: 'VIP Pass'
      },
      {
        id: 2,
        user_id: 102,
        ticket_type_id: 2,
        quantity: 4,
        status: 'confirmed',
        total_price: 6000,
        created_at: '2025-01-24T09:15:00Z',
        updated_at: '2025-01-24T09:15:00Z',
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        event_title: 'Summer Music Festival',
        ticket_type_name: 'Regular Admission'
      },
      {
        id: 3,
        user_id: 103,
        ticket_type_id: 3,
        quantity: 2,
        status: 'pending',
        total_price: 2000,
        created_at: '2025-01-23T16:45:00Z',
        updated_at: '2025-01-23T16:45:00Z',
        customer_name: 'Mike Johnson',
        customer_email: 'mike@example.com',
        event_title: 'Summer Music Festival',
        ticket_type_name: 'Student Ticket'
      },
      {
        id: 4,
        user_id: 104,
        ticket_type_id: 1,
        quantity: 1,
        status: 'confirmed',
        total_price: 5000,
        created_at: '2025-01-23T14:20:00Z',
        updated_at: '2025-01-23T14:20:00Z',
        customer_name: 'Sarah Williams',
        customer_email: 'sarah@example.com',
        event_title: 'Summer Music Festival',
        ticket_type_name: 'VIP Pass'
      },
      {
        id: 5,
        user_id: 105,
        ticket_type_id: 2,
        quantity: 3,
        status: 'cancelled',
        total_price: 4500,
        created_at: '2025-01-22T11:30:00Z',
        updated_at: '2025-01-23T09:00:00Z',
        customer_name: 'Robert Brown',
        customer_email: 'robert@example.com',
        event_title: 'Summer Music Festival',
        ticket_type_name: 'Regular Admission'
      }
    ];

    setBookings(mockBookings);
    setFilteredBookings(mockBookings);
    setLoading(false);
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.ticket_type_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }

    setFilteredBookings(filtered);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    const icons = {
      confirmed: <CheckCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTotalStats = () => {
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed');
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.total_price, 0);
    const totalTickets = confirmed.reduce((sum, b) => sum + b.quantity, 0);

    return { totalRevenue, totalTickets, totalBookings: filteredBookings.length };
  };

  const stats = getTotalStats();

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const closeBookingDetails = () => {
    setShowBookingDetails(false);
    setSelectedBooking(null);
  };

  const openEmailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowEmailModal(true);
    setEmailData({
      template: 'custom',
      subject: '',
      message: ''
    });
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setSelectedBooking(null);
    setEmailData({
      template: 'custom',
      subject: '',
      message: ''
    });
  };

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template && selectedBooking) {
      const subject = template.subject
        .replace('{{event_title}}', selectedBooking.event_title || '')
        .replace('{{customer_name}}', selectedBooking.customer_name || '');
      
      const body = template.body
        .replace('{{customer_name}}', selectedBooking.customer_name || '')
        .replace('{{event_title}}', selectedBooking.event_title || '')
        .replace('{{ticket_type}}', selectedBooking.ticket_type_name || '')
        .replace('{{quantity}}', selectedBooking.quantity.toString())
        .replace('{{booking_id}}', selectedBooking.id.toString());

      setEmailData({
        template: templateId,
        subject: subject,
        message: body
      });
    }
  };

  const handleSendEmail = async () => {
    if (!selectedBooking || !emailData.subject || !emailData.message) {
      alert('Please fill in both subject and message');
      return;
    }

    setSendingEmail(true);
    try {
      // TODO: Replace with actual API call
      // await sendBookingEmail(selectedBooking.id, {
      //   to: selectedBooking.customer_email,
      //   subject: emailData.subject,
      //   message: emailData.message
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Email sent successfully to ${selectedBooking.customer_email}`);
      closeEmailModal();
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'Booking ID',
        'Customer Name',
        'Customer Email',
        'Event Title',
        'Ticket Type',
        'Quantity',
        'Total Price (KES)',
        'Status',
        'Booking Date'
      ];

      const rows = filteredBookings.map(booking => [
        booking.id,
        booking.customer_name || 'N/A',
        booking.customer_email || 'N/A',
        booking.event_title || 'N/A',
        booking.ticket_type_name || 'N/A',
        booking.quantity,
        booking.total_price,
        booking.status,
        new Date(booking.created_at).toLocaleDateString('en-US')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('CSV exported successfully');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
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
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Tickets Sold</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalTickets}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  KES {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name, email, or ticket type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={exportToCSV}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center font-medium"
                title="Export bookings to CSV"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

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
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ticket Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800">#{booking.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{booking.customer_name}</div>
                          <div className="text-sm text-gray-500">{booking.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-800">{booking.ticket_type_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">{booking.quantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">
                          KES {booking.total_price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{formatDate(booking.created_at)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewBooking(booking)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button 
                            onClick={() => openEmailModal(booking)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Booking Details</h3>
                <p className="text-sm text-gray-500 mt-1">Booking ID: #{selectedBooking.id}</p>
              </div>
              <button
                onClick={closeBookingDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Status</span>
                {getStatusBadge(selectedBooking.status)}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-800">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-800">{selectedBooking.customer_email}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Event & Ticket Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Event</p>
                  <p className="text-sm font-medium text-gray-800">{selectedBooking.event_title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ticket Type</p>
                  <p className="text-sm font-medium text-gray-800">{selectedBooking.ticket_type_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <p className="text-sm font-medium text-gray-800">{selectedBooking.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Price</p>
                    <p className="text-sm font-bold text-green-600">
                      KES {selectedBooking.total_price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Booking Timeline</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Booked On</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(selectedBooking.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(selectedBooking.updated_at)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={closeBookingDetails}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeBookingDetails();
                  openEmailModal(selectedBooking);
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Send Email</h3>
                <p className="text-sm text-gray-500 mt-1">
                  To: {selectedBooking.customer_name} ({selectedBooking.customer_email})
                </p>
              </div>
              <button
                onClick={closeEmailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template
                </label>
                <select
                  value={emailData.template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {emailTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  rows={12}
                  placeholder="Enter your message here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={closeEmailModal}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailData.subject || !emailData.message}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsView;