import { Outlet } from 'react-router-dom';
import Navbar from '@shared/components/navigation/Navbar';
import Footer from '@shared/components/navigation/Footer';

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet /> {/* This renders Dashboard, MyTickets, etc. */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}