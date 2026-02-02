import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { Calendar, LayoutDashboard, Ticket, Users, User, LogOut, Menu, X, ChevronRight } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const OrganizerLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userAppUrl = import.meta.env.VITE_USER_DOMAIN || 'http://localhost:3000';

  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
    { path: '/bookings', label: 'Bookings', icon: <Ticket className="w-5 h-5" /> },
    { path: '/co-organizers', label: 'Co-Organizers', icon: <Users className="w-5 h-5" /> },
    { path: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      window.location.href = userAppUrl; // Redirect to main site after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-orange-100 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors lg:hidden"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <Link to="/organizer/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-bold text-orange-600">MGLTickets</span>
                  <span className="block text-xs text-gray-500 -mt-1">Organizer Portal</span>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Context Switcher - Browse Events */}
              <a
                href={import.meta.env.VITE_USER_DOMAIN}
                className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 font-medium transition-colors text-sm"
                title="Browse Events as User"
              >
                <Calendar className="w-4 h-4" />
                <span>Browse Events</span>
              </a>
              
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">John Organizer</p>
                  <p className="text-xs text-gray-500">Organizer</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="text-center">
            <p className="text-sm font-semibold text-orange-800 mb-1">Need Help?</p>
            <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OrganizerLayout;