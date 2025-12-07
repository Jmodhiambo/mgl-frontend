/**
 * Booking Types
 */

export interface Booking {
    id: number;
    user_id: number;
    ticket_type_id: number;
    quantity: number;
    status: string;
    total_price: number
    created_at: string;
    updated_at: string; 
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