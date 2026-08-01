// src/shared/articles/help/refunds/refund-processing-times.tsx
import React from 'react';
import { Clock, Smartphone, Info, AlertCircle } from 'lucide-react';

const RefundProcessingTimes: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Once a refund is approved, here's what to expect in terms of timing and where the money
        actually goes.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Review Time</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Automatic refunds, such as for a cancelled event, begin processing immediately.
          Manually reviewed refund requests are typically assessed within a few business days,
          though complex cases can take a little longer.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">M-Pesa Refund Time</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Once a refund is approved and processed on our end, funds are sent back to the M-Pesa
          number used for the original payment. M-Pesa transfers are typically near-instant once
          initiated, though you should allow some time for it to reflect.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800 text-sm m-0">
            Refunds always go back to the original M-Pesa number used for payment — they can't
            be redirected to a different phone number.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Haven't received your refund after a reasonable amount of time? Contact support with
            your order number and we'll check the status for you.
          </p>
        </div>
      </div>
    </article>
  );
};

export default RefundProcessingTimes;