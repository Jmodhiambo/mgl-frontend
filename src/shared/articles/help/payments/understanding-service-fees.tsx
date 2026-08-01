// src/shared/articles/help/payments/understanding-service-fees.tsx
import React from 'react';
import { Tag, Smartphone, CheckCircle, Info } from 'lucide-react';

const UnderstandingServiceFees: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Nobody likes hidden charges at checkout. Here's a clear breakdown of what MGLTickets
        charges — and what it doesn't.
      </p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-8 h-8 text-green-700 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-green-900 m-0 mb-2">
              MGLTickets Charges No Service Fees
            </h3>
            <p className="text-green-800 text-sm m-0">
              The price shown on a ticket type is exactly what you pay to MGLTickets. There's no
              additional booking fee, service charge, or markup added at checkout.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Who Sets Ticket Prices</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Ticket prices are set entirely by the event organizer. MGLTickets takes a commission
          from the organizer's side of each sale — this doesn't affect the price you pay as a
          buyer, since the commission rate is locked in when the organizer creates the event, not
          added on top for you.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">M-Pesa Transaction Charges</h2>
        </div>
        <p className="text-gray-700 mb-4">
          The one cost outside our control is Safaricom's own M-Pesa transaction charge, which
          varies by amount and your transaction tier. This is charged by Safaricom directly as
          part of sending the STK push payment, not by MGLTickets, and isn't included in the
          ticket price shown at checkout.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            You can check Safaricom's current M-Pesa transaction charges on the Safaricom
            website or by dialing *234# if you'd like to know the exact amount before paying.
          </p>
        </div>
      </div>
    </article>
  );
};

export default UnderstandingServiceFees;