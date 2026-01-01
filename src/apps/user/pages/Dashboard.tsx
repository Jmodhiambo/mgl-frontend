import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Ticket, CreditCard, User, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '@shared/api/user/usersApi';

interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  is_verified: boolean;
}

interface DashboardStats {
  totalBookings: number;
  activeTickets: number;
  totalSpent: number;
  upcomingEvents: number;
}

interface Booking {
  id: number;
  event_title: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  event_date: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  venue: string;
  tickets: number;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async (): Promise<void> => {
      try {
        // Replace with actual API calls:
        // const userRes = await fetch('/api/users/me');
        // const bookingsRes = await fetch('/api/users/me/bookings');
        // const ticketsRes = await fetch('/api/users/me/ticket-instances');
        
        // Mock data
        const userRes: User = await getCurrentUser();        
        
        const mockStats: DashboardStats = {
          totalBookings: 12,
          activeTickets: 8,
          totalSpent: 45000,
          upcomingEvents: 3
        };

        const mockRecentBookings: Booking[] = [
          {
            id: 1,
            event_title: "Summer Music Festival 2025",
            quantity: 2,
            total_price: 10000,
            status: "confirmed",
            created_at: "2025-01-15T10:30:00Z",
            event_date: "2025-07-15T14:00:00Z"
          },
          {
            id: 2,
            event_title: "Tech Conference 2025",
            quantity: 1,
            total_price: 5000,
            status: "confirmed",
            created_at: "2025-01-10T15:20:00Z",
            event_date: "2025-08-20T09:00:00Z"
          },
          {
            id: 3,
            event_title: "Food & Wine Expo",
            quantity: 2,
            total_price: 8000,
            status: "pending",
            created_at: "2025-01-05T12:00:00Z",
            event_date: "2025-09-10T12:00:00Z"
          }
        ];

        const mockUpcomingEvents: UpcomingEvent[] = [
          {
            id: 1,
            title: "Summer Music Festival 2025",
            date: "2025-07-15T14:00:00Z",
            venue: "Kasarani Stadium",
            tickets: 2
          },
          {
            id: 2,
            title: "Tech Conference 2025",
            date: "2025-08-20T09:00:00Z",
            venue: "KICC",
            tickets: 1
          }
        ];

        setUser(userRes);
        setStats(mockStats);
        setRecentBookings(mockRecentBookings);
        setUpcomingEvents(mockUpcomingEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
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

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-12">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">Here's what's happening with your events</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Ticket className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stats?.totalBookings}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stats?.activeTickets}
            </div>
            <div className="text-sm text-gray-600">Active Tickets</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              KES {stats?.totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stats?.upcomingEvents}
            </div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Bookings</h3>
                <Link to="/my-tickets" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentBookings.map((booking: Booking) => (
                  <div 
                    key={booking.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {booking.event_title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(booking.event_date)}
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
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
                      Booked on {formatDate(booking.created_at)}
                    </div>
                  </div>
                ))}
              </div>

              {recentBookings.length === 0 && (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No bookings yet</p>
                  <button className="mt-4 text-orange-600 hover:text-orange-700 font-medium">
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
              <div className="space-y-4">
                {upcomingEvents.map((event: UpcomingEvent) => (
                  <div 
                    key={event.id}
                    className="border-l-4 border-orange-500 bg-orange-50 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                      {event.title}
                    </h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center">
                        <Ticket className="w-3 h-3 mr-1" />
                        {event.tickets} ticket{event.tickets > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {upcomingEvents.length === 0 && (
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
                  className="w-full bg-white text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm">
                  Browse Events
                </button>
                <button 
                  onClick={() => navigate('/my-tickets')}
                  className="w-full bg-orange-700 text-white py-2 rounded-lg font-medium hover:bg-orange-800 transition-colors text-sm">
                  View My Tickets
                </button>
                <button
                  onClick={() => window.open('https://organizer.mgltickets.com', '_blank')}
                  className="w-full bg-orange-700 text-white py-2 rounded-lg font-medium hover:bg-orange-800 transition-colors text-sm">
                  View My Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;