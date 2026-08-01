// src/shared/articles/help/events/using-your-qr-code-at-entry.tsx
import React from 'react';
import { QrCode, ScanLine, AlertCircle, Info } from 'lucide-react';

const UsingYourQrCodeAtEntry: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Every ticket on MGLTickets is verified through a unique QR code. Here's how it works at
        the door.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <QrCode className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Each Ticket Has Its Own Code</h2>
        </div>
        <p className="text-gray-700 mb-4">
          If you bought multiple tickets, each one has its own individual QR code — one per
          attendee. Make sure everyone in your group has their own ticket pulled up, not just
          one shared screen.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">What Happens at the Gate</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Event staff scan your QR code with a phone camera or handheld scanner. Once scanned,
          your ticket is marked as used and you're checked in — the whole process usually takes
          a couple of seconds.
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-medium m-0">A code only works once</p>
            <p className="text-red-800 text-sm m-0 mt-1">
              Once a QR code is scanned, it can't be scanned again. If you shared your ticket
              with someone else, only whichever of you arrives first will be admitted.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">If Scanning Fails</h2>
        <p className="text-gray-700 mb-4">
          If your code won't scan — poor lighting, a cracked screen, or low brightness are the
          usual culprits — event staff can also check you in manually using the code printed
          beneath the QR image.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Turn your screen brightness up before you reach the gate — it makes a real
            difference to scan speed in bright daylight or a dark venue.
          </p>
        </div>
      </div>
    </article>
  );
};

export default UsingYourQrCodeAtEntry;