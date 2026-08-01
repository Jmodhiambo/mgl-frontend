// src/shared/articles/help/buying-tickets/troubleshooting-missing-tickets.tsx
import React from 'react';
import { AlertCircle, Clock, MessageSquareText, CheckCircle, Info } from 'lucide-react';

const TroubleshootingMissingTickets: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        In the vast majority of cases, tickets are issued within seconds of a successful M-Pesa
        payment. If you paid but haven't received your tickets, here's what to check and how to
        resolve it.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">First, Give It a Moment</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Ticket issuance normally happens automatically the instant M-Pesa confirms your
          payment. Occasionally, confirmation from Safaricom can be delayed by a few minutes —
          your order page will keep checking in the background, so it's worth waiting a short
          while before assuming something's wrong.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <MessageSquareText className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Report Your M-Pesa Code</h2>
        </div>
        <p className="text-gray-700 mb-4">
          If your money was deducted but your order still shows as unpaid after a few minutes,
          you'll see an option to report your M-Pesa confirmation code directly from the order
          status screen. Submitting this lets our team match your payment to your order even if
          the automatic confirmation didn't go through.
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Find your M-Pesa confirmation SMS from Safaricom</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Copy the transaction code (it looks something like QGH7XXXX21)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Paste it into the confirmation code field on your order's status screen</span>
          </li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800 text-sm m-0">
            Reporting a code doesn't issue your tickets immediately — it flags your order for
            verification. Once confirmed, your tickets are issued the same way as any other
            successful payment.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Nothing?</h2>
        <p className="text-gray-700 mb-4">
          If you've reported your confirmation code and still don't see your tickets, or if you
          weren't able to report a code at all, reach out to support with:
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Your order number or the event name and date</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Your M-Pesa confirmation SMS or transaction code</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>The phone number the payment was made from</span>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Your money is never at risk during this process. If a payment genuinely can't be
            matched to an order, it's refunded rather than kept.
          </p>
        </div>
      </div>
    </article>
  );
};

export default TroubleshootingMissingTickets;