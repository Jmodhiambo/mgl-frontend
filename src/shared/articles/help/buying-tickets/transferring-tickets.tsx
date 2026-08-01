// src/shared/articles/help/buying-tickets/transferring-tickets.tsx
import React from 'react';
import { Send, ShieldAlert, Info, CheckCircle } from 'lucide-react';

const TransferringTickets: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Bought tickets for a group and need to send individual ones to friends or family? Here's
        how to share tickets safely.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">How to Share a Ticket</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Open "My Tickets" in your account, select the individual ticket you want to share, and
          forward its QR code to the intended attendee — either by sending them the ticket
          image directly or forwarding your confirmation email.
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Each ticket in your order has its own unique QR code, so you can send one without affecting the others</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>The recipient doesn't need an MGLTickets account to use a shared ticket</span>
          </li>
        </ul>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <ShieldAlert className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-medium m-0">A QR code only works once</p>
            <p className="text-red-800 text-sm m-0 mt-1">
              Each ticket can only be scanned in a single time. If you share a QR code with more
              than one person, only whoever arrives first will be admitted — the code is marked
              as used the moment it's scanned.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sharing Safely</h2>
        <p className="text-gray-700 mb-4">
          Only send tickets directly to people you trust and intend to attend with you. Avoid
          posting ticket QR codes publicly, including on social media, since anyone who sees the
          code could use it before your intended recipient does.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Ownership of the original order stays with the account that made the purchase — any
            refund or dispute for a shared ticket is handled through that account.
          </p>
        </div>
      </div>
    </article>
  );
};

export default TransferringTickets;