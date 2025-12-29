import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@shared/routing/ProtectedRoute';
import PublicRoute from '@shared/routing/PublicRoute';
import ProtectedLayout from '@shared/components/layouts/ProtectedLayout';
import PublicLayout from '@shared/components/layouts/PublicLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
// import Events from './pages/Events';
import CheckoutBooking from './pages/CheckoutBooking';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
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
      // {
      //   path: 'events',
      //   element: <Events />,
      // },
      // {
      //   path: 'events/:eventId',
      //   element: <EventDetails />,
      // },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'my-tickets',
        element: <MyTickets />,
      },
      // {
      //   path: 'events',
      //   element: <Events />,
      // },
      {
        path: 'events/:eventId',
        element: <EventDetails />,
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
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);