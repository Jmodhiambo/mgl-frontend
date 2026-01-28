import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Share2, Heart, ChevronLeft, Ticket, AlertCircle } from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import SEO from '@shared/components/SEO';

// Base Url
const baseUrl = import.meta.env.VITE_BASE_URL ?? 'http://localhost:8000';

interface Event {
  id: number;
  title: string;
  slug: string;
  venue: string;
  start_time: string;
  end_time: string;
  flyer_url: string;
  description: string;
  organizer_id: number;
  status: string;
}

interface TicketType {
  id: number;
  event_id: number;
  name: string;
  description: string;
  price: number;
  total_quantity: number;
  quantity_sold: number;
}

interface SelectedTickets {
  [ticketTypeId: number]: number;
}

const BrowseEventDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams<{ eventId: string }>();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<SelectedTickets>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    document.title = event ? `${event.title} - Event Details` : 'Event Details';
    
    fetchEventDetails();
    
    // Restore selected tickets from navigation state if coming from login
    const state = location.state as { selectedTickets?: SelectedTickets; event?: Event };
    if (state?.selectedTickets) {
      setSelectedTickets(state.selectedTickets);
    }
    if (state?.event) {
      setEvent(state.event);
      setLoading(false);
    }
  }, [eventId, location.state]);

  const fetchEventDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const mockEvent: Event = {
        id: parseInt(eventId || '1'),
        title: "Summer Music Festival 2025",
        slug: "summer-music-festival-2025",
        venue: "Kasarani Stadium, Nairobi",
        start_time: "2025-07-15T14:00:00Z",
        end_time: "2025-07-15T23:00:00Z",
        flyer_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200",
        description: "The biggest music festival of the year featuring top artists from across Africa. Get ready for an unforgettable experience with live performances, food vendors, and amazing vibes. This year's lineup includes some of the hottest acts in Afrobeats, Hip Hop, and Reggae. Don't miss out on this incredible celebration of music and culture!",
        organizer_id: 1,
        status: "approved"
      };

      const mockTicketTypes: TicketType[] = [
        {
          id: 1,
          event_id: parseInt(eventId || '1'),
          name: "VIP Pass",
          description: "Front row access, complimentary drinks, exclusive lounge area",
          price: 5000,
          total_quantity: 50,
          quantity_sold: 23
        },
        {
          id: 2,
          event_id: parseInt(eventId || '1'),
          name: "Regular Admission",
          description: "General admission to the festival",
          price: 1500,
          total_quantity: 500,
          quantity_sold: 342
        },
        {
          id: 3,
          event_id: parseInt(eventId || '1'),
          name: "Student Ticket",
          description: "Valid student ID required at entrance",
          price: 1000,
          total_quantity: 200,
          quantity_sold: 156
        },
        {
          id: 4,
          event_id: parseInt(eventId || '1'),
          name: "Early Bird Special",
          description: "Limited time offer - save 30%!",
          price: 1050,
          total_quantity: 100,
          quantity_sold: 98
        }
      ];

      setEvent(mockEvent);
      setTicketTypes(mockTicketTypes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleTicketChange = (ticketTypeId: number, quantity: number): void => {
    setSelectedTickets((prev: SelectedTickets) => {
      if (quantity === 0) {
        const newState = { ...prev };
        delete newState[ticketTypeId];
        return newState;
      }
      return { ...prev, [ticketTypeId]: quantity };
    });
  };

  const calculateTotal = (): number => {
    return Object.entries(selectedTickets).reduce((total: number, [ticketTypeId, quantity]) => {
      const ticket = ticketTypes.find((t: TicketType) => t.id === parseInt(ticketTypeId));
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = (): number => {
    return Object.values(selectedTickets).reduce((sum: number, qty: number) => sum + qty, 0);
  };

  const handleCheckout = (): void => {
    const bookingData = {
      eventId: event?.id,
      tickets: Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
        const ticket = ticketTypes.find(t => t.id === parseInt(ticketTypeId));
        return {
          ticket_type_id: parseInt(ticketTypeId),
          name: ticket?.name || '',
          quantity,
          price: ticket?.price || 0
        };
      }),
      total: calculateTotal()
    };

    navigate('/checkout', { state: { bookingData, event } });
  };

  const handleFavoriteToggle = (): void => {
    setIsFavorite(!isFavorite);
    // TODO: Add API call to save/remove favorite
  };

  const handleShare = (): void => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/browse-events')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const hasSelectedTickets = getTotalTickets() > 0;

  return (
    <>
      {event && (
        <SEO
          title={event.title}
          description={`${event.description.substring(0, 155)}... Get tickets now!`}
          keywords={`${event.title}, ${event.venue}, Kenya events, tickets`}
          ogImage={event.flyer_url}
          ogType="article"
          canonicalUrl={`${baseUrl}/events/${event.slug}`}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/browse-events')}
            className="flex items-center text-gray-600 hover:text-orange-600 transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Events
          </button>

          {/* Event Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Image */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={event.flyer_url}
                  alt={event.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>

            {/* Single Sidebar Card - Event Details on top, Booking Summary below */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 sticky top-20">
                {/* Event Details Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Event Details</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h4>
                      <div className="flex items-center text-orange-600 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="font-medium text-sm">{formatDate(event.start_time)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status, Duration, Event ID */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Available</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-800">9 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event ID:</span>
                      <span className="font-medium text-gray-800">#{event.id}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Summary Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h3>
                  {hasSelectedTickets ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Total ({getTotalTickets()} tickets)</span>
                        <span className="text-2xl font-bold text-orange-600">
                          KES {calculateTotal().toLocaleString()}
                        </span>
                      </div>
                      <button 
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select tickets to continue</p>
                    </div>
                  )}
                </div>

                {/* Need Help Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Have questions about this event? Contact our support team.
                  </p>
                  <button className="w-full border-2 border-orange-500 text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About and Tickets Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-3 space-y-8">
              {/* About Section with Favorite and Share buttons */}
              <div className="bg-white rounded-2xl shadow-md p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">About This Event</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleFavoriteToggle}
                      className={`p-2 rounded-lg transition-colors ${
                        isFavorite 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-orange-50'
                      }`}
                      title="Add to favorites"
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      title="Share event"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Ticket Types */}
              <div className="bg-white rounded-2xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Tickets</h2>
                <div className="space-y-4">
                  {ticketTypes.map((ticket: TicketType) => {
                    const availableTickets: number = ticket.total_quantity - ticket.quantity_sold;
                    const isLowStock: boolean = availableTickets <= 10 && availableTickets > 0;
                    const isSoldOut: boolean = availableTickets <= 0;
                    const selectedQty: number = selectedTickets[ticket.id] || 0;

                    return (
                      <div 
                        key={ticket.id} 
                        className={`border-2 rounded-xl p-6 transition-all ${
                          selectedQty > 0 
                            ? 'border-orange-500 bg-orange-50' 
                            : isSoldOut 
                            ? 'border-gray-200 bg-gray-50 opacity-60' 
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-800">{ticket.name}</h3>
                              {isLowStock && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                  Only {availableTickets} left
                                </span>
                              )}
                              {isSoldOut && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                  Sold Out
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{ticket.quantity_sold} sold / {ticket.total_quantity} available</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-orange-600 mb-2">
                              KES {ticket.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {!isSoldOut && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleTicketChange(ticket.id, Math.max(0, selectedQty - 1))}
                                disabled={selectedQty === 0}
                                className="w-10 h-10 rounded-lg border-2 border-orange-500 text-orange-600 font-bold hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                -
                              </button>
                              <span className="w-12 text-center font-bold text-lg text-gray-800">
                                {selectedQty}
                              </span>
                              <button
                                onClick={() => handleTicketChange(ticket.id, Math.min(availableTickets, selectedQty + 1))}
                                disabled={selectedQty >= availableTickets}
                                className="w-10 h-10 rounded-lg border-2 border-orange-500 bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default BrowseEventDetailsPage;