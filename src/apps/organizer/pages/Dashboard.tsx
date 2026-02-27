import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Ticket, Users, TrendingUp, DollarSign, Clock, CheckCircle, Eye, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStats {
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  activeEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  monthlyGrowth: number;
  ticketsSold: number;
}

interface RecentBooking {
  id: number;
  event_title: string;
  customer_name: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface TopEvent {
  id: number;
  title: string;
  bookings: number;
  revenue: number;
  tickets_sold: number;
}

const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 12,
    totalBookings: 245,
    totalRevenue: 1250000,
    activeEvents: 5,
    upcomingEvents: 8,
    completedEvents: 4,
    monthlyGrowth: 23.5,
    ticketsSold: 892
  });

  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([
    {
      id: 1,
      event_title: "Summer Music Festival 2025",
      customer_name: "John Doe",
      quantity: 2,
      total_price: 10000,
      status: "confirmed",
      created_at: "2025-01-24T10:30:00Z"
    },
    {
      id: 2,
      event_title: "Tech Innovation Summit",
      customer_name: "Jane Smith",
      quantity: 1,
      total_price: 5000,
      status: "confirmed",
      created_at: "2025-01-24T09:15:00Z"
    },
    {
      id: 3,
      event_title: "Food & Wine Expo",
      customer_name: "Mike Johnson",
      quantity: 3,
      total_price: 12000,
      status: "pending",
      created_at: "2025-01-23T16:45:00Z"
    },
    {
      id: 4,
      event_title: "Comedy Night Extravaganza",
      customer_name: "Sarah Williams",
      quantity: 2,
      total_price: 6000,
      status: "confirmed",
      created_at: "2025-01-23T14:20:00Z"
    }
  ]);

  const [topEvents, setTopEvents] = useState<TopEvent[]>([
    {
      id: 1,
      title: "Summer Music Festival 2025",
      bookings: 89,
      revenue: 445000,
      tickets_sold: 312
    },
    {
      id: 2,
      title: "Tech Innovation Summit",
      bookings: 56,
      revenue: 280000,
      tickets_sold: 198
    },
    {
      id: 3,
      title: "Food & Wine Expo",
      bookings: 43,
      revenue: 215000,
      tickets_sold: 156
    }
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch dashboard data from API
    // const fetchDashboardData = async () => {
    //   setLoading(true);
    //   const stats = await getOrganizerStats();
    //   const bookings = await getRecentBookings();
    //   const events = await getTopPerformingEvents();
    //   setStats(stats);
    //   setRecentBookings(bookings);
    //   setTopEvents(events);
    //   setLoading(false);
    // };
    // fetchDashboardData();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your events.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Events */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {stats.monthlyGrowth}%
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stats.totalEvents}
            </div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stats.totalBookings}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              KES {(stats.totalRevenue / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>

          {/* Tickets Sold */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stats.ticketsSold}
            </div>
            <div className="text-sm text-gray-600">Tickets Sold</div>
          </div>
        </div>

        {/* Event Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Active Events</h3>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.activeEvents}
            </div>
            <p className="text-sm text-gray-600">Currently ongoing</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Upcoming</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.upcomingEvents}
            </div>
            <p className="text-sm text-gray-600">Scheduled events</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats.completedEvents}
            </div>
            <p className="text-sm text-gray-600">Past events</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Bookings</h3>
                <button 
                  onClick={() => navigate('/bookings')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {booking.event_title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {booking.customer_name}
                          </span>
                          <span className="flex items-center">
                            <Ticket className="w-4 h-4 mr-1" />
                            {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800 mb-2">
                          KES {booking.total_price.toLocaleString()}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
                      {formatDate(booking.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Events */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Top Events</h3>
                <button 
                    onClick={() => navigate('/events')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                >
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </button>
              </div>

              <div className="space-y-4">
                {topEvents.map((event, index) => (
                  <div key={event.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start mb-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">
                          {event.title}
                        </h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Bookings:</span>
                            <span className="font-semibold">{event.bookings}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Revenue:</span>
                            <span className="font-semibold text-green-600">
                              KES {(event.revenue / 1000).toFixed(0)}K
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Tickets Sold:</span>
                            <span className="font-semibold">{event.tickets_sold}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/events/create')}
                  className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Create New Event
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Events
                </button>
                <button
                  onClick={() => navigate('/bookings')}
                  className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center"
                  >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;