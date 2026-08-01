// src/shared/articles/help/refunds/event-cancellation-refunds.tsx
import React from 'react';
import { XCircle, Mail, RefreshCw, Info } from 'lucide-react';

const EventCancellationRefunds: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        When an organizer cancels an event entirely, every ticket holder is protected — here's
        exactly how the refund process works.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Full Refund, No Request Needed</h2>
        </div>
        <p className="text-gray-700 mb-4">
          A cancelled event triggers a full refund for every valid ticket automatically. You
          don't need to submit a refund request — it's initiated on our end as soon as the
          organizer confirms the cancellation.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">You'll Be Notified</h2>
        </div>
        <p className="text-gray-700 mb-4">
          You'll receive an email confirming the cancellation and the refund being processed,
          followed by another once the funds have been sent to your M-Pesa number.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">What's Refunded</h2>
        </div>
        <p className="text-gray-700 mb-4">
          You're refunded the full ticket price you paid. Since MGLTickets doesn't add service
          fees on top of ticket prices, there's nothing deducted from your refund on our side.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Not seen your refund yet? Give it a little time to process, then reach out to
            support with your order number if it still hasn't arrived — see "Refund Processing
            Times" for typical timeframes.
          </p>
        </div>
      </div>
    </article>
  );
};

export default EventCancellationRefunds;