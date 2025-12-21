/**
 * A route is considered accessible when:
 * - AuthContext.loading === false
 * - AuthContext.isAuthenticated === true
 * 
 * Blocks access while auth state is loading
 * Redirects unauthenticated users
 * Renders children only when authenticated
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;