// src/shared/layouts/ImprovedLegalLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@shared/components/navigation/Navbar';
import Footer from '@shared/components/navigation/Footer';

const ImprovedLegalLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Unified Navbar - same across all public pages */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ImprovedLegalLayout;