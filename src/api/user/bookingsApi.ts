/**
 * Bookings API Module
 */

import api from '../axiosConfig';
import type { Booking, BookingCreate, BookingUpdate } from "../../types/Booking";

// Create a new booking
export const createBooking = async (userId: number, bookingData: BookingCreate): Promise<Booking> => {
    const response = await api.post(`/users/${userId}/bookings`, bookingData);
    return response.data;
}

// List all bookings for a user
export const listBookings = async (userId: number): Promise<Booking[]> => {
    const response = await api.get(`/users/${userId}/bookings`);
    return response.data;
}

// Get a specific booking by ID for a user
export const getBookingById = async (userId: number, bookingId: number): Promise<Booking> => {
    const response = await api.get(`/users/${userId}/bookings/${bookingId}`);
    return response.data;
}

// Update a specific booking by ID for a user
export const updateBooking = async (userId: number, bookingId: number, bookingData: BookingUpdate): Promise<Booking> => {
    const response = await api.put(`/users/${userId}/bookings/${bookingId}`, bookingData);
    return response.data;
}

// Delete (mark as canceled) a specific booking by ID for a user
export const deleteBooking = async (userId: number, bookingId: number): Promise<void> => {
    await api.patch(`/users/${userId}/bookings/${bookingId}`);
}

// Get bookings by status for a user
export const getBookingsByStatus = async (userId: number, status: string): Promise<Booking[]> => {
    const response = await api.get(`/users/${userId}/bookings/status/${status}`);
    return response.data;
}

// Get total number of bookings for a user
export const getTotalBookingsCount = async (userId: number): Promise<number> => {
    const response = await api.get(`/users/${userId}/bookings/count`);
    return response.data.count;
};