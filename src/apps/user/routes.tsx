import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@shared/routing/ProtectedRoute';
import UserLayout from '@shared/components/layouts/UserLayout';
import Dashboard from './pages/Dashboard';
// import MyTickets from './pages/MyTickets';
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
      <ProtectedRoute>
        <UserLayout />  // UserLayout is a higher-order component
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
    //   {
    //     path: 'my-tickets',
    //     element: <MyTickets />,
    //   },
      {
        path: 'events/:eventId',
        element: <EventDetails />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  }
]);