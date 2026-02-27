// src/shared/components/navigation/ImprovedNavbar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { Calendar, Menu, X, LogOut, User, Briefcase, Shield, UserPlus } from 'lucide-react';

const Navbar: React.FC = () => {
  const { logout, user, isAuthenticated } = useAuth();
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

  // Public navigation links (for non-authenticated users)
  const publicNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Browse Events' },  // Unauthenticated route to browse events
    { path: '/about', label: 'About' },
    { path: '/help', label: 'Help Center' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
  ];

  // Authenticated navigation links
  const authenticatedNavLinks = [
    { path: '/browse-events', label: 'Browse Events' },  // Authenticated route to browse events with personalized features
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/my-tickets', label: 'My Tickets' },
    { path: '/my-events', label: 'My Events' },
    { path: '/help', label: 'Help Center' },
  ];

  const navLinks = isAuthenticated ? authenticatedNavLinks : publicNavLinks;

  // Get organizer/admin dashboard URLs from env
  const organizerUrl = import.meta.env.VITE_ORGANIZER_DOMAIN;
  const adminUrl = import.meta.env.VITE_ADMIN_DOMAIN;
  const userUrl = import.meta.env.VITE_USER_DOMAIN;

  return (
    <nav className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-50">
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
            {isAuthenticated ? (
              <>
                {/* Context Switcher - Show if user has organizer or admin role. Offer option tto become an organizer to users */}
                {user?.role === 'user' && (
                  <Link
                    to="/setup-organizer-profile"
                    className="flex items-center space-x-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 font-medium transition-colors text-sm"
                    title="Create an Organizer Profile to manage your events and tickets"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Become an Organizer</span>
                  </Link>
                  
                )}
                
                {user?.role === 'organizer' && (
                  <a
                    href={`${organizerUrl}/dashboard`}
                    className="flex items-center space-x-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 font-medium transition-colors text-sm"
                    title="Switch to Organizer Dashboard"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Organizer Dashboard</span>
                  </a>
                )}

                {user?.role === 'admin' && (
                  <a
                    href={`${adminUrl}/dashboard`}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium transition-colors text-sm"
                    title="Switch to Admin Panel"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </a>
                )}

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
              </>
            ) : (
              <>
                {/* Login/Signup buttons for non-authenticated users */}
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-orange-600 font-medium transition-colors px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
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
                {isAuthenticated ? (
                  <>
                    {/* Context Switcher - Mobile */}
                    {user?.role === 'organizer' && (
                      <a
                        href={`${organizerUrl}/dashboard`}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Organizer Dashboard</span>
                      </a>
                    )}

                    {user?.role === 'admin' && (
                      <a
                        href={`${adminUrl}/dashboard`}
                        className="flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </a>
                    )}

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
                  </>
                ) : (
                  <>
                    {/* Login/Signup for mobile - non-authenticated */}
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center text-gray-600 hover:text-orange-600 font-medium transition-colors py-2 border border-gray-300 rounded-lg"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;