// src/shared/articles/help/events/rescheduled-events.tsx
import React from 'react';
import { CalendarClock, Mail, Ticket, Info } from 'lucide-react';

const RescheduledEvents: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Sometimes an organizer needs to move an event to a new date rather than cancel it
        entirely. Here's what that means for your ticket.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">You'll Be Notified of the New Date</h2>
        </div>
        <p className="text-gray-700 mb-4">
          As soon as an organizer updates an event's date, every ticket holder is notified by
          email with the new date and time. The event page is also updated so anyone checking it
          later sees accurate information.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Ticket className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Your Ticket Stays Valid</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Unlike a cancellation, a rescheduled event doesn't require you to do anything — your
          existing ticket and QR code remain valid for the new date automatically. There's no
          need to rebook.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Can't Make the New Date?</h2>
        </div>
        <p className="text-gray-700 mb-4">
          If the new date doesn't work for you, check the event page or your confirmation email
          for the organizer's specific policy on rescheduled events — many organizers offer a
          refund window in this situation. You can also contact the organizer directly, or
          reach out to MGLTickets support if you're not sure what applies.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Refund eligibility for rescheduled events can vary by organizer — see "Understanding
            Our Refund Policy" for the general rules that apply platform-wide.
          </p>
        </div>
      </div>
    </article>
  );
};

export default RescheduledEvents;