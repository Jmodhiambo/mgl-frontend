/**
 * API module for handling event-related operations.
 */

import api from '../axiosConfig';
import type { Event } from "../../types/Event";

// Get all events
export const getAllEvents = async (): Promise<Event[]> => {
    const response = await api.get('/events');
    return response.data;
};

// Get event by ID
export const getEventById = async (eventId: number): Promise<Event> => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
};

// Get latest events
export const getLatestEvents = async (): Promise<Event[]> => {
    const response = await api.get('/events/latest');
    return response.data;
}

// Search events by title
export const searchEventsByTitle = async (title: string): Promise<Event[]> => {
    const response = await api.get('/events/search', { params: { title } });
    return response.data;
}

// Search events by venue
export const searchEventsByVenue = async (venue: string): Promise<Event[]> => {
    const response = await api.get('/events/search', { params: { venue } });
    return response.data;
}

// Search events by country
export const searchEventsByCountry = async (country: string): Promise<Event[]> => {
    const response = await api.get('/events/search', { params: { country } });
    return response.data;
}

// Search events by date
export const searchEventsByDateRange = async (startDate: string, endDate: string): Promise<Event[]> => {
    const response = await api.get('/events/search', { params: { start_date: startDate, end_date: endDate } });
    return response.data;
}

// Get events sorted by start time
export const getEventsByStartTime = async (startTime: string, order: string): Promise<Event[]> => {
    const response = await api.get(`/events/sorted`, { params: { order, start_time: startTime } });
    return response.data;
}

// Get events sorted by end time
export const getEventsByEndTime = async (endTime: string, order: string): Promise<Event[]> => {
    const response = await api.get(`/events/sorted`, { params: { order, end_time: endTime } });
    return response.data;
}

// Get total number of events
export const getTotalEventsCount = async (): Promise<number> => {
    const response = await api.get('/events/count');
    return response.data.count;
};