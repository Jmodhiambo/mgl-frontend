import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Search, Heart, Users, ExternalLink, TrendingUp, AlertCircle, X, DollarSign, Ticket, Eye, BarChart3 } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  venue: string;
  start_time: string;
  end_time: string;
  flyer_url: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface OrganizerEvent extends Event {
  total_tickets?: number;
  sold_tickets?: number;
  revenue?: number;
  views?: number;
  bookings?: number;
}

interface EventCounts {
  all: number;
  favorites: number;
  organizing: number;
  coOrganizing: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  organizer_info?: {
    bio?: string;
    organization_name?: string;
    website_url?: string;
    profile_picture_url?: string;
    social_media_links?: string[];
    area_of_expertise?: string[];
  };
}

const MyEventsPage: React.FC = () => {
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [organizingEvents, setOrganizingEvents] = useState<OrganizerEvent[]>([]);
  const [coOrganizingEvents, setCoOrganizingEvents] = useState<OrganizerEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<(Event | OrganizerEvent)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [showOrganizerPrompt, setShowOrganizerPrompt] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<OrganizerEvent | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'organizer' | 'co-organizer' | null>(null);

  useEffect(() => {
    document.title = 'My Events - MGLTickets';
    
    const fetchUserAndEvents = async (): Promise<void> => {
      try {
        // Fetch current user data
        // const userResponse = await fetch('/api/users/me');
        // const userData = await userResponse.json();
        
        const mockUser: User = {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "user",
          // Toggle this to test different scenarios
          organizer_info: {
            bio: "Experienced event organizer",
            organization_name: "MGLTickets Events"
          }
        };
        setUser(mockUser);

        // GET /api/users/me/favorites
        const mockFavorites: Event[] = [
          {
            id: 2,
            title: "Tech Conference 2025",
            description: "Annual technology and innovation conference",
            venue: "KICC, Nairobi",
            start_time: "2025-08-20T09:00:00Z",
            end_time: "2025-08-20T18:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
            status: "upcoming"
          },
          {
            id: 5,
            title: "Charity Marathon 2025",
            description: "Run for a cause",
            venue: "Uhuru Park, Nairobi",
            start_time: "2025-06-05T06:00:00Z",
            end_time: "2025-06-05T12:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400",
            status: "upcoming"
          }
        ];
        setFavoriteEvents(mockFavorites);

        // GET /api/users/me/events/organizing
        const mockOrganizing: OrganizerEvent[] = [
          {
            id: 1,
            title: "Summer Music Festival 2025",
            description: "The biggest music festival of the year",
            venue: "Kasarani Stadium, Nairobi",
            start_time: "2025-07-15T14:00:00Z",
            end_time: "2025-07-15T23:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400",
            status: "upcoming",
            total_tickets: 5000,
            sold_tickets: 3200,
            revenue: 16000000,
            views: 12500,
            bookings: 850
          },
          {
            id: 4,
            title: "Art Gallery Opening",
            description: "Contemporary art exhibition",
            venue: "National Museum, Nairobi",
            start_time: "2024-12-05T18:00:00Z",
            end_time: "2024-12-05T21:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400",
            status: "completed",
            total_tickets: 200,
            sold_tickets: 200,
            revenue: 800000,
            views: 3200,
            bookings: 200
          }
        ];
        setOrganizingEvents(mockOrganizing);

        // GET /api/users/me/events/co-organizing
        const mockCoOrganizing: OrganizerEvent[] = [
          {
            id: 3,
            title: "Food & Wine Expo",
            description: "Culinary excellence showcase",
            venue: "Villa Rosa Kempinski, Nairobi",
            start_time: "2025-09-10T12:00:00Z",
            end_time: "2025-09-10T20:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
            status: "upcoming",
            total_tickets: 1000,
            sold_tickets: 750,
            revenue: 3000000,
            views: 5800,
            bookings: 320
          },
          {
            id: 6,
            title: "Jazz Night Live",
            description: "An evening of smooth jazz",
            venue: "Alliance Française, Nairobi",
            start_time: "2025-07-22T19:00:00Z",
            end_time: "2025-07-22T23:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
            status: "upcoming",
            total_tickets: 300,
            sold_tickets: 180,
            revenue: 900000,
            views: 2100,
            bookings: 85
          }
        ];
        setCoOrganizingEvents(mockCoOrganizing);

        setFilteredEvents([...mockFavorites, ...mockOrganizing, ...mockCoOrganizing]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchUserAndEvents();
  }, []);

  useEffect(() => {
    let filtered: (Event | OrganizerEvent)[] = [];

    if (filterType === 'all') {
      filtered = [...favoriteEvents, ...organizingEvents, ...coOrganizingEvents];
    } else if (filterType === 'favorites') {
      filtered = favoriteEvents;
    } else if (filterType === 'organizing') {
      filtered = organizingEvents;
    } else if (filterType === 'co-organizing') {
      filtered = coOrganizingEvents;
    }

    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [filterType, searchTerm, favoriteEvents, organizingEvents, coOrganizingEvents]);

  const getEventType = (eventId: number): 'favorite' | 'organizer' | 'co-organizer' => {
    if (favoriteEvents.some(e => e.id === eventId)) return 'favorite';
    if (organizingEvents.some(e => e.id === eventId)) return 'organizer';
    return 'co-organizer';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ongoing':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'favorite':
        return <Heart className="w-4 h-4 fill-current" />;
      case 'organizer':
        return <Users className="w-4 h-4" />;
      case 'co-organizer':
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'favorite':
        return 'Favorite';
      case 'organizer':
        return 'Organizer';
      case 'co-organizer':
        return 'Co-Organizer';
      default:
        return '';
    }
  };

  const handleEventClick = (event: Event | OrganizerEvent): void => {
    const eventType = getEventType(event.id);
    
    if (eventType === 'favorite') {
      // Navigate to public event details page
      window.location.href = `/events/${event.id}`;
    } else if (eventType === 'organizer') {
      // User is THE organizer of this event - show stats modal with dashboard access
      setSelectedEvent(event as OrganizerEvent);
      setSelectedEventType('organizer');
    } else if (eventType === 'co-organizer') {
      // User is a co-organizer of this event
      if (!user?.organizer_info) {
        // Co-organizer doesn't have organizer profile - prompt to create one
        setShowOrganizerPrompt(true);
      } else {
        // Co-organizer has organizer profile - show limited stats modal (no dashboard access)
        setSelectedEvent(event as OrganizerEvent);
        setSelectedEventType('co-organizer');
      }
    }
  };

  const handleViewFullDashboard = (): void => {
    if (selectedEvent) {
      // Only organizers (not co-organizers) can access the full dashboard
      window.location.href = `https://organizer.mgltickets.com/events/${selectedEvent.id}`;
    }
  };

  const handleSetupProfile = (): void => {
    window.location.href = '/setup-organizer-profile';
  };

  const eventCounts: EventCounts = {
    all: favoriteEvents.length + organizingEvents.length + coOrganizingEvents.length,
    favorites: favoriteEvents.length,
    organizing: organizingEvents.length,
    coOrganizing: coOrganizingEvents.length
  };

  const isOrganizerEvent = (event: Event | OrganizerEvent): event is OrganizerEvent => {
    return 'total_tickets' in event;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">My Events</h2>
          <p className="text-gray-600">Manage your favorite events and organized events</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            All Events ({eventCounts.all})
          </button>
          <button
            onClick={() => setFilterType('favorites')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filterType === 'favorites'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            Favorites ({eventCounts.favorites})
          </button>
          <button
            onClick={() => setFilterType('organizing')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filterType === 'organizing'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            Organizing ({eventCounts.organizing})
          </button>
          <button
            onClick={() => setFilterType('co-organizing')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filterType === 'co-organizing'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            Co-Organizing ({eventCounts.coOrganizing})
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events by name or venue..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventType = getEventType(event.id);
            const showStats = isOrganizerEvent(event) && (eventType === 'organizer' || eventType === 'co-organizer');
            
            return (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="relative h-48 bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
                  <img
                    src={event.flyer_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200 flex items-center gap-1">
                      {getTypeIcon(eventType)}
                      {getTypeLabel(eventType)}
                    </span>
                  </div>
                  {eventType !== 'favorite' && (
                    <div className="absolute top-4 right-4">
                      <BarChart3 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                      <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </div>

                  {showStats && isOrganizerEvent(event) && event.total_tickets && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Tickets Sold</div>
                          <div className="text-sm font-bold text-gray-800">
                            {event.sold_tickets}/{event.total_tickets}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
                              style={{ width: `${((event.sold_tickets || 0) / event.total_tickets) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Revenue</div>
                          <div className="text-sm font-bold text-orange-600 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            KES {(event.revenue || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your filters or search term'
                : "You haven't saved any favorite events or created any events yet"}
            </p>
            <button 
              onClick={() => window.location.href = '/browse-events'}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Browse Events
            </button>
          </div>
        )}
      </main>

      {/* Event Stats Modal */}
      {selectedEvent && selectedEventType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {selectedEvent.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedEventType === 'organizer' ? 'Event Organizer' : 'Co-Organizer'} • {formatDate(selectedEvent.start_time)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setSelectedEventType(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Event Image */}
              <div className="rounded-xl overflow-hidden mb-6">
                <img
                  src={selectedEvent.flyer_url}
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Event Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                  <span>{formatDate(selectedEvent.start_time)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 text-orange-500" />
                  <span>{formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-orange-500" />
                  <span>{selectedEvent.venue}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Event Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Tickets Sold */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Ticket className="w-5 h-5 text-orange-500" />
                      <span className="text-2xl font-bold text-gray-800">
                        {selectedEvent.sold_tickets}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Tickets Sold</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                        style={{ width: `${((selectedEvent.sold_tickets || 0) / (selectedEvent.total_tickets || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedEvent.total_tickets} total
                    </p>
                  </div>

                  {/* Revenue */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="text-2xl font-bold text-gray-800">
                        {(selectedEvent.revenue || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Revenue (KES)</p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Total earnings
                    </p>
                  </div>

                  {/* Views */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <span className="text-2xl font-bold text-gray-800">
                        {(selectedEvent.views || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Page Views</p>
                    <p className="text-xs text-blue-600 mt-1">Event page visits</p>
                  </div>

                  {/* Bookings */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      <span className="text-2xl font-bold text-gray-800">
                        {(selectedEvent.bookings || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Total Bookings</p>
                    <p className="text-xs text-purple-600 mt-1">Unique purchases</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">About This Event</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedEventType === 'organizer' ? (
                  <>
                    <button
                      onClick={handleViewFullDashboard}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      View Full Dashboard
                    </button>
                  </>
                ) : (
                  <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-800 font-medium mb-1">Co-Organizer Access</p>
                    <p className="text-xs text-blue-600">
                      You have view-only access to basic event statistics. Contact the main organizer for full dashboard access.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organizer Profile Setup Prompt Modal */}
      {showOrganizerPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="space-y-3">
                <button
                  onClick={handleSetupProfile}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Setup Profile Now
                </button>
                <button
                  onClick={() => setShowOrganizerPrompt(false)}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEventsPage;