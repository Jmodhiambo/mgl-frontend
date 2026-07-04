// src/apps/organizer/services/checkInService.ts
import api from '@shared/api/axiosConfig';

export interface CheckInTicketInfo {
  ticket_instance_id: number;
  code: string;
  event_id: number;
  event_title: string;
  ticket_type_name: string;
  holder_name: string | null;
}

export interface CheckInResponse {
  accepted: boolean;
  reason: 'already_used' | 'cancelled' | 'not_found' | 'invalid_signature' | null;
  ticket: CheckInTicketInfo | null;
  first_used_at: string | null;
}

/**
 * Submit a raw scanned QR payload string to the backend for verification
 * and check-in. The backend performs an atomic conditional update so a
 * ticket can never be accepted twice, even under concurrent scans.
 *
 * Backend: POST /organizers/me/check-in
 */
export async function checkInTicket(payload: string): Promise<CheckInResponse> {
  const res = await api.post<CheckInResponse>('/organizers/me/check-in', { payload });
  return res.data;
}