// src/apps/admin/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Ticket, TrendingUp, AlertCircle,
  MessageSquare, DollarSign, Clock, CheckCircle, ArrowRight,
  UserPlus, CalendarPlus, TicketCheck, Banknote,
} from 'lucide-react';
import {
  StatCard, SectionCard, MiniBarChart, SparkLine, PageLoader,
} from '@admin/components/ui';
import { StatusBadge } from '@admin/components/ui';
import { getDashboardStats, getRevenueChart, getUserGrowthChart, listAllUsers, getUnapprovedEvents, getActivityFeed } from '@admin/services/adminService';
import { formatKES } from '@admin/utils/format';
import type { AdminUser, AdminEvent, DashboardStats } from '@admin/types';
import type { ActivityFeedItem } from '@admin/services/adminService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingEvents, setPendingEvents] = useState<AdminEvent[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [revenueData, setRevenueData]   = useState<{ label: string; value: number }[]>([]);
  const [growthData, setGrowthData]     = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r, g, u, pe, af] = await Promise.all([
          getDashboardStats(),
          getRevenueChart(),
          getUserGrowthChart(),
          listAllUsers(),
          getUnapprovedEvents(),
          getActivityFeed(6),
        ]);
        setStats(s);
        setUsers(u);
        setRevenueData(r);
        setGrowthData(g);
        setPendingEvents(pe);
        setActivityFeed(af);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform overview · {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <AlertCircle className="w-4 h-4" />
          <span><strong>{stats.pending_approvals}</strong> events pending approval</span>
          <button onClick={() => navigate('/events?filter=unapproved')} className="text-amber-800 underline ml-1 font-medium">
            Review
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          label="Total Users"
          value={stats.total_users.toLocaleString()}
          delta={{ value: `+${stats.new_users_this_week} this week`, up: true }}
          icon={Users}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          label="Total Events"
          value={stats.total_events.toLocaleString()}
          delta={{ value: `${stats.active_events} active`, up: true }}
          icon={Calendar}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Total Bookings"
          value={stats.total_bookings.toLocaleString()}
          delta={{ value: '↑ 12% vs last month', up: true }}
          icon={Ticket}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Revenue (Month)"
          value={formatKES(stats.revenue_this_month)}
          delta={{ value: '↑ 9.8% vs last month', up: true }}
          icon={DollarSign}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <div className="card-sm flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">Organizers</p>
            <p className="font-bold text-gray-900 truncate">{stats.total_organizers}</p>
          </div>
        </div>
        <div className="card-sm flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">Pending Approvals</p>
            <p className="font-bold text-gray-900 truncate">{stats.pending_approvals}</p>
          </div>
        </div>
        <div className="card-sm flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">Open Messages</p>
            <p className="font-bold text-gray-900 truncate">{stats.open_messages}</p>
          </div>
        </div>
        <div className="card-sm flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">Total Revenue</p>
            <p className="font-bold text-gray-900 text-sm truncate">{formatKES(stats.total_revenue)}</p>
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <SectionCard
          title="Monthly Revenue"
          subtitle="Last 7 months"
          actions={
            <button onClick={() => navigate('/analytics')} className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
              Full report <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <MiniBarChart data={revenueData} height={120} color="#9333ea" />
        </SectionCard>

        {/* User Growth */}
        <SectionCard
          title="User Growth"
          subtitle="Last 6 months"
          actions={
            <button onClick={() => navigate('/analytics')} className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
              Details <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <SparkLine data={growthData.map(d => d.value)} height={80} color="#6b21a8" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {growthData.map(d => <span key={d.label}>{d.label}</span>)}
          </div>
          <p className="text-sm text-emerald-600 font-semibold mt-2">
            ↑ {((growthData[growthData.length - 1]?.value - growthData[0]?.value) / growthData[0]?.value * 100).toFixed(1)}% growth
          </p>
        </SectionCard>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pending Approvals */}
        <SectionCard
          title="Pending Event Approvals"
          subtitle={`${pendingEvents.length} awaiting review`}
          noPadding
          actions={
            <button onClick={() => navigate('/events?filter=unapproved')} className="text-xs text-purple-600 font-medium">
              View all
            </button>
          }
        >
          <div className="divide-y divide-gray-50">
            {pendingEvents.slice(0, 4).map(event => (
              <div key={event.id} className="flex items-center gap-3 px-6 py-3 hover:bg-purple-50/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <CalendarPlus className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.organizer_name}</p>
                </div>
                <button
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap"
                >
                  Review →
                </button>
              </div>
            ))}
            {pendingEvents.length === 0 && (
              <div className="px-6 py-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All caught up!</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Recent Activity */}
        <SectionCard
          title="Recent Activity"
          subtitle="Live platform feed"
          noPadding
        >
          <div className="divide-y divide-gray-50">
            {activityFeed.slice(0, 6).map(item => {
              const iconMap: Record<string, React.ElementType> = {
                ticket: TicketCheck, user: UserPlus, calendar: CalendarPlus,
                money: Banknote, message: MessageSquare, check: CheckCircle,
              };
              const Icon = iconMap[item.icon] ?? Clock;
              const colorMap: Record<string, string> = {
                ticket: 'bg-blue-100 text-blue-600', user: 'bg-purple-100 text-purple-600',
                calendar: 'bg-amber-100 text-amber-600', money: 'bg-emerald-100 text-emerald-600',
                message: 'bg-red-100 text-red-600', check: 'bg-emerald-100 text-emerald-600',
              };
              return (
                <div key={item.id} className="flex items-start gap-3 px-6 py-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorMap[item.icon] ?? 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed">{item.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
            {activityFeed.length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No recent activity.</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Quick Stats: Users by Role */}
        <SectionCard title="Platform Overview">
          <div className="space-y-4">
            {[
              { label: 'Regular Users',   count: users.filter(u => u.role === 'user').length,      color: 'bg-gray-200', fill: 'bg-purple-500', pct: 78 },
              { label: 'Organizers',       count: users.filter(u => u.role === 'organizer').length, color: 'bg-gray-200', fill: 'bg-blue-500',   pct: 18 },
              { label: 'Administrators',   count: users.filter(u => u.role === 'admin').length,     color: 'bg-gray-200', fill: 'bg-amber-500',  pct: 4  },
            ].map(row => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-semibold text-gray-800">{row.count}</span>
                </div>
                <div className={`h-2 rounded-full ${row.color}`}>
                  <div className={`h-2 rounded-full ${row.fill} transition-all duration-700`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}

            <div className="divider" />

            <div className="space-y-2">
              {[
                { label: 'Active Events',    value: stats.active_events,        color: 'text-emerald-600' },
                { label: 'Pending Approval', value: stats.pending_approvals,    color: 'text-amber-600'   },
                { label: 'Open Messages',    value: stats.open_messages,        color: 'text-red-600'     },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{row.label}</span>
                  <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Dashboard;