// src/apps/admin/routes.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@shared/routing/ProtectedRoute';
import AdminLayout from '@admin/components/layout/AdminLayout';

// Pages
import Dashboard   from '@admin/pages/Dashboard';
import Users       from '@admin/pages/Users';
import Events      from '@admin/pages/Events';
import Orders      from '@admin/pages/Orders';
import Bookings    from '@admin/pages/Bookings';
import Payments    from '@admin/pages/Payments';
import TicketTypes from '@admin/pages/TicketTypes';
import CheckIn     from '@admin/pages/CheckIn';
import Messages    from '@admin/pages/Messages';
import Analytics   from '@admin/pages/Analytics';
import Reports     from '@admin/pages/Reports';
import AuditLogs   from '@admin/pages/AuditLogs';
import Settings    from '@admin/pages/Settings';
import Notifications from '@admin/pages/Notifications';
import MyProfile from '@admin/pages/MyProfile';
import ActivityFeed from '@admin/pages/ActivityFeed';

export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // All admin routes — protected, require role === 'admin'
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,              element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',        element: <Dashboard /> },
      { path: 'users',            element: <Users /> },
      { path: 'events',           element: <Events /> },
      { path: 'orders',           element: <Orders /> },
      { path: 'bookings',         element: <Bookings /> },
      { path: 'payments',         element: <Payments /> },
      { path: 'check-in',         element: <CheckIn /> },
      { path: 'ticket-types',     element: <TicketTypes /> },
      { path: 'messages',         element: <Messages /> },
      { path: 'analytics',        element: <Analytics /> },
      { path: 'reports',          element: <Reports /> },
      { path: 'audit-logs',       element: <AuditLogs /> },
      { path: 'settings',         element: <Settings /> },
      { path: 'notifications',    element: <Notifications /> },
      { path: 'profile',       element: <MyProfile /> },
      { path: 'activity-feed',   element: <ActivityFeed /> },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);