import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Edit, Trash2, Users, DollarSign, Ticket, ArrowLeft, Plus, Eye, XCircle, TrendingUp, CheckCircle } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  slug: string;
  venue: string;
  start_time: string;
  end_time: string;
  flyer_url: string;
  description: string;
  status: string;
  approved: boolean;
  rejected: boolean;
  created_at: string;
}

interface TicketType {
  id: number;
  name: string;
  description: string;
  price: number;
  total_quantity: number;
  quantity_sold: number;
  is_active: boolean;
}

interface Booking {
  id: number;
  customer_name: string;
  customer_email: string;
  ticket_type_name: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface EventStats {
  total_bookings: number;
  total_revenue: number;
  tickets_sold: number;
  tickets_remaining: number;
}

const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    setLoading(true);
    // TODO: Replace with actual API calls
    // const eventData = await getEventById(eventId);
    // const ticketsData = await getTicketTypesByEvent(eventId);
    // const bookingsData = await getRecentBookingsByEvent(eventId, 5);
    // const statsData = await getEventStats(eventId);

    const mockEvent: Event = {
      id: parseInt(eventId || '1'),
      title: 'Summer Music Festival 2025',
      slug: 'summer-music-festival-2025',
      venue: 'Kasarani Stadium, Nairobi',
      start_time: '2025-07-15T14:00:00Z',
      end_time: '2025-07-15T23:00:00Z',
      flyer_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      description: 'The biggest music festival of the year featuring top artists from across Africa.',
      status: 'upcoming',
      approved: true,
      rejected: false,
      created_at: '2025-01-01T10:00:00Z'
    };

    const mockTicketTypes: TicketType[] = [
      { id: 1, name: 'VIP Pass', description: 'Front row access, complimentary drinks', price: 5000, total_quantity: 50, quantity_sold: 23, is_active: true },
      { id: 2, name: 'Regular Admission', description: 'General admission', price: 1500, total_quantity: 500, quantity_sold: 342, is_active: true },
      { id: 3, name: 'Student Ticket', description: 'Valid student ID required', price: 1000, total_quantity: 200, quantity_sold: 156, is_active: true },
    ];

    const mockBookings: Booking[] = [
      { id: 1, customer_name: 'John Doe', customer_email: 'john@example.com', ticket_type_name: 'VIP Pass', quantity: 2, total_price: 10000, status: 'confirmed', created_at: '2025-01-24T10:30:00Z' },
      { id: 2, customer_name: 'Jane Smith', customer_email: 'jane@example.com', ticket_type_name: 'Regular Admission', quantity: 4, total_price: 6000, status: 'confirmed', created_at: '2025-01-24T09:15:00Z' },
      { id: 3, customer_name: 'Mike Johnson', customer_email: 'mike@example.com', ticket_type_name: 'Student Ticket', quantity: 2, total_price: 2000, status: 'pending', created_at: '2025-01-23T16:45:00Z' },
    ];

    const mockStats: EventStats = {
      total_bookings: 89,
      total_revenue: 445000,
      tickets_sold: 521,
      tickets_remaining: 229
    };

    setEvent(mockEvent);
    setTicketTypes(mockTicketTypes);
    setRecentBookings(mockBookings);
    setStats(mockStats);
    setLoading(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-700',
      ongoing: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getBookingStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
        {status === 'pending' && <Clock className="w-3 h-3" />}
        {status === 'cancelled' && <XCircle className="w-3 h-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleDeleteEvent = async () => {
    // TODO: API call to delete event
    // await deleteEvent(eventId);
    navigate('/organizer/events');
  };

  const handleCancelEvent = async () => {
    // TODO: API call to cancel event
    // await updateEventStatus(eventId, 'cancelled');
    navigate('/organizer/events');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
        <button
          onClick={() => navigate('/organizer/events')}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/organizer/events')}
        className="flex items-center text-gray-600 hover:text-orange-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back to Events
      </button>

      {/* Event Header */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img
              src={event.flyer_url}
              alt={event.title}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>
                {getStatusBadge(event.status)}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => navigate(`/organizer/events/${eventId}/edit`)}
                  className="p-2 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                <span>{formatDate(event.start_time)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-orange-500" />
                <span>{event.venue}</span>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{event.description}</p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/organizer/events/${eventId}/tickets`)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center"
              >
                <Ticket className="w-5 h-5 mr-2" />
                Manage Tickets
              </button>
              <button
                onClick={() => navigate(`/organizer/events/${eventId}/bookings`)}
                className="flex-1 border-2 border-orange-500 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Ticket className="w-8 h-8 text-orange-500" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-800">{stats?.total_bookings}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">KES {stats?.total_revenue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Tickets Sold</p>
          <p className="text-3xl font-bold text-gray-800">{stats?.tickets_sold}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Ticket className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Remaining</p>
          <p className="text-3xl font-bold text-gray-800">{stats?.tickets_remaining}</p>
        </div>
      </div>

      {/* Ticket Types and Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ticket Types */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Ticket Types</h2>
            <button
              onClick={() => navigate(`/organizer/events/${eventId}/tickets`)}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Type
            </button>
          </div>

          <div className="space-y-4">
            {ticketTypes.map((ticket) => (
              <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{ticket.name}</h3>
                    <p className="text-sm text-gray-600">{ticket.description}</p>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    KES {ticket.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sold: {ticket.quantity_sold} / {ticket.total_quantity}</span>
                  <span className={ticket.is_active ? 'text-green-600' : 'text-red-600'}>
                    {ticket.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
            <button
              onClick={() => navigate(`/organizer/events/${eventId}/bookings`)}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{booking.customer_name}</p>
                    <p className="text-sm text-gray-600">{booking.customer_email}</p>
                  </div>
                  {getBookingStatusBadge(booking.status)}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {booking.quantity}x {booking.ticket_type_name}
                  </span>
                  <span className="font-bold text-green-600">
                    KES {booking.total_price.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Event?</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;