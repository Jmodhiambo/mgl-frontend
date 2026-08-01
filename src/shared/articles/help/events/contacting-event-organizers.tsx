// src/shared/articles/help/events/contacting-event-organizers.tsx
import React from 'react';
import { MessageCircle, User, Info, AlertCircle } from 'lucide-react';

const ContactingEventOrganizers: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        For questions specific to an event itself — lineup details, venue access, what to
        bring — the organizer is usually your best point of contact.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Find the Organizer's Profile</h2>
        </div>
        <p className="text-gray-700 mb-4">
          On any event page, click the organizer's name to view their profile. This shows other
          events they've listed and, where the organizer has made it available, their contact
          details.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">What to Ask the Organizer</h2>
        </div>
        <ul className="space-y-2 mb-6 text-gray-700">
          <li>• Event-specific details not covered on the event page</li>
          <li>• Accessibility or special accommodation requests</li>
          <li>• Venue-specific rules or restrictions</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-900 font-medium m-0">Payment issues go to MGLTickets, not the organizer</p>
            <p className="text-yellow-800 text-sm m-0 mt-1">
              Payment failures, refund requests tied to platform issues, and account problems
              should go through MGLTickets support rather than the event organizer, since
              payments are processed by MGLTickets directly.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Not sure whether your question is for the organizer or MGLTickets support? Reach out
            to support first — we'll point you in the right direction.
          </p>
        </div>
      </div>
    </article>
  );
};

export default ContactingEventOrganizers;