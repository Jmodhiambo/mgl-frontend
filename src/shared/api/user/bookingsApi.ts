/**
 * User Bookings API Module
 */

import api from '../axiosConfig';
import type { Booking, BookingCreate, BookingUpdate } from "@shared/types/Booking";

// Create a new booking
export const createBooking = async (bookingData: BookingCreate): Promise<Booking> => {
    const response = await api.post(`/users/me/bookings`, bookingData);
    return response.data;
}

// List all bookings for a user
export const listBookings = async (): Promise<Booking[]> => {
    const response = await api.get(`/users/me/bookings`);
    return response.data;
}

// Get a specific booking by ID for a user
export const getBookingById = async (bookingId: number): Promise<Booking> => {
    const response = await api.get(`/users/me/bookings/${bookingId}`);
    return response.data;
}

// Update a specific booking by ID for a user
export const updateBooking = async (bookingId: number, bookingData: BookingUpdate): Promise<Booking> => {
    const response = await api.put(`/users/me/bookings/${bookingId}`, bookingData);
    return response.data;
}

// Delete (mark as canceled) a specific booking by ID for a user
export const deleteBooking = async (bookingId: number): Promise<void> => {
    await api.patch(`/users/me/bookings/${bookingId}`);
}

// Get bookings by status for a user
export const getBookingsByStatus = async (status: string): Promise<Booking[]> => {
    const response = await api.get(`/users/me/bookings/status/${status}`);
    return response.data;
}

// Get total number of bookings for a user
export const getTotalBookingsCount = async (): Promise<number> => {
    const response = await api.get(`/users/me/bookings/count`);
    return response.data.count;
};