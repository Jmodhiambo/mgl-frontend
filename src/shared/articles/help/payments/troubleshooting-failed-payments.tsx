// src/shared/articles/help/payments/troubleshooting-failed-payments.tsx
import React from 'react';
import { XCircle, RefreshCw, AlertCircle, Info, MessageSquareText } from 'lucide-react';

const TroubleshootingFailedPayments: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Most M-Pesa payments go through smoothly, but occasionally something interrupts the
        process. Here's how to identify and fix the most common issues.
      </p>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="font-bold text-gray-900 mb-2">STK push never arrived</h3>
          <p className="text-gray-700 text-sm mb-2">
            If no prompt shows up on your phone within 30 seconds:
          </p>
          <ul className="text-gray-700 text-sm space-y-1 ml-4">
            <li>• Check your phone has signal and isn't in airplane mode</li>
            <li>• Double-check the phone number you entered at checkout</li>
            <li>• Go back to your order and request the push again</li>
            <li>• Dial *234# to confirm your line is registered for M-Pesa</li>
          </ul>
        </div>

        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="font-bold text-gray-900 mb-2">Payment cancelled or timed out</h3>
          <p className="text-gray-700 text-sm">
            The STK prompt expires after 60 seconds. If you didn't respond in time, or pressed
            cancel by mistake, simply return to your order and try again — you won't be charged
            for a payment that timed out or was cancelled.
          </p>
        </div>

        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="font-bold text-gray-900 mb-2">Insufficient balance</h3>
          <p className="text-gray-700 text-sm">
            Your M-Pesa account needs to cover the full ticket amount. Top up and try the
            payment again — your ticket selection is held for a short window so you shouldn't
            need to start over.
          </p>
        </div>

        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="font-bold text-gray-900 mb-2">Order stuck on "processing"</h3>
          <p className="text-gray-700 text-sm mb-2">
            If your order sits on a processing or pending screen for longer than expected:
          </p>
          <ul className="text-gray-700 text-sm space-y-1 ml-4">
            <li>• We automatically re-check the payment status with Safaricom in the background</li>
            <li>• If your money was actually deducted, you can report your M-Pesa confirmation code from the order screen</li>
            <li>• Avoid closing the tab or retrying payment while it's still checking, to prevent duplicate charges</li>
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Trying Again</h2>
        </div>
        <p className="text-gray-700 mb-4">
          After a failed or cancelled payment, you can retry from the same order without
          re-selecting your tickets, as long as they're still within their hold window. If the
          hold has expired, you'll need to reselect your tickets in case availability has
          changed.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800 text-sm m-0">
            A failed or cancelled STK push never results in a charge. If you ever see a
            deduction on your M-Pesa statement for an order marked as failed, report your
            confirmation code and we'll investigate right away.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <MessageSquareText className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Still stuck? Contact support with your order number and, if you have one, your
            M-Pesa confirmation code — we'll sort it out from there.
          </p>
        </div>
      </div>
    </article>
  );
};

export default TroubleshootingFailedPayments;