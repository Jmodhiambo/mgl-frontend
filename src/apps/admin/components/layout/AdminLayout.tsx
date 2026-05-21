// src/apps/admin/components/layout/AdminLayout.tsx
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { dummyDashboardStats } from '@admin/utils/dummyData';

// Map route paths to readable page titles
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
};

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] ?? 'Admin Panel';

  const adminName = user ? `${user.name}` : 'Admin';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Sidebar — desktop: always visible ── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          pendingApprovals={dummyDashboardStats.pending_approvals}
          openMessages={dummyDashboardStats.open_messages}
          onLogout={logout}
        />
      </div>

      {/* ── Sidebar — mobile: overlay ── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-50" onClick={e => e.stopPropagation()}>
            <Sidebar
              pendingApprovals={dummyDashboardStats.pending_approvals}
              openMessages={dummyDashboardStats.open_messages}
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