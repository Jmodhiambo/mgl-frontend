// src/shared/articles/help/refunds/understanding-our-refund-policy.tsx
import React from 'react';
import { FileText, XCircle, CalendarClock, AlertCircle, Info } from 'lucide-react';

const UnderstandingOurRefundPolicy: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Refund eligibility depends mostly on why a refund is needed. Here's a general overview
        of how MGLTickets approaches refunds.
      </p>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-medium m-0">Ticket sales are generally final</p>
            <p className="text-red-800 text-sm m-0 mt-1">
              As a rule, ticket purchases are non-refundable simply for changing your mind.
              Refunds are issued in specific circumstances, outlined below.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Event Cancelled by the Organizer</h2>
        </div>
        <p className="text-gray-700 mb-4">
          If an event is cancelled outright, you're entitled to a full refund. This is processed
          automatically — see "Event Cancellation Refunds" for details.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Event Rescheduled</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Rescheduled events don't automatically qualify for a refund, since your ticket remains
          valid for the new date. Some organizers do offer a refund window for attendees who
          can't make the new date — check the event page or contact the organizer.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Payment or Platform Errors</h2>
        </div>
        <p className="text-gray-700 mb-4">
          If you were charged incorrectly due to a payment processing issue on our end — for
          example, a duplicate charge — you're entitled to a full refund. Contact support with
          your order details and we'll resolve it.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Ready to request one? See "How to Request a Refund" for the exact steps, or "Refund
            Processing Times" to know what to expect once it's submitted.
          </p>
        </div>
      </div>
    </article>
  );
};

export default UnderstandingOurRefundPolicy;