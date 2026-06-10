// src/shared/api/organizer/orgContactApi.ts
//
// Calls POST /organizers/me/contact — requires organizer auth (cookie-based, sent automatically).

import api from '@shared/api/axiosConfig';

export interface OrganizerContactMessageCreate {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  message: string;
  event_title?: string;    // organizer-specific: human-readable title, no lookup needed by admin
  recaptcha_token?: string;
}

export interface ContactMessageOut {
  id: number;
  reference_id: string;
  source: string;               // will always be "organizer" from this endpoint
  event_title?: string | null;  // only populated for organizer messages
  user_id?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  category: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  responded_at?: string | null;
  closed_at?: string | null;
}

export const submitOrganizerContactMessage = async (
  data: OrganizerContactMessageCreate
): Promise<ContactMessageOut> => {
  const response = await api.post<ContactMessageOut>('/organizers/me/contact', data);
  return response.data;
};