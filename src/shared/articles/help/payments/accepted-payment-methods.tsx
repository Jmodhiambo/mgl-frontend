// src/shared/articles/help/payments/accepted-payment-methods.tsx
import React from 'react';
import { Smartphone, CreditCard, Info, CheckCircle } from 'lucide-react';

const AcceptedPaymentMethods: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        MGLTickets is built around fast, secure checkout for Kenyan event-goers. Here's what
        payment method you can use today, and what's coming next.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">M-Pesa</h2>
        </div>
        <p className="text-gray-700 mb-4">
          M-Pesa is currently the only payment method accepted on MGLTickets. Every purchase is
          made using an STK push sent directly to your phone — you confirm the exact amount with
          your M-Pesa PIN and your tickets are issued as soon as the payment is confirmed.
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>No card details to type in, no third-party redirect</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>All amounts are shown in Kenyan Shillings (KES)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Works with any Safaricom line registered for M-Pesa</span>
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Card Payments</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Card payments (Visa, Mastercard, and similar) are not yet supported. We're working on
          adding this as an additional option — this article will be updated as soon as it's
          available.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Want a walkthrough of the M-Pesa checkout flow itself? See "How to Pay with M-Pesa"
            for a full step-by-step guide.
          </p>
        </div>
      </div>
    </article>
  );
};

export default AcceptedPaymentMethods;