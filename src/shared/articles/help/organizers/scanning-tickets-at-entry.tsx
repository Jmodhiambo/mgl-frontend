// src/shared/articles/help/organizers/scanning-tickets-at-entry.tsx
import React from 'react';
import { ScanLine, Camera, Keyboard, ShieldCheck, Info } from 'lucide-react';

const ScanningTicketsAtEntry: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        MGLTickets includes a built-in check-in tool so you and your team can verify tickets
        quickly and reliably at the door.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Ways to Scan</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Open the check-in page for your event from your organizer dashboard on any phone,
          tablet, or laptop. You can check attendees in three ways:
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <Camera className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
            <span>Scan with your device's camera</span>
          </li>
          <li className="flex items-start gap-2">
            <Keyboard className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
            <span>Enter the ticket code manually if the camera can't read it</span>
          </li>
          <li className="flex items-start gap-2">
            <ScanLine className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
            <span>Use a connected hardware scanner for faster, high-volume entry</span>
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Duplicate Scan Protection</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Each ticket can only be checked in once. If a code is scanned a second time, you'll get
          an immediate alert showing it's already been used — including when and by which
          scanner — so you can catch attempted duplicate entry on the spot.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Multiple Staff, One Event</h2>
        <p className="text-gray-700 mb-4">
          Any number of your team can check attendees in at the same time from different
          devices — scans sync in real time, so there's no risk of two gates both accepting the
          same duplicated ticket.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Test the check-in flow ahead of your event with a sample ticket, and make sure
            whichever devices you'll use have a strong connection at the venue.
          </p>
        </div>
      </div>
    </article>
  );
};

export default ScanningTicketsAtEntry;