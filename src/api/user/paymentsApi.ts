/**
 * User Payments API Module
 */

import api from '../axiosConfig';
import type { Payment, PaymentCreate, PaymentUpdate } from '../../types/Payment';


// Create a new payment
export const createPayment = async (userId: number, paymentData: PaymentCreate): Promise<Payment> => {
    const response = await api.post(`/users/${userId}/payments`, paymentData);
    return response.data;
}

// Retrieve a payment by ID
export const getPayment = async (userId: number, paymentId: number): Promise<Payment> => {
    const response = await api.get(`/users/${userId}/payments/${paymentId}`);
    return response.data;
}

// Get payments by booking ID
export const getPaymentsByBooking = async (userId: number, bookingId: number): Promise<Payment[]> => {
    const response = await api.get(`/users/${userId}/bookings/${bookingId}/payments`);
    return response.data;
}

// Update a payment by ID
export const updatePayment = async (userId: number, paymentId: number, paymentData: PaymentUpdate): Promise<Payment> => {
    const response = await api.put(`/users/${userId}/payments/${paymentId}`, paymentData);
    return response.data;
}