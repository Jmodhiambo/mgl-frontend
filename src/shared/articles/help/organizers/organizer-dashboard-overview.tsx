// src/shared/articles/help/organizers/organizer-dashboard-overview.tsx
import React from 'react';
import { LayoutDashboard, Calendar, BarChart3, Wallet, Info } from 'lucide-react';

const OrganizerDashboardOverview: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Your organizer dashboard is command central for everything related to hosting events on
        MGLTickets. Here's a tour of what you'll find.
      </p>

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-5">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">My Events</h3>
            <p className="text-sm text-gray-600 m-0">
              Every event you've created, whether upcoming, live, or past, with quick access to
              edit each one.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-5">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Sales & Analytics</h3>
            <p className="text-sm text-gray-600 m-0">
              Revenue, bookings, and ticket-type breakdowns per event, updated as sales come in.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-5">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Check-In</h3>
            <p className="text-sm text-gray-600 m-0">
              The scanning tool for verifying tickets at your event's entrance — see "Scanning
              Tickets at Entry" for a full guide.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-5">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Organizer Profile</h3>
            <p className="text-sm text-gray-600 m-0">
              Your public-facing organizer information, shown on every event you host.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            New to organizing? Start with "Creating Your First Event" for a step-by-step guide
            to setting up your very first listing.
          </p>
        </div>
      </div>
    </article>
  );
};

export default OrganizerDashboardOverview;