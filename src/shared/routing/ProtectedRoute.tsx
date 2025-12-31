/**
 * A route is considered accessible when:
 * - AuthContext.loading === false
 * - AuthContext.isAuthenticated === true
 * 
 * Blocks access while auth state is loading
 * Redirects unauthenticated users
 * Renders children only when authenticated
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;