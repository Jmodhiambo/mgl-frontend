import React from 'react';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import Footer from '@shared/components/navigation/Footer';


const LegalLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
    // Simulate page load - adjust timing as needed
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Short delay for smooth transition

    return () => clearTimeout(timer);
  }, []); // Re-run when page changes

  return (
    <div className="min-h-screen flex flex-col">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Minimal Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MGLTickets</span>
            </a>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </a>
              <a
                href="/contact"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all text-sm"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with fade-in animation */}
      <main className={`flex-1 transition-opacity duration-300 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LegalLayout;