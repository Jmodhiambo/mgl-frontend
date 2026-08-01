// src/shared/articles/help/organizers/managing-event-sales.tsx
import React from 'react';
import { BarChart3, Users, Receipt, Info } from 'lucide-react';

const ManagingEventSales: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Your organizer dashboard gives you a live view of how each event is performing, so you
        always know where sales stand.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Sales Overview</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Each event shows total confirmed bookings, revenue, and remaining ticket availability
          per type, updated in real time as orders come in.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Attendee List</h2>
        </div>
        <p className="text-gray-700 mb-4">
          View everyone who's booked, broken down by ticket type. This is useful for
          coordinating with your venue on expected numbers ahead of the event.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Orders and Bookings</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Every order for your event, along with its payment status, is visible from your
          dashboard. Bookings marked "confirmed" reflect completed, paid purchases — this is the
          number your sales totals are based on.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Sales figures reflect confirmed, paid bookings only — pending or failed payments
            aren't counted until they're successfully completed.
          </p>
        </div>
      </div>
    </article>
  );
};

export default ManagingEventSales;