// src/apps/admin/components/layout/AdminLayout.tsx
import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import {
  getContactMessageStats,
  getUnreadNotificationCount,
  getUnapprovedEvents,
} from '@admin/services/adminService';

// ─── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 60_000; // refresh badges every 60 seconds

// ─── Page titles ──────────────────────────────────────────────────────────────

const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/users':        'User Management',
  '/events':       'Event Management',
  '/bookings':     'Bookings',
  '/payments':     'Payments',
  '/ticket-types': 'Ticket Types',
  '/messages':     'Contact Messages',
  '/analytics':    'Analytics',
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

  // Fetch on mount, then poll
  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchBadges]);

  // Re-fetch when navigating away from messages or events so badges update
  // immediately after the admin takes action on those pages
  useEffect(() => {
    fetchBadges();
  }, [location.pathname, fetchBadges]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] ?? 'Admin Panel';

  const adminName = user?.name ?? 'Admin';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Sidebar — desktop ── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          pendingApprovals={pendingApprovals}
          openMessages={openMessages}
          unreadNotifications={unreadNotifications}
          onLogout={logout}
        />
      </div>

      {/* ── Sidebar — mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-50" onClick={e => e.stopPropagation()}>
            <Sidebar
              pendingApprovals={pendingApprovals}
              openMessages={openMessages}
              unreadNotifications={unreadNotifications}
              onLogout={logout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={pageTitle}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          menuOpen={sidebarOpen}
          adminName={adminName}
          unreadNotifications={unreadNotifications}
          onNotificationsRead={() => setUnreadNotifications(0)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="page-container animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;