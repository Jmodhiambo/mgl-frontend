/**
 * Organizer Booking API Module
 */

import api from '../axiosConfig';
import type { Booking } from '../../types/Booking';

// Create booking
export const createBooking = async (eventId: number, bookingData: any): Promise<Booking> => {
  const response = await api.post(`/events/${eventId}/bookings`, bookingData);
  return response.data;
};