import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { Calendar, Menu, X, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const linkClass = (path: string): string => {
    const baseClass = "font-medium transition-colors";
    return isActive(path)
      ? `${baseClass} text-orange-600`
      : `${baseClass} text-gray-600 hover:text-orange-600`;
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { path: '/browse-events', label: 'Browse Events' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/my-tickets', label: 'My Tickets' },
    { path: '/my-events', label: 'My Events' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-orange-100 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-orange-600">
                MGLTickets
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={linkClass(link.path)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${linkClass(link.path)} py-2`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-medium transition-colors py-2"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-medium transition-colors py-2 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}