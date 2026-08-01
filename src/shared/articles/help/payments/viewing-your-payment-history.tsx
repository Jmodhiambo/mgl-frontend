// src/shared/articles/help/payments/viewing-your-payment-history.tsx
import React from 'react';
import { Receipt, Search, Download, Info } from 'lucide-react';

const ViewingYourPaymentHistory: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Every payment you've made on MGLTickets is kept on record in your account, so you can
        always look back at what you paid, when, and for which event.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Where to Find It</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Go to your account and open "Order History" (or "Payment History," depending on where
          you're browsing from). Every order is listed with its date, event, amount, and status.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">What Each Order Shows</h2>
        </div>
        <p className="text-gray-700 mb-4">Clicking into an order gives you the full detail:</p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <Receipt className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
            <span>The event, ticket types, and quantities purchased</span>
          </li>
          <li className="flex items-start gap-2">
            <Receipt className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
            <span>The amount paid and the M-Pesa confirmation code</span>
          </li>
          <li className="flex items-start gap-2">
            <Receipt className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
            <span>The order status — paid, pending, or, if applicable, refunded</span>
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Receipts</h2>
        </div>
        <p className="text-gray-700 mb-4">
          A receipt for each order was also sent to your email at the time of purchase. If you
          need a copy for reimbursement or record-keeping, search your inbox for the order
          confirmation from MGLTickets.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Your payment history stays tied to your account permanently, even for past events,
            so you can always look back at previous purchases.
          </p>
        </div>
      </div>
    </article>
  );
};

export default ViewingYourPaymentHistory;