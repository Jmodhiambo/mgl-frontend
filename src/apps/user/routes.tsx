import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@shared/routing/ProtectedRoute';
import PublicRoute from '@shared/routing/PublicRoute';
import ProtectedLayout from '@shared/components/layouts/ProtectedLayout';
import PublicLayout from '@shared/components/layouts/PublicLayout';
import LegalLayout from '@shared/components/layouts/LegalLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import BrowseEvents from './pages/BrowseEvents';
import Checkout from './pages/Checkout';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import BrowseEventDetails from './pages/BrowseEventDetails';
import MyEvents from './pages/MyEvents';
import OrganizerProfileSetup from './pages/OrganizerProfileSetup';
import Login from './pages/Login';
import Register from './pages/Register';
import { TermsOfService, PrivacyPolicy, RefundPolicy, AboutUs, ContactPage, FAQPage, HelpCenterPage } from '@shared/pages';
import { PressAndMedia, CareersPage, NotFoundPage } from '@shared/pages';
import Test from './pages/Test';

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
  {
    path: '/test',
    element: <Test />,
  },
  
  // Public routes (accessible without authentication - No navbar)
  // Note: We don't use PublicRoute wrapper for events because we want authenticated
  // users to be able to view them too (they just get redirected to browse-events version)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute>
            <Home />
          </PublicRoute>
        ),
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

  // Legal routes (accessible without authentication)
  {
    path: '/',
    element: <LegalLayout />,
    children: [
      {
        path: 'terms',
        element: <TermsOfService />,
      },
      {
        path: 'privacy',
        element: <PrivacyPolicy />,
      },
      {
        path: 'refund',
        element: <RefundPolicy />,
      },
      {
        path: 'about',
        element: <AboutUs />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'faq',
        element: <FAQPage />,
      },
      {
        path: 'help',
        element: <HelpCenterPage />,
      },
      {
        path: 'press',
        element: <PressAndMedia />,
      },
      {
        path: 'careers',
        element: <CareersPage />,
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
        element: <Checkout />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'my-events',
        element: <MyEvents />,
      },
      {
        path: 'setup-organizer-profile',
        element: <OrganizerProfileSetup />,
      },
    ],
  },
  
  // Fallback - redirect to NotFoundPage for any unmatched routes
  {
    path: '*',
    element: <NotFoundPage /> ,
  }
]);