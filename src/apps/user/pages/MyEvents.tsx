// src/apps/user/pages/MyEvents.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, MapPin, Clock, Search, Heart, Users, ExternalLink,
  TrendingUp, X, DollarSign, Ticket, Eye, BarChart3,
  AlertTriangle, CheckCircle, Lock, RefreshCw, UserCheck,
} from 'lucide-react';
import { MyEventsSEO } from '@shared/components/SEO';
import { useAuth } from '@shared/contexts/AuthContext';
import { useOrganizerProfile, FIELD_LABELS } from '@user/hooks/useOrganizerProfile';
import {
  getFavorites,
  getMyOrganizerEvents,
  getCoOrganizingEvents,
  removeFavorite,
} from '@user/services/eventService';

import type { EventOut, OrganizerEventOut, FavoriteWithEventOut } from '@shared/types/Event';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Mirrors the backend CoOrganizerWithEvent schema.
 *
 * A co-organizer is NOT a role — any user (user / organizer / admin) can be
 * invited as a co-organizer for an event. The relationship record carries the
 * invite metadata alongside the full event object.
 *
 * Backend: GET /users/me/events/co-organizing → list[CoOrganizerWithEvent]
 */
interface CoOrganizerWithEvent {
  co_organizer_id:     number;   // CoOrganizer.id (the join-table row)
  invited_by:          number;   // user_id of whoever sent the invite
  create_co_organizer: boolean;  // may this co-organizer further invite others?
  created_at:          string;   // ISO — when the co-organizer relationship was created
  event:               OrganizerEventOut;
}

type AnyEvent = EventOut | OrganizerEventOut;

type FilterTab = 'all' | 'favorites' | 'organizing' | 'co-organizing';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const isOrganizerEvent = (e: AnyEvent): e is OrganizerEventOut =>
  'total_bookings' in e;

// ─── Component ────────────────────────────────────────────────────────────────

const MyEventsPage: React.FC = () => {
  const organizerBaseURL = import.meta.env.VITE_ORGANIZER_DOMAIN;
  const { user } = useAuth();

  // Organizer profile completion status — hook is role-gated internally
  const { status: orgStatus } = useOrganizerProfile();
  const profileCompleted = orgStatus?.profile_completed === true;
  const missingFields    = orgStatus?.missing_fields ?? [];

  // ── Data state ─────────────────────────────────────────────────────────────
  const [favoriteEvents, setFavoriteEvents]         = useState<EventOut[]>([]);
  const [organizingEvents, setOrganizingEvents]     = useState<OrganizerEventOut[]>([]);
  const [coOrganizingEvents, setCoOrganizingEvents] = useState<CoOrganizerWithEvent[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState<string | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [filterType, setFilterType]                   = useState<FilterTab>('all');
  const [searchTerm, setSearchTerm]                   = useState('');
  const [filteredEvents, setFilteredEvents]           = useState<AnyEvent[]>([]);
  const [showOrganizerPrompt, setShowOrganizerPrompt] = useState(false);

  // selectedEvent carries the OrganizerEventOut for the stats modal
  const [selectedEvent, setSelectedEvent]         = useState<OrganizerEventOut | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'organizer' | 'co-organizer' | null>(null);
  // selectedCoOrg carries the full CoOrganizerWithEvent when the modal is for a co-organizer event
  const [selectedCoOrg, setSelectedCoOrg]         = useState<CoOrganizerWithEvent | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [favData, orgEvents, coOrgData] = await Promise.allSettled([
        // Favorites: returns FavoriteWithEventOut[] — each has an embedded event
        getFavorites(),
        getMyOrganizerEvents(user?.role),
        getCoOrganizingEvents(),
      ]);

      // Map FavoriteWithEventOut[] → EventOut[]
      let favEvents: EventOut[] = [];
      if (favData.status === 'fulfilled') {
        favEvents = (favData.value as FavoriteWithEventOut[]).map(f => f.event);
      }

      const orgEventsData  = orgEvents.status  === 'fulfilled' ? orgEvents.value  : [];
      const coOrgEventsData = coOrgData.status === 'fulfilled' ? coOrgData.value  : [];

      setFavoriteEvents(favEvents);
      setOrganizingEvents(orgEventsData);
      setCoOrganizingEvents(coOrgEventsData);
    } catch {
      setError('Failed to load your events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    document.title = 'My Events - MGLTickets';
    load();
  }, [load]);

  // ── Filter + search ────────────────────────────────────────────────────────
  useEffect(() => {
    // For co-organizer events, flatten to the embedded event for filtering
    const coOrgFlat = coOrganizingEvents.map(c => c.event);

    let base: AnyEvent[] = [];
    if (filterType === 'all')            base = [...favoriteEvents, ...organizingEvents, ...coOrgFlat];
    else if (filterType === 'favorites')     base = favoriteEvents;
    else if (filterType === 'organizing')    base = organizingEvents;
    else if (filterType === 'co-organizing') base = coOrgFlat;

    const q = searchTerm.toLowerCase();
    if (q) {
      base = base.filter(
        e => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q),
      );
    }
    setFilteredEvents(base);
  }, [filterType, searchTerm, favoriteEvents, organizingEvents, coOrganizingEvents]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getEventTab = (id: number): FilterTab => {
    if (favoriteEvents.some(e => e.id === id))              return 'favorites';
    if (organizingEvents.some(e => e.id === id))            return 'organizing';
    if (coOrganizingEvents.some(c => c.event.id === id))    return 'co-organizing';
    return 'favorites';
  };

  const getStatusColor = (status: string) => {
    const m: Record<string, string> = {
      upcoming:  'bg-blue-100 text-blue-700 border-blue-200',
      ongoing:   'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return m[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleRemoveFavorite = async (eventId: number) => {
    try {
      await removeFavorite(eventId);
      setFavoriteEvents(p => p.filter(e => e.id !== eventId));
    } catch { /* silently ignore */ }
  };

  const handleEventClick = (event: AnyEvent) => {
    const tab = getEventTab(event.id);
    if (tab === 'favorites') {
      window.location.href = `/browse-events/${event.slug}`;
      return;
    }
    if (tab === 'co-organizing') {
      // Co-organizer: any role — look up the full CoOrganizerWithEvent record
      const coOrg = coOrganizingEvents.find(c => c.event.id === event.id) ?? null;
      setSelectedCoOrg(coOrg);
      setSelectedEvent(event as OrganizerEventOut);
      setSelectedEventType('co-organizer');
      return;
    }
    // organizing
    if (!user?.role || user.role !== 'organizer') {
      setShowOrganizerPrompt(true);
      return;
    }
    setSelectedCoOrg(null);
    setSelectedEvent(event as OrganizerEventOut);
    setSelectedEventType('organizer');
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setSelectedEventType(null);
    setSelectedCoOrg(null);
  };

  const counts = {
    all:          favoriteEvents.length + organizingEvents.length + coOrganizingEvents.length,
    favorites:    favoriteEvents.length,
    organizing:   organizingEvents.length,
    coOrganizing: coOrganizingEvents.length,
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <MyEventsSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Incomplete organizer profile banner */}
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
                onClick={() => window.location.href = '/setup-organizer-profile'}
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
            {(
              [
                { key: 'all',           label: `All Events (${counts.all})`             },
                { key: 'favorites',     label: `Favorites (${counts.favorites})`         },
                { key: 'organizing',    label: `Organizing (${counts.organizing})`        },
                { key: 'co-organizing', label: `Co-Organizing (${counts.coOrganizing})`  },
              ] as { key: FilterTab; label: string }[]
            ).map(tab => (
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
                placeholder="Search events by name or venue…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Event grid */}
          {filteredEvents.length === 0 ? (
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
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => {
                const tab       = getEventTab(event.id);
                const showStats = isOrganizerEvent(event) && tab !== 'favorites';
                const isFav     = tab === 'favorites';
                const isCoOrg   = tab === 'co-organizing';
                const coOrg     = isCoOrg
                  ? coOrganizingEvents.find(c => c.event.id === event.id)
                  : undefined;

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
                      {/* Remove favourite button */}
                      {isFav && (
                        <button
                          onClick={ev => { ev.stopPropagation(); handleRemoveFavorite(event.id); }}
                          className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Remove from favourites"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200 flex items-center gap-1">
                          {isFav    && <Heart className="w-3 h-3 fill-current text-red-500" />}
                          {!isFav && !isCoOrg && <Users className="w-3 h-3" />}
                          {isCoOrg  && <UserCheck className="w-3 h-3 text-blue-500" />}
                          {isFav ? 'Favourite' : isCoOrg ? 'Co-Organizer' : 'Organizer'}
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

                      {/* Stats bar for organizer / co-organizer events */}
                      {showStats && isOrganizerEvent(event) && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Tickets Sold</div>
                              <div className="text-sm font-bold text-gray-800">
                                {event.total_bookings}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div
                                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
                                  style={{ width: `${event.total_bookings > 0 ? 100 : 0}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Revenue</div>
                              <div className="text-sm font-bold text-orange-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                KES {event.total_revenue.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Co-organizer invite metadata shown on the card */}
                      {isCoOrg && coOrg && (
                        <div className="pt-3 border-t border-gray-100 mt-3">
                          <p className="text-xs text-gray-400">
                            Invited to co-organise · {formatDate(coOrg.created_at)}
                            {coOrg.create_co_organizer && (
                              <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                                Can invite others
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* ── Event Stats Modal ── */}
        {selectedEvent && selectedEventType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    {selectedEventType === 'organizer'
                      ? <><Users className="w-3.5 h-3.5" /> Event Organizer</>
                      : <><UserCheck className="w-3.5 h-3.5 text-blue-500" /> Co-Organizer</>
                    }
                    {' · '}
                    {formatDate(selectedEvent.start_time)}
                  </p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="rounded-xl overflow-hidden mb-6">
                  <img src={selectedEvent.flyer_url} alt={selectedEvent.title} className="w-full h-64 object-cover" />
                </div>

                <div className="space-y-3 mb-6">
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

                {/* Co-organizer relationship info */}
                {selectedEventType === 'co-organizer' && selectedCoOrg && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6 text-sm">
                    <p className="font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" /> Co-Organizer Access
                    </p>
                    <p className="text-blue-700">
                      You were invited to co-organise this event on {formatDate(selectedCoOrg.created_at)}.
                    </p>
                    {selectedCoOrg.create_co_organizer && (
                      <p className="text-blue-600 mt-1 text-xs">
                        You have permission to invite additional co-organisers to this event.
                      </p>
                    )}
                  </div>
                )}

                {/* Stats grid */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Event Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Ticket className="w-5 h-5 text-orange-500" />
                        <span className="text-2xl font-bold text-gray-800">{selectedEvent.total_bookings}</span>
                      </div>
                      <p className="text-xs text-gray-500">Total Bookings</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <span className="text-2xl font-bold text-gray-800">
                          {selectedEvent.total_revenue.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Revenue (KES)</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Total earnings
                      </p>
                    </div>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">About This Event</h4>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Action area */}
                <div className="flex flex-col gap-3">
                  {selectedEventType === 'organizer' ? (
                    profileCompleted ? (
                      <button
                        onClick={() => { window.location.href = `${organizerBaseURL}/events/${selectedEvent.slug}`; }}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-5 h-5" /> View Full Dashboard
                      </button>
                    ) : (
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-400 font-medium cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" /> View Full Dashboard
                        </button>
                        <div className="bg-amber-50 border-t border-amber-100 px-5 py-4">
                          <div className="flex items-start gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-semibold text-amber-800">
                              Complete your organizer profile to unlock the dashboard
                            </p>
                          </div>
                          <ul className="space-y-2 mb-4">
                            {Object.entries(FIELD_LABELS).map(([key, label]) => {
                              const isMissing = missingFields.includes(key);
                              return (
                                <li key={key} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isMissing ? 'text-amber-300' : 'text-green-500'}`} />
                                  <span className={isMissing ? 'text-amber-700' : 'text-gray-400 line-through'}>
                                    {label}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                          <button
                            onClick={() => { window.location.href = '/setup-organizer-profile'; }}
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm"
                          >
                            Set Up Profile Now
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
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

        {/* Organizer profile prompt (non-organizer user) */}
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
                  onClick={() => { window.location.href = '/setup-organizer-profile'; }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700"
                >
                  Setup Profile Now
                </button>
                <button
                  onClick={() => setShowOrganizerPrompt(false)}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
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