/**
 * Booking Types
 */

export interface Booking {
  id: number;
  order_id?: number;       // parent order — customer-facing reference
  user_id: number;
  event_id?: number;
  ticket_type_id: number;
  quantity: number;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  event_title?: string;
  ticket_type_name?: string;
  venue?: string;
  event_date?: string;
}

export interface BookingCreate {
    user_id: number;
    ticket_type_id: number;
    quantity: number;
    total_price: number
}

export interface BookingUpdate {
    quantity?: number;
    status?: string
    total_price?: number
}