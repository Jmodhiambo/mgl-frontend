// src/shared/articles/help/events/what-if-my-event-is-cancelled.tsx
import React from 'react';
import { XCircle, Mail, RefreshCw, Info } from 'lucide-react';

const WhatIfMyEventIsCancelled: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Event cancellations are rare, but if one happens, here's exactly what you can expect as
        a ticket holder.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">You'll Be Notified First</h2>
        </div>
        <p className="text-gray-700 mb-4">
          If an event you hold a ticket for is cancelled, you'll receive an email (and SMS,
          where applicable) as soon as the organizer confirms the cancellation. The event page
          itself will also be updated to reflect the cancelled status.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Automatic Refunds</h2>
        </div>
        <p className="text-gray-700 mb-4">
          For a full event cancellation, you don't need to request anything — a refund for your
          ticket is automatically processed back to the M-Pesa number used for the original
          payment.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">If You Don't Receive a Refund</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Refunds for cancelled events are handled promptly, but if it's been a while and you
          haven't seen anything on your M-Pesa statement, contact support with your order number
          and we'll look into it right away.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Looking for how postponed (not cancelled) events are handled? See "Rescheduled
            Events" — the process is a little different since your ticket usually stays valid.
          </p>
        </div>
      </div>
    </article>
  );
};

export default WhatIfMyEventIsCancelled;