// src/shared/articles/help/buying-tickets/accessing-your-digital-tickets.tsx
import React from 'react';
import { Smartphone, Mail, QrCode, Info } from 'lucide-react';

const AccessingYourDigitalTickets: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Once your payment is confirmed, your tickets are issued instantly. Every ticket is
        entirely digital — there's nothing to print, though you're welcome to if you'd like a
        backup.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">My Tickets</h2>
        </div>
        <p className="text-gray-700 mb-4">
          The fastest way to find your tickets is the "My Tickets" section of your account.
          Every ticket you've ever purchased is listed there, grouped by event, along with its
          individual QR code.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Email Confirmation</h2>
        </div>
        <p className="text-gray-700 mb-4">
          You'll also receive an email confirming your order with your tickets attached. This
          is useful as a backup or if you'd rather forward a specific ticket to someone.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <QrCode className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Your QR Code</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Each individual ticket has its own unique QR code — if you bought three tickets,
          you'll have three separate codes, one per attendee. This is what gets scanned at the
          door, so make sure whoever is attending has access to their specific ticket.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium m-0">No internet at the venue?</p>
            <p className="text-blue-800 text-sm m-0 mt-1">
              Take a screenshot of your QR code before you leave, or download the ticket from
              your email — the code itself doesn't need an internet connection to be scanned.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default AccessingYourDigitalTickets;