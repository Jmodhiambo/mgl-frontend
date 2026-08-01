// src/shared/articles/help/organizers/creating-your-first-event.tsx
import React from 'react';
import { Calendar, Ticket, ImageIcon, CheckCircle, Info } from 'lucide-react';

const CreatingYourFirstEvent: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Ready to host on MGLTickets? Creating an event takes just a few steps from your
        organizer dashboard. Here's the full walkthrough.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Apply for Organizer Access</h2>
        </div>
        <p className="text-gray-700 mb-4">
          If you don't already have organizer access, apply for it from your account dashboard.
          Once approved, you'll get access to the organizer portal, where events are created and
          managed.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Enter Event Details</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <Calendar className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Date, Time & Venue</h3>
            <p className="text-sm text-gray-600">When and where your event is happening</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <ImageIcon className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Cover Image & Description</h3>
            <p className="text-sm text-gray-600">What attendees will see on your event page</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Set Up Ticket Types</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Add one or more ticket types — Regular, VIP, Early Bird, and so on — each with its own
          price and quantity available. See "Setting Up Ticket Types" for a full guide.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            4
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Review and Publish</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Preview your event page exactly as attendees will see it, then publish. Once live, it
          becomes searchable and bookable immediately.
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>You can still edit most details after publishing</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Ticket sales and analytics become available in your dashboard from the moment you publish</span>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Ticket className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium m-0">Commission is locked in at creation</p>
            <p className="text-blue-800 text-sm m-0 mt-1">
              The platform commission rate for your event is set when you create it and won't
              change retroactively, even if rates are updated later.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800 text-sm m-0">
            Once your event has bookings, some changes like deleting it are restricted until
            those bookings are resolved, to protect ticket holders.
          </p>
        </div>
      </div>
    </article>
  );
};

export default CreatingYourFirstEvent;