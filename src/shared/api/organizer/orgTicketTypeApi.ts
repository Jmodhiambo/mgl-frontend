/**
 * Organizer Booking API Module
 */

import api from '@shared/api/axiosConfig';
import type { Booking } from '@shared/types/Booking';


// List all bookings for an organizer
export const listBookings = async (eventId: number): Promise<Booking[]> => {
  const response = await api.get(`organizers/me/events/${eventId}/bookings`);
  return response.data;
};

// Get a specific booking by ID for an organizer
export const getBookingById = async (bookingId: number): Promise<Booking> => {
  const response = await api.get(`organizers/me//bookings/${bookingId}`);
  return response.data;
};

// Get bookings by a specific ticket type for an organizer
export const getBookingsByTicketType = async (eventId: number, ticketTypeId: number): Promise<Booking[]> => {
  const response = await api.get(`organizers/me/events/${eventId}/ticket-types/${ticketTypeId}/bookings`);
  return response.data;
};

// Get latest bookings for an event
export const getLatestBookings = async (eventId: number): Promise<Booking[]> => {
  const response = await api.get(`organizers/me/events/${eventId}/latest-bookings`);
  return response.data;
};

// List bookings in date range
export const listBookingsInDateRange = async (eventId: number, startDate: string, endDate: string): Promise<Booking[]> => {
  const response = await api.get(`organizers/me/events/${eventId}/bookings/${startDate}/${endDate}`);
  return response.data;
};