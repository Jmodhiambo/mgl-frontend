/**
 * User Payments API Module
 */

import api from '../axiosConfig';
import type { Payment, PaymentCreate, PaymentUpdate } from '@shared/types/Payment';

// Create a new payment
export const createPayment = async (paymentData: PaymentCreate): Promise<Payment> => {
    const response = await api.post(`/users/me/payments`, paymentData);
    return response.data;
}

// Retrieve a payment by ID
export const getPayment = async (paymentId: number): Promise<Payment> => {
    const response = await api.get(`/users/me/payments/${paymentId}`);
    return response.data;
}

// Update a payment by ID
export const updatePayment = async (paymentId: number, paymentData: PaymentUpdate): Promise<Payment> => {
    const response = await api.put(`/users/me/payments/${paymentId}`, paymentData);
    return response.data;
}

// Get payments by booking ID
export const getPaymentsByBooking = async (bookingId: number): Promise<Payment[]> => {
    const response = await api.get(`/users/me/bookings/${bookingId}/payments`);
    return response.data;
}