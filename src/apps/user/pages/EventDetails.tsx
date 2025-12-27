import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '@shared/api/user/eventsApi';
import type { Event } from '@shared/types/Event';

export default function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      try {
        const data = await getEventById(parseInt(eventId));
        setEvent(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Event not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {event.flyer_url && (
          <img
            src={event.flyer_url}
            alt={event.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Date & Time</h3>
              <p className="text-gray-900">
                📅 {new Date(event.start_time).toLocaleDateString()}
              </p>
              <p className="text-gray-900">🕐 {event.end_time}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Location</h3>
              <p className="text-gray-900">📍 {event.venue}</p>
              <p className="text-gray-600">{event.venue}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700">{event.description}</p>
          </div>

          <div className="flex items-center justify-between border-t pt-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">${event.price}</p>
              <p className="text-sm text-gray-600">
                {/* {event.available_tickets} */}
                 Tickets available
              </p>
            </div>
            
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            //   disabled={event.available_tickets === 0}
            >
              Purchase Ticket
              {/* {event.available_tickets === 0 ? 'Sold Out' : 'Purchase Ticket'} */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}