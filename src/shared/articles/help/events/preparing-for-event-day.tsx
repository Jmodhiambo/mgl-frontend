// src/shared/articles/help/events/preparing-for-event-day.tsx
import React from 'react';
import { CheckSquare, Smartphone, IdCard, Clock, Info } from 'lucide-react';

const PreparingForEventDay: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        A little preparation goes a long way toward a smooth entry. Here's a quick checklist
        before you head out.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 m-0">Have Your Ticket Ready</h3>
          </div>
          <p className="text-sm text-gray-600 m-0">
            Open "My Tickets" in your account or your confirmation email so your QR code is easy
            to pull up at the gate.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <IdCard className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 m-0">Bring Identification</h3>
          </div>
          <p className="text-sm text-gray-600 m-0">
            Some events, especially those with age restrictions or student pricing, may ask for
            ID at entry.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 m-0">Check Doors-Open Time</h3>
          </div>
          <p className="text-sm text-gray-600 m-0">
            This is often earlier than the event start time — check the event page for exact
            entry times.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 m-0">Review Venue Rules</h3>
          </div>
          <p className="text-sm text-gray-600 m-0">
            Check the event description for any prohibited items, dress code, or bag policies
            set by the organizer or venue.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            No signal at the venue? Screenshot your QR code or download your ticket in advance —
            scanning doesn't require an internet connection.
          </p>
        </div>
      </div>
    </article>
  );
};

export default PreparingForEventDay;