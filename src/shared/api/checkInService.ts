// src/shared/api/checkInService.ts
import api from '@shared/api/axiosConfig';

export interface CheckInTicketInfo {
  ticket_instance_id: number;
  code: string;
  event_id: number;
  event_title: string;
  ticket_type_name: string;
  holder_name: string | null;
  scanned_by: string | null;
  scan_method: string | null;  // qr_scan | manual_code
}

export interface CheckInResponse {
  accepted: boolean;
  reason: 'already_used' | 'cancelled' | 'not_found' | 'invalid_signature' | 'wrong_event' | null;
  ticket: CheckInTicketInfo | null;
  first_used_at: string | null;
}

/**
 * QR payload check-in. event_id is required for admin, optional for organizer.
 * Backend: POST /organizers/me/check-in  or  POST /admin/check-in
 */
export async function checkInByQr(
  payload: string,
  eventId: number,
  endpoint: string,
): Promise<CheckInResponse> {
  const res = await api.post<CheckInResponse>(endpoint, {
    payload,
    event_id: eventId,
  });
  return res.data;
}

/**
 * Manual code fallback. event_id always required to scope the lookup.
 * Backend: POST /organizers/me/check-in/by-code  or  POST /admin/check-in/by-code
 */
export async function checkInByCode(
  code: string,
  eventId: number,
  endpoint: string,
): Promise<CheckInResponse> {
  const res = await api.post<CheckInResponse>(endpoint, {
    code,
    event_id: eventId,
  });
  return res.data;
}