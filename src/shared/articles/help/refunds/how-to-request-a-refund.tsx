// src/shared/articles/help/refunds/how-to-request-a-refund.tsx
import React from 'react';
import { FileText, Send, CheckCircle, Info } from 'lucide-react';

const HowToRequestARefund: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        If your situation qualifies under our refund policy, here's how to submit a request.
      </p>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Steps to Request a Refund</h2>
        <ol className="space-y-3 mb-6 text-gray-700">
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">1.</span>
            <span>Go to "Order History" in your account and open the relevant order</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">2.</span>
            <span>Select "Request Refund" and choose the reason that applies</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">3.</span>
            <span>Add any relevant details or supporting information</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">4.</span>
            <span>Submit — you'll receive a confirmation email once it's been received</span>
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">What Happens Next</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Our team reviews each request against the refund policy for that specific event and
          circumstance. You'll be notified by email once a decision has been made, along with
          next steps if it's approved.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            For automatic refunds — like a full event cancellation — you don't need to submit a
            request at all. This flow is for cases where a manual review is needed.
          </p>
        </div>
      </div>
    </article>
  );
};

export default HowToRequestARefund;