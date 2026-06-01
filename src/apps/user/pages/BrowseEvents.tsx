// src/apps/user/pages/BrowseEvents.tsx
// Authenticated event listing — shown to logged-in users.

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Search, Filter,
  Ticket, ChevronRight, Heart, TrendingUp,
} from 'lucide-react';
import { EventSEO } from '@shared/components/SEO';
import {
  getApprovedEvents,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '@user/services/eventService';
import type { EventOut, FavoriteOut } from '@shared/types/Event';

type SortKey = 'date-asc' | 'date-desc' | 'title';

const formatEventDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString())
    return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' – ' +
    e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
};

const formatTimeRange = (start: string, end: string): string =>
  new Date(start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) +
  ' – ' +
  new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const sortEvents = (events: EventOut[], key: SortKey): EventOut[] =>
  [...events].sort((a, b) => {
    if (key === 'date-asc')  return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    if (key === 'date-desc') return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    return a.title.localeCompare(b.title);
  });

const BrowseEventsPage: React.FC = () => {
  const navigate = useNavigate();

  const [events, setEvents]               = useState<EventOut[]>([]);
  const [filtered, setFiltered]           = useState<EventOut[]>([]);
  // favoritedIds: Set of event IDs the user has favourited.
  // Derived from FavoriteOut[] on load — no need to store the full records here
  // since BrowseEvents only needs to know which events are hearted.
  const [favoritedIds, setFavoritedIds]   = useState<Set<number>>(new Set());
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [sortBy, setSortBy]               = useState<SortKey>('date-asc');
  const [hoveredId, setHoveredId]         = useState<number | null>(null);
  const [togglingId, setTogglingId]       = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsData, favsData] = await Promise.all([
        getApprovedEvents(),
        // Non-critical — if favourites fail, the page still works,
        // hearts just start unset
        getFavorites().catch((): FavoriteOut[] => []),
      ]);
      setEvents(eventsData);
      setFiltered(sortEvents(eventsData, sortBy));
      // Extract just the event IDs we need for O(1) isFavorite checks
      setFavoritedIds(new Set(favsData.map(f => f.event_id)));
    } catch {
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Browse Events - MGLTickets';
    load();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const base = q
      ? events.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          (e.description ?? '').toLowerCase().includes(q),
        )
      : events;
    setFiltered(sortEvents(base, sortBy));
  }, [searchQuery, sortBy, events]);

  const isFavorite = (eventId: number) => favoritedIds.has(eventId);

  const handleFavoriteToggle = async (ev: React.MouseEvent, eventId: number) => {
    ev.stopPropagation();
    if (togglingId === eventId) return;
    setTogglingId(eventId);
    try {
      if (isFavorite(eventId)) {
        await removeFavorite(eventId);
        setFavoritedIds(prev => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      } else {
        const newFav = await addFavorite(eventId);
        setFavoritedIds(prev => new Set(prev).add(newFav.event_id));
      }
    } catch {
      // silently ignore — state stays consistent with server on next load
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-semibold">{error}</p>
          <button onClick={load} className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <EventSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-800">Browse Events</h2>
            </div>
            <p className="text-gray-600">Discover and book tickets for amazing events</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search events, venues, organizers…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortKey)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="date-asc">Date: Earliest First</option>
                  <option value="date-desc">Date: Latest First</option>
                  <option value="title">Title: A–Z</option>
                </select>
                <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter size={20} />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Ticket size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map(event => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/browse-events/${event.slug}`)}
                  onMouseEnter={() => setHoveredId(event.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.flyer_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      onClick={ev => handleFavoriteToggle(ev, event.id)}
                      disabled={togglingId === event.id}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200
                        ${isFavorite(event.id) ? 'bg-orange-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-orange-50'}
                        ${hoveredId === event.id || isFavorite(event.id) ? 'opacity-100' : 'opacity-0'}
                        disabled:opacity-50`}
                    >
                      <Heart size={18} fill={isFavorite(event.id) ? 'currentColor' : 'none'} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <p className="text-orange-600 font-bold text-sm">
                        {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
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
                      View Details <ChevronRight size={18} />
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