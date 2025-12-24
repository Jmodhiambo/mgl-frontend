/**
 * Organizer Booking API Module
 */

import api from '../../auth/axiosConfig';
import type { Booking } from '@shared/types/Booking';

// Create booking
export const createBooking = async (eventId: number, bookingData: any): Promise<Booking> => {
  const response = await api.post(`/events/${eventId}/bookings`, bookingData);
  return response.data;
};

// Update booking
export const updateBooking = async (eventId: number, bookingId: number, bookingData: any): Promise<Booking> => {
  const response = await api.put(`/events/${eventId}/bookings/${bookingId}`, bookingData);
  return response.data;
};