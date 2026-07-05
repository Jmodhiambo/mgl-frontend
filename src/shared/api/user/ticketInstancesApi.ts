// src/shared/api/user/ticketInstancesApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Ticket instance API calls — user and admin scopes.
// Organizer access to ticket instances is intentionally absent
// (see ticket_instances_organizer.py — organizers use bookings instead).
//
// Ticket instances are auto-generated server-side after payment confirmation.
// Users never create them directly — they only read and display them.
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TicketInstanceOut {
  id: number;
  booking_id: number;
  event_id: number;
  ticket_type_id: number;
  user_id: number;
  code: string;              // unique QR/ticket code
  qr_payload: string;        // signed JSON — use this for QR generation
  status: string;            // issued | used | cancelled
  price: number;
  issued_to: string | null;
  created_at: string;
  updated_at: string;
  used_at: string | null;
}

// Enriched shape for MyTickets.tsx — backend join adds event context
export interface TicketInstanceEnriched {
  id: number;
  booking_id: number;
  event_id: number;
  ticket_type_id: number;
  user_id: number;
  code: string;
  qr_payload: string;        // signed JSON — use this for QR generation
  status: 'issued' | 'used' | 'cancelled';
  price: number;
  issued_to: string | null;
  created_at: string;
  updated_at: string;
  used_at: string | null;
  scanned_by: string | null; // name of staff who checked this ticket in (null if unused)
  scan_method: string | null; // qr_scan | manual_code | null if not yet scanned
  // enriched fields
  event_title: string;
  venue: string;
  event_date: string | null; // ISO string of events.start_time, or null
  ticket_type_name: string;
}

export interface TicketInstanceUpdate {
  status?: string;
  issued_to?: string;
  seat_number?: number;
  used_at?: string;
}

// Admin create — code is generated server-side, not passed from frontend
export interface TicketInstanceAdminCreate {
  booking_id: number;
  ticket_type_id: number;
  user_id: number;
  price: number;
  status?: string;
  issued_to?: string;
  seat_number?: number;
}

// ── User ──────────────────────────────────────────────────────────────────────

export const getUserTicketInstances = async (): Promise<TicketInstanceEnriched[]> => {
  return (await api.get('/users/me/ticket-instances')).data;
};

export const getUserTicketInstanceById = async (
  ticketInstanceId: number,
): Promise<TicketInstanceOut> => {
  return (
    await api.get(`/users/me/ticket-instances/${ticketInstanceId}`)
  ).data;
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const admin_listTicketInstances =
  async (): Promise<TicketInstanceOut[]> => {
    return (await api.get('/admin/ticket-instances')).data;
  };

export const admin_getTicketInstanceById = async (
  ticketInstanceId: number,
): Promise<TicketInstanceOut> => {
  return (
    await api.get(`/admin/ticket-instances/${ticketInstanceId}`)
  ).data;
};

export const admin_getTicketInstancesByUser = async (
  userId: number,
): Promise<TicketInstanceOut[]> => {
  return (
    await api.get(`/admin/ticket-instances/users/${userId}`)
  ).data;
};

export const admin_getTicketInstancesByStatus = async (
  status: string,
): Promise<TicketInstanceOut[]> => {
  return (
    await api.get(`/admin/ticket-instances/status/${status}`)
  ).data;
};

export const admin_updateTicketInstance = async (
  ticketInstanceId: number,
  data: TicketInstanceUpdate,
): Promise<TicketInstanceOut> => {
  return (
    await api.put(`/admin/ticket-instances/${ticketInstanceId}`, data)
  ).data;
};

export const admin_deleteTicketInstance = async (
  ticketInstanceId: number,
): Promise<{ detail: string }> => {
  return (
    await api.delete(`/admin/ticket-instances/${ticketInstanceId}`)
  ).data;
};