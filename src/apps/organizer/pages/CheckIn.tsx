// src/apps/organizer/pages/CheckIn.tsx
// Thin wrapper around the shared CheckInPage component.
// Supplies organizer-specific endpoints and the organizer's own events.

import React from 'react';
import CheckInPage from '@shared/pages/CheckIn';
import { getMyEvents } from '@organizer/services/eventService';

const OrganizerCheckIn: React.FC = () => (
  <CheckInPage
    qrEndpoint="/organizers/me/check-in"
    codeEndpoint="/organizers/me/check-in/by-code"
    eventsFetcher={async () => {
      // Fetch events directly — no role guard needed since we're already
      // inside the organizer portal behind require_organizer auth.
      const res = await getMyEvents();
      return res.map(e => ({ id: e.id, title: e.title }));
    }}
    accentClass="bg-blue-600"
  />
);

export default OrganizerCheckIn;