// src/shared/articles/help/refunds/partial-refunds-and-fees.tsx
import React from 'react';
import { Percent, Info, AlertCircle } from 'lucide-react';

const PartialRefundsAndFees: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Not every refund situation results in getting back the full amount you paid. Here's when
        a partial refund might apply.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Percent className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">When Partial Refunds Apply</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Some organizers set their own cancellation or refund terms for specific events — for
          example, a partial refund if you cancel within a certain window before the event.
          Where this applies, it's stated on the event page or in the organizer's own refund
          terms.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Never Deducted</h2>
        <p className="text-gray-700 mb-4">
          MGLTickets doesn't charge service fees on top of ticket prices, so there's nothing on
          our end to deduct from a refund. Any deduction you see comes from the organizer's own
          stated policy for that event, not from MGLTickets.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800 text-sm m-0">
            Always check an event's specific refund terms before purchasing if you think you
            might need to cancel — these can vary from one organizer to another.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Unsure whether a partial refund applies to your situation? Submit a refund request
            and our team will assess it against the specific event's terms.
          </p>
        </div>
      </div>
    </article>
  );
};

export default PartialRefundsAndFees;