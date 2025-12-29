import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';

export default function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = (path: string) => {
    const baseClass = "inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors";
    return isActive(path)
      ? `${baseClass} text-blue-600 border-b-2 border-blue-600`
      : `${baseClass} text-gray-900 hover:text-blue-600`;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">MGLTickets</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link to="/my-tickets" className={linkClass("/my-tickets")}>
              My Tickets
            </Link>
            <Link to="/events" className={linkClass("/events")}>
              Browse Events
            </Link>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/profile" className={linkClass("/profile")}>
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}