// src/shared/layouts/PublicLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@shared/components/navigation/Navbar';
import Footer from '@shared/components/navigation/Footer';

/**
 * PublicLayout
 * 
 * Used for all public-facing pages that don't require authentication:
 * - Home page
 * - Legal pages (Terms, Privacy, Refund Policy)
 * - Static pages (About, Contact, FAQ, Press, Careers)
 * - Public event listing/details pages
 * 
 * Features:
 * - Unified navbar that shows login/signup for guests
 * - If user is logged in, navbar adapts to show authenticated options
 * - Consistent footer across all public pages
 */
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Unified Navigation - adapts based on auth state */}
      <Navbar />

      {/* Main Content - pages render here */}
      <main className="flex-grow max-w-[1400px] w-full mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;