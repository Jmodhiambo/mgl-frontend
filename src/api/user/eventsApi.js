/**
 * API module for handling event-related operations.
 */

import api from '../axiosConfig';

// Get all events
export const getAllEvents = async () => {
    const response = await api.get('/events/');
    return response.data;
};

// Get event by ID
export const getEventById = async (eventId) => {
    const response = await api.get(`/events/${eventId}/`);
    return response.data;
};

// Get latest events
export const getLatestEvents = async () => {
    const response = await api.get('/events/latest/');
    return response.data;
}

// Search events by title
export const searchEventsByTitle = async (title) => {
    const response = await api.get('/events/search/', { params: { title } });
    return response.data;
}

// Search events by venue
export const searchEventsByVenue = async (venue) => {
    const response = await api.get('/events/search/', { params: { venue } });
    return response.data;
}

// Search events by country
export const searchEventsByCountry = async (country) => {
    const response = await api.get('/events/search/', { params: { country } });
    return response.data;
}

// Search events by date
export const searchEventsByDateRange = async (startDate, endDate) => {
    const response = await api.get('/events/search/', { params: { start_date: startDate, end_date: endDate } });
    return response.data;
}

// Get events sorted by start time
export const getEventsByStartTime = async (startTime, order) => {
    const response = await api.get(`/events/sorted/`, { params: { start_time: startTime, order } });
    return response.data;
}

// Get events sorted by end time
export const getEventsByEndTime = async (endTime, order) => {
    const response = await api.get(`/events/sorted/`, { params: { end_time: endTime, order } });
    return response.data;
}

// Get total number of events
export const getTotalEventsCount = async () => {
    const response = await api.get('/events/count/');
    return response.data.count;
};