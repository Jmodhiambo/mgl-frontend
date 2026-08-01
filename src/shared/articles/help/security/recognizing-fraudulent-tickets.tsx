// src/shared/articles/help/security/recognizing-fraudulent-tickets.tsx
import React from 'react';
import { QrCode, ShieldAlert, XCircle, Info } from 'lucide-react';

const RecognizingFraudulentTickets: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        The safest way to guarantee a valid ticket is to buy it directly through MGLTickets.
        Here's how to spot the warning signs of a fake or resold ticket bought elsewhere.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Warning Signs</h2>
        </div>
        <ul className="space-y-2 mb-6 text-gray-700">
          <li>• A "ticket" sent as a screenshot or PDF instead of access through your own MGLTickets account</li>
          <li>• Being asked to pay outside the official MGLTickets checkout, such as directly to a personal M-Pesa number</li>
          <li>• Prices significantly below the official ticket price for a popular, high-demand event</li>
          <li>• Sellers on social media claiming to have "extra" tickets for a sold-out event</li>
        </ul>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <QrCode className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Why Reselling Is Risky</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Since each QR code can only be scanned once, a ticket that's already been used —
          intentionally or by someone else claiming the same code — simply won't work at entry.
          There's no way to verify a screenshot passed between strangers is still valid.
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <XCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-medium m-0">The safest option is always official channels</p>
            <p className="text-red-800 text-sm m-0 mt-1">
              Buy tickets directly through the MGLTickets website or app. If you legitimately
              need to transfer a ticket, use the built-in sharing feature described in
              "Transferring Tickets to Others."
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Bought a ticket outside MGLTickets and suspect it's fraudulent? Report it to us so
            we can look into the seller and warn other attendees.
          </p>
        </div>
      </div>
    </article>
  );
};

export default RecognizingFraudulentTickets;