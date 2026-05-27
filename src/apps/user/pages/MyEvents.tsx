// src/apps/user/pages/MyEvents.tsx
import React, { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Clock, Search, Heart, Users, ExternalLink,
  TrendingUp, X, DollarSign, Ticket, Eye, BarChart3,
  AlertTriangle, CheckCircle, Lock,
} from 'lucide-react';
import { MyEventsSEO } from '@shared/components/SEO';
import { useOrganizerProfile, FIELD_LABELS } from '@user/hooks/useOrganizerProfile';

interface Event {
  id: number;
  title: string;
  slug: string;
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
  const organizerBaseURL = import.meta.env.VITE_ORGANIZER_DOMAIN;

  // Hook is role-gated internally — only fires for organizers
  const { status: orgStatus, loading: orgLoading } = useOrganizerProfile();
  const profileCompleted = orgStatus?.profile_completed === true;
  const missingFields    = orgStatus?.missing_fields ?? [];

  const [favoriteEvents, setFavoriteEvents]           = useState<Event[]>([]);
  const [organizingEvents, setOrganizingEvents]       = useState<OrganizerEvent[]>([]);
  const [coOrganizingEvents, setCoOrganizingEvents]   = useState<OrganizerEvent[]>([]);
  const [filteredEvents, setFilteredEvents]           = useState<(Event | OrganizerEvent)[]>([]);
  const [loading, setLoading]                         = useState<boolean>(true);
  const [filterType, setFilterType]                   = useState<string>('all');
  const [searchTerm, setSearchTerm]                   = useState<string>('');
  const [user, setUser]                               = useState<User | null>(null);
  const [showOrganizerPrompt, setShowOrganizerPrompt] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent]             = useState<OrganizerEvent | null>(null);
  const [selectedEventType, setSelectedEventType]     = useState<'organizer' | 'co-organizer' | null>(null);

  useEffect(() => {
    document.title = 'My Events - MGLTickets';

    const fetchUserAndEvents = async (): Promise<void> => {
      try {
        // TODO: replace with real API calls
        // const userRes  = await api.get('/users/me');
        // const userData = userRes.data;

        const mockUser: User = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'organizer',
          organizer_info: { bio: '', organization_name: '' },
        };
        setUser(mockUser);

        const mockFavorites: Event[] = [
          {
            id: 2,
            title: 'Tech Conference 2025',
            slug: 'tech-conference-2025',
            description: 'Annual technology and innovation conference',
            venue: 'KICC, Nairobi',
            start_time: '2025-08-20T09:00:00Z',
            end_time: '2025-08-20T18:00:00Z',
            flyer_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
            status: 'upcoming',
          },
          {
            id: 5,
            title: 'Charity Marathon 2025',
            slug: 'charity-marathon-2025',
            description: 'Run for a cause',
            venue: 'Uhuru Park, Nairobi',
            start_time: '2025-06-05T06:00:00Z',
            end_time: '2025-06-05T12:00:00Z',
            flyer_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400',
            status: 'upcoming',
          },
        ];
        setFavoriteEvents(mockFavorites);

        const mockOrganizing: OrganizerEvent[] = [
          {
            id: 1,
            title: 'Summer Music Festival 2025',
            slug: 'summer-music-festival-2025',
            description: 'The biggest music festival of the year',
            venue: 'Kasarani Stadium, Nairobi',
            start_time: '2025-07-15T14:00:00Z',
            end_time: '2025-07-15T23:00:00Z',
            flyer_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
            status: 'upcoming',
            total_tickets: 5000,
            sold_tickets: 3200,
            revenue: 16000000,
            views: 12500,
            bookings: 850,
          },
          {
            id: 4,
            title: 'Art Gallery Opening',
            slug: 'art-gallery-opening',
            description: 'Contemporary art exhibition',
            venue: 'National Museum, Nairobi',
            start_time: '2024-12-05T18:00:00Z',
            end_time: '2024-12-05T21:00:00Z',
            flyer_url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400',
            status: 'completed',
            total_tickets: 200,
            sold_tickets: 200,
            revenue: 800000,
            views: 3200,
            bookings: 200,
          },
        ];
        setOrganizingEvents(mockOrganizing);

        const mockCoOrganizing: OrganizerEvent[] = [
          {
            id: 3,
            title: 'Food & Wine Expo',
            slug: 'food-and-wine-expo',
            description: 'Culinary excellence showcase',
            venue: 'Villa Rosa Kempinski, Nairobi',
            start_time: '2025-09-10T12:00:00Z',
            end_time: '2025-09-10T20:00:00Z',
            flyer_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
            status: 'upcoming',
            total_tickets: 1000,
            sold_tickets: 750,
            revenue: 3000000,
            views: 5800,
            bookings: 320,
          },
          {
            id: 6,
            title: 'Jazz Night Live',
            slug: 'jazz-night-live',
            description: 'An evening of smooth jazz',
            venue: 'Alliance Française, Nairobi',
            start_time: '2025-07-22T19:00:00Z',
            end_time: '2025-07-22T23:00:00Z',
            flyer_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
            status: 'upcoming',
            total_tickets: 300,
            sold_tickets: 180,
            revenue: 900000,
            views: 2100,
            bookings: 85,
          },
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
    let base: (Event | OrganizerEvent)[] = [];
    if (filterType === 'all')              base = [...favoriteEvents, ...organizingEvents, ...coOrganizingEvents];
    else if (filterType === 'favorites')   base = favoriteEvents;
    else if (filterType === 'organizing')  base = organizingEvents;
    else if (filterType === 'co-organizing') base = coOrganizingEvents;

    if (searchTerm) {
      base = base.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredEvents(base);
  }, [filterType, searchTerm, favoriteEvents, organizingEvents, coOrganizingEvents]);

  const getEventType = (id: number): 'favorite' | 'organizer' | 'co-organizer' => {
    if (favoriteEvents.some(e => e.id === id))    return 'favorite';
    if (organizingEvents.some(e => e.id === id))  return 'organizer';
    return 'co-organizer';
  };

  const formatDate = (ds: string): string =>
    new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatTime = (ds: string): string =>
    new Date(ds).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'upcoming':  return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ongoing':   return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default:          return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: string): string => {
    if (type === 'favorite')     return 'Favorite';
    if (type === 'organizer')    return 'Organizer';
    if (type === 'co-organizer') return 'Co-Organizer';
    return '';
  };

  const handleEventClick = (event: Event | OrganizerEvent): void => {
    const eventType = getEventType(event.id);
    if (eventType === 'favorite') {
      window.location.href = `/events/${event.slug}`;
    } else if (eventType === 'organizer') {
      setSelectedEvent(event as OrganizerEvent);
      setSelectedEventType('organizer');
    } else {
      if (!user?.organizer_info) {
        setShowOrganizerPrompt(true);
      } else {
        setSelectedEvent(event as OrganizerEvent);
        setSelectedEventType('co-organizer');
      }
    }
  };

  const handleViewFullDashboard = (): void => {
    if (selectedEvent) window.location.href = `${organizerBaseURL}/events/${selectedEvent.slug}`;
  };

  const handleSetupProfile = (): void => {
    window.location.href = '/setup-organizer-profile';
  };

  const isOrganizerEvent = (e: Event | OrganizerEvent): e is OrganizerEvent => 'total_tickets' in e;

  const eventCounts: EventCounts = {
    all: favoriteEvents.length + organizingEvents.length + coOrganizingEvents.length,
    favorites: favoriteEvents.length,
    organizing: organizingEvents.length,
    coOrganizing: coOrganizingEvents.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <MyEventsSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Incomplete profile banner ──────────────────────────────────────────
               Three conditions must all be true before this renders:
               1. The user is actually an organizer (role check — excludes admins/users)
               2. The /users/me/organizer fetch has finished (orgStatus !== null)
               3. The returned status says the profile is incomplete
               This prevents a false-positive flash for admins or users while the
               hook is in its initial loading state (status = null, profileCompleted = false).
          ── */}
          {user?.role === 'organizer' && orgStatus !== null && !profileCompleted && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Your organizer profile is incomplete</p>
                <p className="text-sm text-red-600 mt-0.5">
                  Complete your profile to unlock the organizer dashboard and start managing events.
                </p>
              </div>
              <button
                onClick={handleSetupProfile}
                className="flex-shrink-0 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Complete Now
              </button>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">My Events</h2>
            <p className="text-gray-600">Manage your favourite events and organised events</p>
          </div>

          {/* Filter tabs */}
          <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex flex-wrap gap-2">
            {[
              { key: 'all',           label: `All Events (${eventCounts.all})` },
              { key: 'favorites',     label: `Favorites (${eventCounts.favorites})` },
              { key: 'organizing',    label: `Organizing (${eventCounts.organizing})` },
              { key: 'co-organizing', label: `Co-Organizing (${eventCounts.coOrganizing})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filterType === tab.key
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by name or venue..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Event grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const eventType = getEventType(event.id);
              const showStats = isOrganizerEvent(event) && eventType !== 'favorite';

              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
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
                        {eventType === 'favorite' ? <Heart className="w-3 h-3 fill-current" /> : <Users className="w-3 h-3" />}
                        {getTypeLabel(eventType)}
                      </span>
                    </div>
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
                        <span>{formatTime(event.start_time)} – {formatTime(event.end_time)}</span>
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
                              />
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
                  : "You haven't saved any favourite events or created any events yet"}
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

        {/* ── Event Stats Modal ── */}
        {selectedEvent && selectedEventType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedEventType === 'organizer' ? 'Event Organizer' : 'Co-Organizer'} · {formatDate(selectedEvent.start_time)}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedEvent(null); setSelectedEventType(null); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Flyer */}
                <div className="rounded-xl overflow-hidden mb-6">
                  <img src={selectedEvent.flyer_url} alt={selectedEvent.title} className="w-full h-64 object-cover" />
                </div>

                {/* Event details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                    <span>{formatDate(selectedEvent.start_time)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-orange-500" />
                    <span>{formatTime(selectedEvent.start_time)} – {formatTime(selectedEvent.end_time)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-orange-500" />
                    <span>{selectedEvent.venue}</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Event Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Ticket className="w-5 h-5 text-orange-500" />
                        <span className="text-2xl font-bold text-gray-800">{selectedEvent.sold_tickets}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">Tickets Sold</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                          style={{ width: `${((selectedEvent.sold_tickets || 0) / (selectedEvent.total_tickets || 1)) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{selectedEvent.total_tickets} total</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <span className="text-2xl font-bold text-gray-800">{(selectedEvent.revenue || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">Revenue (KES)</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Total earnings
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <span className="text-2xl font-bold text-gray-800">{(selectedEvent.views || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">Page Views</p>
                      <p className="text-xs text-blue-600 mt-1">Event page visits</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <span className="text-2xl font-bold text-gray-800">{(selectedEvent.bookings || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">Total Bookings</p>
                      <p className="text-xs text-purple-600 mt-1">Unique purchases</p>
                    </div>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">About This Event</h4>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}

                {/* ── Action area ── */}
                <div className="flex flex-col gap-3">
                  {selectedEventType === 'organizer' ? (
                    profileCompleted ? (
                      // Profile complete: active dashboard link
                      <button
                        onClick={handleViewFullDashboard}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-5 h-5" />
                        View Full Dashboard
                      </button>
                    ) : (
                      // Profile incomplete: locked button + dynamic setup checklist
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        {/* Disabled button */}
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-400 font-medium cursor-not-allowed select-none"
                        >
                          <Lock className="w-4 h-4" />
                          View Full Dashboard
                        </button>

                        {/* Setup nudge with dynamic missing fields from the API */}
                        <div className="bg-amber-50 border-t border-amber-100 px-5 py-4">
                          <div className="flex items-start gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-semibold text-amber-800">
                              Complete your organizer profile to unlock the dashboard
                            </p>
                          </div>

                          {/* Checklist — driven by missing_fields from /users/me/organizer */}
                          <ul className="space-y-2 mb-4">
                            {Object.entries(FIELD_LABELS).map(([key, label]) => {
                              const isMissing = missingFields.includes(key);
                              return (
                                <li key={key} className="flex items-center gap-2 text-sm">
                                  <CheckCircle
                                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                                      isMissing ? 'text-amber-300' : 'text-green-500'
                                    }`}
                                  />
                                  <span className={isMissing ? 'text-amber-700' : 'text-gray-400 line-through'}>
                                    {label}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>

                          <button
                            onClick={handleSetupProfile}
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm"
                          >
                            Set Up Profile Now
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    // Co-organizer: view-only notice
                    <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
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

        {/* ── Organizer Profile Setup Prompt Modal (co-organizer without profile) ── */}
        {showOrganizerPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Set Up Your Organizer Profile</h3>
                <p className="text-sm text-gray-500">
                  You need an organizer profile to view event statistics and manage events.
                </p>
              </div>
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
        )}
      </div>
    </>
  );
};

export default MyEventsPage;