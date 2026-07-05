// src/apps/admin/pages/CheckIn.tsx
// Thin wrapper around the shared CheckInPage component.
// Supplies admin-specific endpoints and the full platform event list.

import React from 'react';
import CheckInPage from '@shared/pages/CheckIn';
import { listAllEvents } from '@admin/services/adminService';

const AdminCheckIn: React.FC = () => (
  <CheckInPage
    qrEndpoint="/admin/check-in"
    codeEndpoint="/admin/check-in/by-code"
    eventsFetcher={async () => {
      // GET /admin/all-events returns AdminEventOut[] — full platform list
      // scoped to approved events so the dropdown isn't polluted with
      // pending/draft events that have no issued tickets yet.
      const res = await listAllEvents();
      return res
        .filter(e => e.status === 'upcoming' || e.status === 'ongoing') // Would have added (|| e.status === 'completed') but that would allow scanning tickets for past events, which is not desired.
        .map(e => ({ id: e.id, title: e.title }));
    }}
    accentClass="bg-purple-700"
  />
);

export default AdminCheckIn;