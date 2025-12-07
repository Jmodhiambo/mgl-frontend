/**
 * Payment Types
 */

export type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer' | 'mpesa';

export interface Payment {
    id: number;
    booking_id: number;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: 'pending' | 'completed' | 'failed';
    mpesa_ref: string;
    callback_payload?: string;
    created_at: string;
    updated_at: string;
}

export interface PaymentCreate {
    booking_id: number;
    amount: number;
    currency: string;
    method: PaymentMethod;
    mpesa_ref: string;
    callback_payload?: string;
}

export interface PaymentUpdate {
    amount?: number;
    currency?: string;
    method?: PaymentMethod;
    status?: 'pending' | 'completed' | 'failed';
    mpesa_ref?: string;
    callback_payload?: string;
}