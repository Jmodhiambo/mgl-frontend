import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { APP_TYPE } from '@shared/config/app.config';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Always redirect to user app login
    if (APP_TYPE !== 'user') {
      const userDomain = import.meta.env.VITE_USER_DOMAIN;
      window.location.href = `${userDomain}/login?redirect=${encodeURIComponent(window.location.href)}`;
      return null;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role;

  if (APP_TYPE === 'organizer' && userRole !== 'organizer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Organizer Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need an organizer account to access this area.
          </p>
          <a
            href={import.meta.env.VITE_USER_DOMAIN}
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Go to Main Site
          </a>
        </div>
      </div>
    );
  }

  if (APP_TYPE === 'admin' && userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need administrator privileges to access this area.
          </p>
          <a
            href={import.meta.env.VITE_USER_DOMAIN}
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Go to Main Site
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;