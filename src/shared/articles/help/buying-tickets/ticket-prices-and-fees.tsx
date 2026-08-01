// src/shared/articles/help/buying-tickets/ticket-prices-and-fees.tsx
import React from 'react';
import { Tag, Receipt, Info, CheckCircle } from 'lucide-react';

const TicketPricesAndFees: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Understanding exactly what you're paying for helps you budget for an event with no
        surprises at checkout. Here's how ticket pricing works on MGLTickets.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Ticket Price</h2>
        </div>
        <p className="text-gray-700 mb-4">
          The price shown on each ticket type is set by the event organizer, not by
          MGLTickets. Different ticket tiers (VIP, Regular, Early Bird, and so on) are priced
          independently by the organizer based on what each includes.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">What You See at Checkout</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Your order summary breaks down exactly what you're paying for before you confirm:
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>The price and quantity of each ticket type in your cart</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>The subtotal for your order</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>The final total charged via M-Pesa</span>
          </li>
        </ul>
        <p className="text-gray-700 mb-4">
          MGLTickets does not add any processing or service fees on top of the organizer's
          ticket price. The amount shown at checkout is the amount you'll be asked to confirm
          on the M-Pesa STK push prompt.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium m-0">Safaricom charges are separate</p>
            <p className="text-blue-800 text-sm m-0 mt-1">
              Safaricom's standard M-Pesa transaction charges may still apply depending on your
              transaction tier — these are charged by Safaricom directly, not by MGLTickets, and
              are not included in the ticket price shown at checkout.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TicketPricesAndFees;