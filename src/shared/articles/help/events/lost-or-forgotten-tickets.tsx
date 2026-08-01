// src/shared/articles/help/events/lost-or-forgotten-tickets.tsx
import React from 'react';
import { Smartphone, Mail, Wifi, Info } from 'lucide-react';

const LostOrForgottenTickets: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Forgot to screenshot your ticket, or can't find the confirmation email? Since your
        tickets are digital, they're never really "lost" — here's how to recover them on event
        day.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Sign In and Check "My Tickets"</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Your fastest option is signing into your MGLTickets account — on your phone or any
          device — and opening "My Tickets." Every ticket you own is listed there with its QR
          code, regardless of whether you saved it anywhere else.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Search Your Email</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Your original order confirmation with your tickets attached was sent to your email at
          purchase. Search your inbox (and spam folder) for "MGLTickets" to find it.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <Wifi className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-900 font-medium m-0">No signal at the venue?</p>
            <p className="text-yellow-800 text-sm m-0 mt-1">
              Try to access your ticket before you arrive, since some venues have limited
              connectivity. A screenshot saved to your phone's gallery works fine and doesn't
              need signal to scan.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Neither Option Works?</h2>
        <p className="text-gray-700 mb-4">
          If you've forgotten your account password too, use "Resetting a Forgotten Password" to
          regain access. If you're genuinely stuck at the venue with no access at all, event
          staff can sometimes look up your order using the name or phone number on the booking —
          check with them directly.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Your tickets are permanently tied to your account, so there's no risk of losing them
            for good — they're always retrievable as long as you can sign in.
          </p>
        </div>
      </div>
    </article>
  );
};

export default LostOrForgottenTickets;