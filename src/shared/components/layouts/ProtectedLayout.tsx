// src/shared/layouts/ProtectedLayout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from '@shared/components/navigation/Navbar';
import Footer from '@shared/components/navigation/Footer';

/**
 * ProtectedLayout
 * 
 * Used for all authenticated pages that require login:
 * - Dashboard
 * - My Tickets
 * - My Events
 * - Profile
 * - Checkout
 * - Browse Events (authenticated version)
 * 
 * Features:
 * - Same unified navbar (but shows authenticated state)
 * - Requires authentication (enforced by ProtectedRoute wrapper in routes)
 * - Consistent footer
 */
const ProtectedLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Unified Navigation - shows authenticated state */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow max-w-[1400px] w-full mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet /> {/* This renders Dashboard, MyTickets, etc. */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ProtectedLayout;