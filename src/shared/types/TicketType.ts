/**
 * Ticket Type Interface
 */

export interface TicketType {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  price: number;
  quantity_available: number;
  created_at: string;
  updated_at: string;
}

export interface TicketTypeCreate {
  event_id: number;
  name: string;
  description?: string;
  price: number;
  quantity_available: number;
}

export interface TicketTypeUpdate {
  name?: string;
  description?: string;
  price?: number;
  quantity_available?: number;
}