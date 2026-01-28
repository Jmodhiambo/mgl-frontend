import { createBrowserRouter, Navigate } from 'react-router-dom';
import OrganizerLayout from '@shared/components/layouts/OrganizerLayout';
import Dashboard from '@organizer/pages/Dashboard';
import EventsList from '@organizer/pages/EventsList';
import EventForm from '@organizer/pages/EventForm';
import EventDetails from '@organizer/pages/EventDetails';
import TicketTypes from '@organizer/pages/TicketTypes';
import BookingsView from '@organizer/pages/BookingsView';
import Profile from '@organizer/pages/Profile';
import CoOrganizers from '@organizer/pages/CoOrganizers';
import ProtectedRoute from '@shared/routing/ProtectedRoute';

/**
 * Router configuration for MGLTickets Organizer Portal
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
        path: 'events/:eventId',
        element: <EventDetails />,
      },
      {
        path: 'events/:eventId/edit',
        // EventForm will extract eventId from useParams
        element: <EventForm mode="edit" />,
      },
      {
        path: 'events/:eventId/tickets',
        // TicketTypes will extract eventId from useParams
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
    element: <Navigate to="/dashboard" replace />,
  },
]);