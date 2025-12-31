import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@shared/routing/ProtectedRoute';
import PublicRoute from '@shared/routing/PublicRoute';
import ProtectedLayout from '@shared/components/layouts/ProtectedLayout';
import PublicLayout from '@shared/components/layouts/PublicLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import BrowseEvents from './pages/BrowseEvents';
import CheckoutBooking from './pages/CheckoutBooking';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import BrowseEventDetails from './pages/BrowseEventDetails';
import Login from './pages/Login';
import Register from './pages/Register';

/**
 * Router configuration for MGLTickets
 * 
 * Route Structure:
 * - Public routes: Base paths (/, /events, /events/:id) - No navbar
 * - Protected routes: Enhanced experience with navbar (/browse-events, /dashboard, etc.)
 */
export const router = createBrowserRouter([
  // Standalone auth routes (no layout)
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  
  // Public routes (accessible without authentication - No navbar)
  {
    path: '/',
    element: (
      <PublicRoute>
        <PublicLayout />
      </PublicRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'events',
        element: <Events />,
      },
      {
        path: 'events/:eventId',
        element: <EventDetails />,
      },
    ],
  },
  
  // Protected routes (require authentication - Has navbar)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'browse-events',
        element: <BrowseEvents />,
      },
      {
        path: 'browse-events/:eventId',
        element: <BrowseEventDetails />,
      },
      {
        path: 'my-tickets',
        element: <MyTickets />,
      },
      {
        path: 'checkout',
        element: <CheckoutBooking />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
  
  // Fallback - redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);