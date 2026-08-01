// src/shared/articles/help/buying-tickets/selecting-ticket-types.tsx
import React from 'react';
import { Ticket, Users, Info, AlertCircle } from 'lucide-react';

const SelectingTicketTypes: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Most events on MGLTickets offer more than one ticket type, each at a different price
        and with different perks. Picking the right one — and the right quantity — makes sure
        you get the experience (and the price) you're after.
      </p>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Ticket Types</h2>
        <p className="text-gray-700 mb-4">
          Ticket types vary by event, but you'll commonly see:
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="font-semibold text-orange-600 min-w-[90px]">VIP:</span>
              <span className="text-gray-700">Premium seating or standing area, exclusive access, sometimes complimentary drinks or a meet-and-greet</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-semibold text-orange-600 min-w-[90px]">Regular:</span>
              <span className="text-gray-700">Standard admission to the event</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-semibold text-orange-600 min-w-[90px]">Early Bird:</span>
              <span className="text-gray-700">Discounted pricing available only until a set date or until they sell out</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-semibold text-orange-600 min-w-[90px]">Student:</span>
              <span className="text-gray-700">Discounted tickets, sometimes requiring ID verification at entry</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-semibold text-orange-600 min-w-[90px]">Group:</span>
              <span className="text-gray-700">Bundled pricing for a set number of attendees, offered by some organizers</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Ticket className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Reading Ticket Descriptions</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Each ticket type includes a short description from the organizer explaining exactly
          what it includes. Always read this before buying — "VIP" can mean different things at
          different events, from reserved seating to full backstage access.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Choosing a Quantity</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Use the quantity selector next to each ticket type to choose how many you need. You
          can mix ticket types in a single order — for example, two VIP and three Regular
          tickets for the same event — and they'll all appear in one checkout.
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800 text-sm m-0">
              Some organizers set a maximum number of tickets per order to keep events fair and
              prevent bulk resale. If you hit this limit, you'll see a notice on the ticket
              selector.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium m-0">Each ticket is unique</p>
            <p className="text-blue-800 text-sm m-0 mt-1">
              Whatever quantity you buy, every individual ticket gets its own QR code, so a
              group of five tickets means five separate scannable entries.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default SelectingTicketTypes;