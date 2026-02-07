import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@shared/routing/ProtectedRoute';
import PublicRoute from '@shared/routing/PublicRoute';
import OrganizerLayout from '@shared/components/layouts/OrganizerLayout';

// Import Organizer Pages
import Dashboard from '@organizer/pages/Dashboard';
import EventsList from '@organizer/pages/EventsList';
import EventForm from '@organizer/pages/EventForm';
import EventDetails from '@organizer/pages/EventDetails';
import TicketTypes from '@organizer/pages/TicketTypes';
import BookingsView from '@organizer/pages/BookingsView';
import Profile from '@organizer/pages/Profile';
import CoOrganizers from '@organizer/pages/CoOrganizers';
import { NotFoundPage } from '@shared/pages';

/**
 * Router configuration for MGLTickets Organizer Portal
 * 
 * Base path is configured here based on environment:
 * Development: /organizer
 * Production: /
 * 
 * All routes require organizer authentication
 * Port: 3001
 */

export const router = createBrowserRouter([
  // Root redirect to dashboard
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Protected Organizer Routes
  {
    // Remove ProtectedRoute wrapper in development for easier testing
    path: '/',
    element: (
      <ProtectedRoute>
        <OrganizerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'events',
        element: <EventsList />,
      },
      {
        path: 'events/create',
        element: <EventForm mode="create" />,
      },
      {
        path: 'events/:eventSlug',
        element: <EventDetails />,
      },
      {
        path: 'events/:eventSlug/edit',
        // EventForm will extract eventSlug from useParams
        element: <EventForm mode="edit" />,
      },
      {
        path: 'events/:eventId/tickets',
        // TicketTypes will extract eventId from useParams for api calls and not eventSlug
        element: <TicketTypes />,
      },
      {
        path: 'events/:eventId/bookings',
        // BookingsView will extract eventId from useParams
        element: <BookingsView />,
      },
      {
        path: 'bookings',
        // All bookings across all events (no eventId needed)
        element: <BookingsView />,
      },
      {
        path: 'co-organizers',
        element: <CoOrganizers />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },

  // Fallback - redirect to dashboard
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);