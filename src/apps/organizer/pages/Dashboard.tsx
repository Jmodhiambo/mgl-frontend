// src/apps/organizer/pages/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Ticket, Users, TrendingUp, DollarSign, Clock,
  CheckCircle, Eye, BarChart3, ArrowUpRight, ArrowDownRight,
  AlertCircle, Loader2, TrendingDown,
} from 'lucide-react';
import {
  getOrganizerStats,
  getRecentOrganizerOrders,
  getTopEvents,
  type DashboardStats,
  type OrganizerOrderOut,
  type TopEvent,
} from '@shared/api/organizer/orgOrderApi';
import { formatKES, formatDate } from '@shared/utils/format';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// const formatDate = (iso: string) =>
//   new Date(iso).toLocaleDateString('en-US', {
//     month: 'short', day: 'numeric',
//     hour: '2-digit', minute: '2-digit',
//   });

const statusColour: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  badge?: React.ReactNode;
}> = ({ label, value, icon, accent, badge }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${accent} hover:shadow-lg transition-shadow`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${accent.replace('border-', 'bg-').replace('-500', '-100')}`}>
        {icon}
      </div>
      {badge}
    </div>
    <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats,          setStats]          = useState<DashboardStats | null>(null);
  const [recentOrders,   setRecentOrders]   = useState<OrganizerOrderOut[]>([]);
  const [topEvents,      setTopEvents]      = useState<TopEvent[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, ordersData, eventsData] = await Promise.all([
        getOrganizerStats(),
        getRecentOrganizerOrders(5),
        getTopEvents(3),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData);
      setTopEvents(eventsData);
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-600 font-semibold">{error ?? 'No data available.'}</p>
          <button onClick={load} className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const growthPositive = stats.monthly_growth >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Here's what's happening with your events.</p>
        </div>

        {/* KPI stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Events"
            value={stats.total_events}
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
            accent="border-blue-500"
            badge={
              <div className={`flex items-center text-sm font-medium ${growthPositive ? 'text-green-600' : 'text-red-500'}`}>
                {growthPositive
                  ? <ArrowUpRight className="w-4 h-4 mr-1" />
                  : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {Math.abs(stats.monthly_growth)}%
              </div>
            }
          />
          <StatCard
            label="Total Bookings"
            value={stats.total_bookings}
            icon={<Ticket className="w-6 h-6 text-blue-600" />}
            accent="border-blue-500"
          />
          <StatCard
            label="Gross Revenue"
            value={`KES ${(stats.total_revenue / 1000).toFixed(0)}K`}
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            accent="border-green-500"
          />
          <StatCard
            label="Tickets Sold"
            value={stats.tickets_sold}
            icon={<Users className="w-6 h-6 text-purple-600" />}
            accent="border-purple-500"
          />
        </div>

        {/* Revenue breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Gross Revenue</p>
              <p className="text-2xl font-bold text-gray-800">{formatKES(stats.total_revenue)}</p>
              <p className="text-xs text-gray-400 mt-1">Total confirmed bookings</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Platform Cut</p>
              <p className="text-2xl font-bold text-red-600">− {formatKES(stats.platform_cut)}</p>
              <p className="text-xs text-gray-400 mt-1">Weighted avg commission</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <p className="text-sm text-gray-500 mb-1">Your Earnings</p>
              <p className="text-2xl font-bold text-green-600">{formatKES(stats.organizer_net)}</p>
              <p className="text-xs text-gray-400 mt-1">After platform fees</p>
            </div>
          </div>
        </div>

        {/* Event status overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Active Events</h3>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.active_events}</div>
            <p className="text-sm text-gray-600">Currently ongoing</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Upcoming</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.upcoming_events}</div>
            <p className="text-sm text-gray-600">Scheduled events</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.completed_events}</div>
            <p className="text-sm text-gray-600">Past events</p>
          </div>
        </div>

        {/* Recent orders + Top events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
              <button
                onClick={() => navigate('/bookings')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
              >
                View All <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Ticket className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-0.5 truncate">
                          {order.event_title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {order.customer_name} · {order.bookings.length} ticket type{order.bookings.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="font-bold text-gray-800 mb-1">
                          {formatKES(order.total_price)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColour[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {/* Commission mini-breakdown */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
                      <span>{formatDate(order.created_at)}</span>
                      <span className="ml-auto">Net: <span className="text-green-600 font-medium">{formatKES(order.organizer_net)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-1 space-y-6">

            {/* Top events */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Top Events</h3>
                <button
                  onClick={() => navigate('/events')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>

              {topEvents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No event data yet</p>
              ) : (
                <div className="space-y-4">
                  {topEvents.map((event, i) => (
                    <div key={event.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-blue-600 font-bold text-sm">#{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-1">{event.title}</h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Bookings:</span>
                              <span className="font-semibold">{event.bookings}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Gross:</span>
                              <span className="font-semibold">{formatKES(event.revenue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Your net:</span>
                              <span className="font-semibold text-green-600">{formatKES(event.organizer_net)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/events/create')}
                  className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <Calendar className="w-4 h-4 mr-2" /> Create New Event
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" /> View All Events
                </button>
                <button
                  onClick={() => navigate('/bookings')}
                  className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center"
                >
                  <BarChart3 className="w-4 h-4 mr-2" /> View Bookings
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