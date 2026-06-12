// src/apps/admin/pages/Analytics.tsx
// ─── NOTE: New endpoints needed in backend ─────────────────────────────────
// ⚠️  GET /admin/analytics/dashboard      → DashboardStats aggregate
// ⚠️  GET /admin/analytics/revenue        → monthly revenue array
// ⚠️  GET /admin/analytics/user-growth    → monthly user growth array
// ⚠️  GET /admin/analytics/events-by-category → category distribution
// ⚠️  GET /admin/analytics/booking-statuses   → booking status distribution
// See services/adminService.tsx for full shape of each response.

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Ticket, DollarSign } from 'lucide-react';
import { SectionCard, PageLoader, MiniBarChart, SparkLine } from '@admin/components/ui';
import {
  getDashboardStats, getRevenueChart,
  getUserGrowthChart, getEventCategories,
} from '@admin/services/adminService';
import {
  dummyBookingStatuses, dummyEventCategories, dummyDashboardStats,
} from '@admin/utils/dummyData';
import { formatKES } from '@admin/utils/format';
import type { DashboardStats } from '@admin/types';

const Analytics: React.FC = () => {
  const [stats, setStats]         = useState<DashboardStats | null>(null);
  const [revenueData, setRevenue] = useState<{ label: string; value: number }[]>([]);
  const [growthData, setGrowth]   = useState<{ label: string; value: number }[]>([]);
  const [catData, setCat]         = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [period, setPeriod]       = useState<'7d'|'30d'|'90d'|'12m'>('30d');

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRevenueChart(),
      getUserGrowthChart(),
      getEventCategories(),
    ]).then(([s, r, g, c]) => {
      setStats(s); setRevenue(r); setGrowth(g); setCat(c);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return null;

  const bookingStatuses = dummyBookingStatuses;
  const totalBookings = bookingStatuses.reduce((s, b) => s + b.value, 0);

  const platformMetrics = [
    { label: 'Avg. Booking Value',   value: formatKES(Math.round(stats.total_revenue / (stats.total_bookings || 1))), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Events per Organizer', value: (stats.total_events / (stats.total_organizers || 1)).toFixed(1), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Bookings per Event',   value: (stats.total_bookings / (stats.total_events || 1)).toFixed(1), icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'User–Organizer Ratio', value: `${Math.round(((stats.total_users - stats.total_organizers) / stats.total_users) * 100)}%`, icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Platform performance and insights</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['7d','30d','90d','12m'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all
                ${period === p ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[
          { label: 'Total Revenue',  value: formatKES(stats.total_revenue),       delta: '+9.8%', up: true,  icon: DollarSign, bg: 'bg-emerald-100', color: 'text-emerald-600' },
          { label: 'Total Users',    value: stats.total_users.toLocaleString(),    delta: `+${stats.new_users_this_week} this week`, up: true, icon: Users, bg: 'bg-purple-100', color: 'text-purple-600' },
          { label: 'Total Bookings', value: stats.total_bookings.toLocaleString(), delta: '+12.3%', up: true, icon: Ticket, bg: 'bg-blue-100', color: 'text-blue-600' },
          { label: 'Active Events',  value: stats.active_events,                  delta: `${stats.total_events} total`, up: true, icon: Calendar, bg: 'bg-amber-100', color: 'text-amber-600' },
        ].map(c => (
          <div key={c.label} className="stat-card animate-fade-in flex-col items-start gap-3">
            <div className="flex items-center justify-between w-full">
              <p className="stat-label">{c.label}</p>
              <div className={`stat-icon ${c.bg} flex-shrink-0`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
            <div>
              <p className="stat-value text-xl leading-tight">{c.value}</p>
              <p className={c.up ? 'stat-delta-up' : 'stat-delta-down'}>{c.delta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue Chart */}
        <SectionCard title="Revenue Trend" subtitle="Monthly revenue (KES)">
          <div className="mb-3">
            <p className="text-3xl font-bold text-gray-900">{formatKES(stats.revenue_this_month)}</p>
            <p className="text-sm text-emerald-600 font-medium mt-0.5">↑ 9.8% vs last month</p>
          </div>
          <MiniBarChart data={revenueData} height={140} color="#9333ea" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {revenueData.map(d => <span key={d.label}>{d.label}</span>)}
          </div>
        </SectionCard>

        {/* User Growth */}
        <SectionCard title="User Growth" subtitle="Registered users by month">
          <div className="mb-3">
            <p className="text-3xl font-bold text-gray-900">{stats.total_users.toLocaleString()}</p>
            <p className="text-sm text-emerald-600 font-medium mt-0.5">↑ {stats.new_users_this_week} new this week</p>
          </div>
          <SparkLine data={growthData.map(d => d.value)} height={100} color="#6b21a8" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {growthData.map(d => <span key={d.label}>{d.label}</span>)}
          </div>
        </SectionCard>

      </div>

      {/* ── Distribution Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Event Categories */}
        <SectionCard title="Events by Category" subtitle="All time distribution">
          <div className="space-y-3">
            {catData.map((c, i) => {
              const total = catData.reduce((s, d) => s + d.value, 0);
              const pct = Math.round((c.value / total) * 100);
              const colors = ['bg-purple-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-red-500','bg-pink-500','bg-teal-500'];
              return (
                <div key={c.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{c.label}</span>
                    <span className="text-gray-500">{c.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${colors[i % colors.length]}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Booking Status */}
        <SectionCard title="Booking Status" subtitle="Current distribution">
          <div className="space-y-3">
            {bookingStatuses.map((b, i) => {
              const pct = Math.round((b.value / totalBookings) * 100);
              const colors = ['bg-emerald-500','bg-amber-500','bg-red-500','bg-purple-500'];
              const textColors = ['text-emerald-700','text-amber-700','text-red-700','text-purple-700'];
              return (
                <div key={b.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-semibold ${textColors[i]}`}>{b.label}</span>
                    <span className="text-gray-500">{b.value.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[i]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Platform Metrics */}
        <SectionCard title="Platform Metrics" subtitle="Key computed ratios">
          <div className="grid grid-cols-1 gap-4">
            {platformMetrics.map(m => (
              <div key={m.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${m.bg}`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{m.label}</p>
                  <p className="text-lg font-bold text-gray-900">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>

      {/* ── User Role Breakdown ── */}
      <SectionCard title="User Breakdown" subtitle="Distribution across roles and status">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Regular Users',   value: stats.total_users - stats.total_organizers - 1, pct: 78, color: 'bg-purple-500' },
            { label: 'Organizers',      value: stats.total_organizers, pct: 18, color: 'bg-blue-500' },
            { label: 'Admins',          value: 1, pct: 4, color: 'bg-amber-500' },
            { label: 'Pending Approval',value: stats.pending_approvals, pct: stats.pending_approvals, color: 'bg-red-400' },
          ].map(r => (
            <div key={r.label} className="text-center">
              {/* Circular progress */}
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={r.color.replace('bg-', '').includes('purple') ? '#9333ea'
                      : r.color.includes('blue') ? '#3b82f6'
                      : r.color.includes('amber') ? '#f59e0b' : '#f87171'}
                    strokeWidth="3"
                    strokeDasharray={`${r.pct} ${100 - r.pct}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-800">{r.pct}%</span>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">{r.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{r.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

    </div>
  );
};

export default Analytics;