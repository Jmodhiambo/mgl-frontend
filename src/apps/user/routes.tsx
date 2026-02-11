import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@shared/routing/ProtectedRoute';
import PublicRoute from '@shared/routing/PublicRoute';
import ProtectedLayout from '@shared/components/layouts/ProtectedLayout';
import PublicLayout from '@shared/components/layouts/PublicLayout';
import Home from '@user/pages/Home';
import Dashboard from '@user/pages/Dashboard';
import Events from '@user/pages/Events';
import BrowseEvents from '@user/pages/BrowseEvents';
import Checkout from '@user/pages/Checkout';
import MyTickets from '@user/pages/MyTickets';
import Profile from '@user/pages/Profile';
import EventDetails from '@user/pages/EventDetails';
import BrowseEventDetails from '@user/pages/BrowseEventDetails';
import MyEvents from '@user/pages/MyEvents';
import OrganizerProfileSetup from '@user/pages/OrganizerProfileSetup';
import Login from '@user/pages/Login';
import Register from '@user/pages/Register';
import ReactivateAccount from '@user/pages/ReactivateAccount';
import ForgotPassword from '@user/pages/ForgotPassword';
import ResetPassword from '@user/pages/ResetPassword';
import EmailVerification from '@user/pages/EmailVerification';
import AcceptCoOrganizerInvitation from '@user/pages/CoOrganizerInvitation';
import { TermsOfService, PrivacyPolicy, RefundPolicy, AboutUs, ContactPage, FAQPage, OldHelpCenterPage } from '@shared/pages';
import { PressAndMedia, CareersPage, NotFoundPage } from '@shared/pages';
import { helpRoutes } from '@shared/routing/HelpRoutes';

/**
 * Router configuration for MGLTickets
 * 
 * Route Structure:
 * - Standalone auth routes: No layout (login, register, etc.)
 * - PublicLayout routes: All public pages WITH navbar (Home, Events, Legal pages)
 * - ProtectedLayout routes: Authenticated pages with navbar (Dashboard, My Tickets, etc.)
 * 
 * Key Changes:
 * - Consolidated PublicLayout and LegalLayout into single PublicLayout
 * - Home page now uses PublicLayout (navbar provided by layout, not page)
 * - All public pages share consistent navigation experience
 */
export const router = createBrowserRouter([
  // ============================================================================
  // STANDALONE AUTH ROUTES (No layout - full page auth forms)
  // ============================================================================
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/reactivate-account',
    element: <ReactivateAccount />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email',
    element: <EmailVerification />,
  },
  {
    path: '/co-organizer-invitation',
    element: <AcceptCoOrganizerInvitation />,
  },

  // ============================================================================
  // PUBLIC LAYOUT ROUTES (Has navbar + footer, no auth required)
  // ============================================================================
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      // Landing page
      {
        index: true,
        element: (
          <PublicRoute>
            <Home />
          </PublicRoute>
        ),
      },
      // The login page is a bit of an odd case - it has the navbar for easy access navigation since loggout redirects here and the user might want to go home.
      {
      path: 'login',
      element: <Login />,
      },

      // Public event browsing (no auth required)
      {
        path: 'events',
        element: <Events />,
      },
      {
        path: 'events/:eventId',
        element: <EventDetails />,
      },

      // Legal & static pages
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

      // Company pages
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
        path: 'press',
        element: <PressAndMedia />,
      },
      {
        path: 'careers',
        element: <CareersPage />,
      },

      // Help center (old version)
      {
        path: 'help-old',
        element: <OldHelpCenterPage />,
      },

      // Help routes (new version)
      ...helpRoutes,
    ],
  },

  // ============================================================================
  // PROTECTED LAYOUT ROUTES (Has navbar + footer, requires authentication)
  // ============================================================================
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

  // ============================================================================
  // FALLBACK - 404 Page
  // ============================================================================
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);