// src/shared/articles/help/organizers/setting-up-ticket-types.tsx
import React from 'react';
import { Ticket, Layers, Hash, Info, AlertCircle } from 'lucide-react';

const SettingUpTicketTypes: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Ticket types are how you offer different price points and access levels for your event.
        Here's how to configure them well.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Ticket className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Adding a Ticket Type</h2>
        </div>
        <p className="text-gray-700 mb-4">
          From your event's setup page, click "Add Ticket Type" and fill in a name, price, and
          description of what it includes. You can add as many types as your event needs — VIP,
          Regular, Early Bird, Student, and so on.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Hash className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Setting Quantity and Limits</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Each ticket type has its own available quantity — set this based on your venue
          capacity or how many of that tier you want to offer. You can also set a maximum
          purchase limit per order to prevent bulk buying.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Writing Good Descriptions</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Be specific about what each tier includes — seating, access areas, complimentary
          items, and any restrictions. Clear descriptions reduce confusion at checkout and
          fewer support questions on event day.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800 text-sm m-0">
            Once a ticket type has sales, avoid changing its price — existing buyers already
            paid the original amount, and inconsistent pricing can lead to confusion or disputes.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            You can add a new ticket type after publishing an event, or increase quantity on an
            existing one, without affecting tickets already sold.
          </p>
        </div>
      </div>
    </article>
  );
};

export default SettingUpTicketTypes;