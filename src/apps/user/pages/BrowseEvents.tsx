import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Search, Filter, Ticket, ChevronRight, Heart, TrendingUp } from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { EventSEO } from '@shared/components/SEO';

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  venue: string;
  start_time: string;
  end_time: string;
  flyer_url: string;
  status: string;
  organizer_id: number;
  created_at: string;
  updated_at: string;
}

interface Favorite {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
}

const BrowseEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date-asc');
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Browse Events - MGLTickets';
    loadEvents();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchQuery, sortBy]);

  const loadEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/events', {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      // });
      // const data = await response.json();
      // setEvents(data);
      
      const mockEvents: Event[] = [
        {
          id: 1,
          title: "Summer Music Festival 2025",
          slug: "summer-music-festival-2025",
          description: "The biggest music festival of the year featuring top artists from across Africa. Experience live performances, food vendors, and amazing vibes!",
          venue: "Kasarani Stadium, Nairobi",
          start_time: "2025-07-15T14:00:00Z",
          end_time: "2025-07-15T23:00:00Z",
          flyer_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
          status: "approved",
          organizer_id: 1,
          created_at: "2024-12-01T10:00:00Z",
          updated_at: "2024-12-01T10:00:00Z"
        },
        {
          id: 2,
          title: "Tech Innovation Summit",
          slug: "tech-innovation-summit",
          description: "Discover the latest in technology and innovation with keynote speakers and interactive workshops.",
          venue: "KICC Nairobi",
          start_time: "2025-01-20T09:00:00Z",
          end_time: "2025-01-20T17:00:00Z",
          flyer_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
          status: "approved",
          organizer_id: 2,
          created_at: "2024-12-05T10:00:00Z",
          updated_at: "2024-12-05T10:00:00Z"
        },
        {
          id: 3,
          title: "Food & Wine Expo",
          slug: "food-and-wine-expo",
          description: "Experience culinary delights from renowned chefs and premium wine selections from around the world.",
          venue: "Sarit Centre",
          start_time: "2025-02-05T12:00:00Z",
          end_time: "2025-02-05T20:00:00Z",
          flyer_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
          status: "approved",
          organizer_id: 3,
          created_at: "2024-12-10T10:00:00Z",
          updated_at: "2024-12-10T10:00:00Z"
        },
        {
          id: 4,
          title: "Comedy Night Extravaganza",
          slug: "comedy-night-extravaganza",
          description: "Laugh out loud with Kenya's best comedians in one epic night of entertainment.",
          venue: "Alliance Française",
          start_time: "2025-01-25T19:00:00Z",
          end_time: "2025-01-25T22:00:00Z",
          flyer_url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
          status: "approved",
          organizer_id: 4,
          created_at: "2024-12-15T10:00:00Z",
          updated_at: "2024-12-15T10:00:00Z"
        },
        {
          id: 5,
          title: "Art Exhibition: Contemporary Africa",
          slug: "art-exhibition-contemporary-africa",
          description: "Explore stunning contemporary art from emerging African artists in this exclusive exhibition.",
          venue: "Nairobi National Museum",
          start_time: "2025-02-10T10:00:00Z",
          end_time: "2025-02-10T18:00:00Z",
          flyer_url: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800",
          status: "approved",
          organizer_id: 5,
          created_at: "2024-12-20T10:00:00Z",
          updated_at: "2024-12-20T10:00:00Z"
        },
        {
          id: 6,
          title: "Marathon for Charity",
          slug: "marathon-for-charity",
          description: "Run for a cause! Join thousands in this charity marathon supporting local communities.",
          venue: "Uhuru Park",
          start_time: "2025-02-15T06:00:00Z",
          end_time: "2025-02-15T12:00:00Z",
          flyer_url: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800",
          status: "approved",
          organizer_id: 6,
          created_at: "2024-12-22T10:00:00Z",
          updated_at: "2024-12-22T10:00:00Z"
        }
      ];
      
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async (): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      const mockFavorites: Favorite[] = [
        { id: 1, user_id: 1, event_id: 1, created_at: "2024-12-20T10:00:00Z" },
        { id: 2, user_id: 1, event_id: 3, created_at: "2024-12-21T10:00:00Z" }
      ];
      
      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const isFavorite = (eventId: number): boolean => {
    return favorites.some(fav => fav.event_id === eventId);
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, eventId: number): Promise<void> => {
    e.stopPropagation();

    try {
      const favoriteId = favorites.find(fav => fav.event_id === eventId)?.id;
      
      if (favoriteId) {
        // TODO: API call to remove favorite
        setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      } else {
        // TODO: API call to add favorite
        const newFavorite: Favorite = {
          id: Math.max(...favorites.map(f => f.id), 0) + 1,
          user_id: 1,
          event_id: eventId,
          created_at: new Date().toISOString()
        };
        setFavorites([...favorites, newFavorite]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const filterAndSortEvents = (): void => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        case 'date-desc':
          return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
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

  const formatEventDateRange = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startDate = start.toDateString();
    const endDate = end.toDateString();
    
    // Same day event
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    // Multi-day event
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  };

  const formatTimeRange = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startTimeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    return `${startTimeStr} - ${endTimeStr}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <EventSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-800">Browse Events</h2>
            </div>
            <p className="text-gray-600">Discover and book tickets for amazing events</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search events, venues, organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="date-asc">Date: Earliest First</option>
                  <option value="date-desc">Date: Latest First</option>
                  <option value="title">Title: A-Z</option>
                </select>

                <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter size={20} />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Ticket size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/browse-events/${event.slug}`)}
                  onMouseEnter={() => setHoveredEventId(event.id)}
                  onMouseLeave={() => setHoveredEventId(null)}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.flyer_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleFavoriteToggle(e, event.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                        isFavorite(event.id)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-orange-50'
                      } ${hoveredEventId === event.id || isFavorite(event.id) ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <Heart size={18} fill={isFavorite(event.id) ? 'currentColor' : 'none'} />
                    </button>

                    {/* Date Badge */}
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <p className="text-orange-600 font-bold text-sm">
                        {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                        <span className="font-medium">{formatEventDateRange(event.start_time, event.end_time)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                        <span>{formatTimeRange(event.start_time, event.end_time)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-md">
                      View Details
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default BrowseEventsPage;