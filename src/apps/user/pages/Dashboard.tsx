import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Ticket, CreditCard, TrendingUp, Clock, CheckCircle,
  XCircle, AlertCircle, MapPin, ChevronDown, ChevronRight,
} from 'lucide-react';
import { DashboardSEO } from '@shared/components/SEO';
import {
  fetchCurrentUser,
  fetchUserOrdersEnriched,
  fetchUserTicketInstances,
  fetchEventDetailsForOrders,
  computeStats,
  buildRecentBookings,
  buildUpcomingEvents,
  type UserMe,
  type UserOrderEnriched,
  type DashboardStats,
  type DashboardBookingRow,
  type DashboardUpcomingEvent,
} from '@user/services/dashboardService';

// ── helpers ───────────────────────────────────────────────────────────────────

const parseApiError = (err: unknown): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { detail?: string } } }).response;
    return r?.data?.detail ?? 'Something went wrong.';
  }
  return 'Something went wrong.';
};

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':  return 'bg-green-100 text-green-700';
    case 'pending':    return 'bg-yellow-100 text-yellow-700';
    case 'cancelled':  return 'bg-red-100 text-red-700';
    case 'refunded':   return 'bg-blue-100 text-blue-700';
    default:           return 'bg-gray-100 text-gray-700';
  }
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'confirmed': return <CheckCircle className="w-4 h-4" />;
    case 'pending':   return <Clock className="w-4 h-4" />;
    case 'cancelled': return <XCircle className="w-4 h-4" />;
    case 'refunded':  return <CreditCard className="w-4 h-4" />;
    default:          return <AlertCircle className="w-4 h-4" />;
  }
};

// ── component ─────────────────────────────────────────────────────────────────

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser]                     = useState<UserMe | null>(null);
  const [orders, setOrders]                 = useState<UserOrderEnriched[]>([]);
  const [stats, setStats]                   = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<DashboardBookingRow[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardUpcomingEvent[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  // Inline expand state for the Recent Bookings list — clicking a booking
  // row expands it in place instead of navigating anywhere. The only path
  // to the My Tickets page is the explicit "View All" link.
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Dashboard - MGLTickets';

    const load = async () => {
      try {
        const [me, fetchedOrders, tickets] = await Promise.all([
          fetchCurrentUser(),
          fetchUserOrdersEnriched(),
          fetchUserTicketInstances(),
        ]);

        // Event start_time/venue aren't on the order itself — fetch them
        // once per distinct event_id. This is what "upcoming events" is
        // actually computed from, rather than the ticket instance's
        // event_date (which can be missing for edge-case rows and was
        // silently making this list empty).
        const { startTimes, venues } = await fetchEventDetailsForOrders(fetchedOrders);

        setUser(me);
        setOrders(fetchedOrders);
        setStats(computeStats(fetchedOrders, tickets, startTimes));
        setRecentBookings(buildRecentBookings(fetchedOrders, startTimes, 5));
        setUpcomingEvents(buildUpcomingEvents(fetchedOrders, tickets, startTimes, venues, 5));
      } catch (err) {
        setError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // ── loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // ── error state ──────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Failed to load dashboard</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── main render ──────────────────────────────────────────────────────────────

  return (
    <>
      <DashboardSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-0">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-gray-600">Here's what's happening with your events</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Ticket className="w-6 h-6 text-orange-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stats?.totalBookings ?? 0}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stats?.activeTickets ?? 0}</div>
              <div className="text-sm text-gray-600">Active Tickets</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                KES {(stats?.totalSpent ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stats?.upcomingEvents ?? 0}</div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Recent Bookings</h3>
                  <Link
                    to="/my-tickets"
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    View All
                  </Link>
                </div>

                {recentBookings.length > 0 ? (
                  <div className="space-y-3">
                    {recentBookings.map((booking) => {
                      const isExpanded = expandedOrderId === booking.id;
                      const fullOrder = orders.find((o) => o.id === booking.id);

                      return (
                        <div
                          key={booking.id}
                          className="border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => toggleExpand(booking.id)}
                            className="w-full text-left p-4 hover:bg-orange-50/40 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-2 flex-1 min-w-0 pr-4">
                                {isExpanded
                                  ? <ChevronDown className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                  : <ChevronRight className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />}
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-gray-800 mb-1 truncate">
                                    {booking.event_title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4 flex-shrink-0" />
                                      {formatDate(booking.event_date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Ticket className="w-4 h-4 flex-shrink-0" />
                                      {booking.quantity} ticket{booking.quantity !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold text-gray-800 mb-2">
                                  {booking.total_price === 0 ? 'Free' : `KES ${booking.total_price.toLocaleString()}`}
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                                >
                                  <StatusIcon status={booking.status} />
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 pl-6">
                              Booked on {formatDate(booking.created_at)}
                            </div>
                          </button>

                          {/* Inline expand — ticket-type breakdown for this order */}
                          {isExpanded && fullOrder && (
                            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 pl-10 space-y-2">
                              {fullOrder.bookings.map((line) => (
                                <div key={line.id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">
                                    {line.ticket_type_name} × {line.quantity}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(line.status)}`}
                                    >
                                      {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      KES {line.total_price.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {fullOrder.mpesa_ref && (
                                <div className="pt-2 border-t border-gray-200 text-xs text-gray-500 font-mono">
                                  M-Pesa Ref: {fullOrder.mpesa_ref}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No bookings yet</p>
                    <button
                      onClick={() => navigate('/browse-events')}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      Browse Events
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h3>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="border-l-4 border-orange-500 bg-orange-50 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm line-clamp-2">
                          {event.title}
                        </h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            {formatDate(event.date)}
                          </div>
                          {event.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{event.venue}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Ticket className="w-3 h-3 flex-shrink-0" />
                            {event.tickets} ticket{event.tickets !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/browse-events')}
                    className="w-full bg-white text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
                  >
                    Browse Events
                  </button>
                  <button
                    onClick={() => navigate('/my-tickets')}
                    className="w-full bg-orange-700 text-white py-2 rounded-lg font-medium hover:bg-orange-800 transition-colors text-sm"
                  >
                    View My Tickets
                  </button>
                  <button
                    onClick={() => window.open('https://organizer.mgltickets.com', '_blank')}
                    className="w-full bg-orange-700 text-white py-2 rounded-lg font-medium hover:bg-orange-800 transition-colors text-sm"
                  >
                    View My Events
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UserDashboard;