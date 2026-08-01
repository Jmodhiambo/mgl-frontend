// src/shared/articles/help/getting-started/understanding-event-pages.tsx
import React from 'react';
import { Calendar, MapPin, Ticket, Info, User, ShieldCheck } from 'lucide-react';

const UnderstandingEventPages: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Every event on MGLTickets has its own page with everything you need to decide whether
        to attend and, if so, which tickets to buy. Here's what each section tells you.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 m-0">Date & Time</h3>
          </div>
          <p className="text-sm text-gray-600 m-0">
            The event's start date and time, plus doors-open time when the organizer has set one.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 m-0">Venue</h3>
          </div>
          <p className="text-sm text-gray-600 m-0">
            The venue name and address, often with a map link and any parking or access notes.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 m-0">Ticket Types</h3>
          </div>
          <p className="text-sm text-gray-600 m-0">
            Every ticket tier the organizer offers — Regular, VIP, Early Bird, and so on — with
            its own price and description.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 m-0">Organizer</h3>
          </div>
          <p className="text-sm text-gray-600 m-0">
            Who's hosting the event. Click through to see their profile and other events they've
            listed.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability</h2>
        <p className="text-gray-700 mb-4">
          Each ticket type shows how many are left when supply is running low, so you can see at
          a glance whether a tier is close to selling out. If a tier is fully sold, it will be
          shown as unavailable rather than removed, so you can still see what was offered.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Description</h2>
        <p className="text-gray-700 mb-4">
          The organizer's own description of the event — what to expect, lineup or agenda
          details, age restrictions, and anything else attendees should know before buying.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium m-0">All events are verified</p>
            <p className="text-blue-800 text-sm m-0 mt-1">
              Only registered organizers can list events on MGLTickets, and every listing is
              tied to a real, accountable organizer profile.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800 text-sm m-0">
            If an event is later cancelled or rescheduled, its page will be updated and you'll
            be notified by email if you hold a ticket.
          </p>
        </div>
      </div>
    </article>
  );
};

export default UnderstandingEventPages;