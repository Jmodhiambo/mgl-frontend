/**
 * Ticket Instance Types
 */

export interface TicketInstance {
  id: number;
  booking_id: number;
  ticket_type_id: number;
  user_id: number;
  code: string;
  status: string;
  issued_to?: string;
  seat_number?: number;
  created_at: string;
  updated_at: string;
  used_at?: string;
}

export interface TicketInstanceCreate {
  booking_id: number;
  ticket_type_id: number;
  user_id: number;
  status: string;
  issued_to?: string;
  seat_number?: number;
}

export interface TicketInstanceUpdate {
  status?: string;
  issued_to?: string;
  seat_number?: string;
  used_at?: string;
}