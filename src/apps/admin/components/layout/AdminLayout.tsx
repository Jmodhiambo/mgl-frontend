// src/apps/admin/components/layout/AdminLayout.tsx
import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import {
  getContactMessageStats,
  getUnreadNotificationCount,
  getUnapprovedEvents,
} from '@admin/services/adminService';
import { adminEvents } from '@admin/utils/adminEvents';

// ─── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 60_000; // refresh badges every 60 seconds

// ─── Page titles ──────────────────────────────────────────────────────────────

const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/users':        'User Management',
  '/events':       'Event Management',
  '/orders':       'Order Management',
  '/bookings':     'Bookings',
  '/payments':     'Payments',
  '/ticket-types': 'Ticket Types',
  '/check-in':     'Check-In',
  '/messages':     'Contact Messages',
  '/analytics':    'Analytics',
  '/article-analytics': 'Article Analytics',
  '/reports':      'Reports',
  '/audit-logs':   'Audit Logs',
  '/settings':     'Settings',
  '/notifications': 'Notifications',
  '/profile':      'My Profile',
};

// ─── Component ────────────────────────────────────────────────────────────────

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location                      = useLocation();
  const { user, logout }              = useAuth();

  // ── Badge state ─────────────────────────────────────────────────────────────
  const [pendingApprovals,    setPendingApprovals]    = useState(0);
  const [openMessages,        setOpenMessages]        = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // ── Fetch all badge counts in one shot ──────────────────────────────────────
  const fetchBadges = useCallback(async () => {
    try {
      const [events, msgStats, notifCount] = await Promise.allSettled([
        getUnapprovedEvents(),
        getContactMessageStats(),
        getUnreadNotificationCount(),
      ]);

      if (events.status === 'fulfilled')
        setPendingApprovals(events.value.length);

      if (msgStats.status === 'fulfilled')
        // new + pending are the ones needing admin attention
        setOpenMessages(msgStats.value.new + msgStats.value.pending);

      if (notifCount.status === 'fulfilled')
        setUnreadNotifications(notifCount.value);
    } catch {
      // Silently degrade — stale badge counts are better than a broken layout
    }
  }, []);

  // Fetch on mount, poll every 60s, and respond to manual badge:refresh events
  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, POLL_INTERVAL_MS);
    adminEvents.on('badges:refresh', fetchBadges);
    return () => {
      clearInterval(interval);
      adminEvents.off('badges:refresh', fetchBadges);
    };
  }, [fetchBadges]);

  // Re-fetch when navigating away from messages or events so badges update
  // immediately after the admin takes action on those pages
  useEffect(() => {
    fetchBadges();
  }, [location.pathname, fetchBadges]);

  // Close the mobile sidebar automatically after navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] ?? 'Admin Panel';

  const adminName = user?.name ?? 'Admin';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header — fixed top, offset past the sidebar on desktop ── */}
      <Header
        title={pageTitle}
        onMenuToggle={() => setSidebarOpen(prev => !prev)}
        menuOpen={sidebarOpen}
        adminName={adminName}
        unreadNotifications={unreadNotifications}
        onNotificationsRead={() => setUnreadNotifications(0)}
      />

      {/* ── Sidebar — fixed left; slides in/out on mobile, always visible on desktop ── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingApprovals={pendingApprovals}
        openMessages={openMessages}
        unreadNotifications={unreadNotifications}
        onLogout={logout}
      />

      {/* ── Mobile backdrop, shown only while the sidebar is open ── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content — padded past the fixed header/sidebar ── */}
      <main className="pt-[var(--header-height)] lg:pl-[var(--sidebar-width)] min-h-screen">
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Resets scroll to top on navigation between these routes, restores
          scroll position on browser back/forward */}
      <ScrollRestoration />
    </div>
  );
};

export default AdminLayout;