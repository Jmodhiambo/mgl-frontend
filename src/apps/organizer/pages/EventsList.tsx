// src/apps/organizer/pages/EventsList.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Edit, Trash2, Users,
  DollarSign, Eye, Plus, Search, MoreVertical, XCircle, Ticket,
} from 'lucide-react';
import { getMyEvents, updateEventStatus } from '@organizer/services/eventService';
import type { OrganizerEventOut } from '@shared/types/Event';

type StatusFilter = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// ─── Component ────────────────────────────────────────────────────────────────

const EventsList: React.FC = () => {
  const navigate = useNavigate();

  const [events, setEvents]           = useState<OrganizerEventOut[]>([]);
  const [filtered, setFiltered]       = useState<OrganizerEventOut[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatus]     = useState<StatusFilter>('all');
  const [deleteModal, setDeleteModal] = useState<OrganizerEventOut | null>(null);
  const [actionLoading, setAL]        = useState(false);
  const [openMenuId, setOpenMenuId]   = useState<number | null>(null);
  const [menuAlign, setMenuAlign]     = useState<'down' | 'up'>('down');
  const menuBtnRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const toggleMenu = (id: number) => {
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const btn = menuBtnRefs.current[id];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ESTIMATED_MENU_HEIGHT = 220; // ~4 items + divider
      setMenuAlign(window.innerHeight - rect.bottom < ESTIMATED_MENU_HEIGHT ? 'up' : 'down');
    }
    setOpenMenuId(id);
  };

  // Close the open menu on Escape
  useEffect(() => {
    if (openMenuId === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenuId(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openMenuId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyEvents();
      setEvents(data);
      setFiltered(data);
    } catch {
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFiltered(
      events.filter(e => {
        const matchesSearch =
          !q ||
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    );
  }, [events, searchQuery, statusFilter]);

  const getStatusBadge = (event: OrganizerEventOut) => {
    if (!event.is_approved) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Pending Approval</span>;
    }
    const colours: Record<string, string> = {
      upcoming:  'bg-blue-100 text-blue-700',
      ongoing:   'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${colours[event.status] ?? 'bg-gray-100 text-gray-700'}`}>
        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
      </span>
    );
  };

  const handleCancel = async (eventId: number) => {
    setAL(true);
    try {
      await updateEventStatus(eventId, 'cancelled');
      setEvents(p => p.map(e => e.id === eventId ? { ...e, status: 'cancelled' } : e));
    } catch {
      // surface error if needed
    } finally {
      setAL(false);
    }
  };

  const handleDelete = async (eventId: number) => {
    setAL(true);
    try {
      await updateEventStatus(eventId, 'deleted');
      setEvents(p => p.filter(e => e.id !== eventId));
      setDeleteModal(null);
    } catch {
      // surface error if needed
    } finally {
      setAL(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-semibold">{error}</p>
          <button onClick={load} className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Events</h1>
            <p className="text-gray-600">Manage and track all your events</p>
          </div>
          <button
            onClick={() => navigate('/events/create')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Create Event
          </button>
        </div>

        {/* Search + filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events by title or venue…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value as StatusFilter)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Events grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first event'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/events/create')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700"
              >
                Create Your First Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img
                    src={event.flyer_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(event)}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{event.title}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                      <span>{formatTime(event.start_time)} – {formatTime(event.end_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="flex items-center text-gray-600 text-xs mb-1">
                        <Users size={14} className="mr-1" /> Bookings
                      </div>
                      <div className="font-bold text-gray-800">{event.total_bookings}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-600 text-xs mb-1">
                        <DollarSign size={14} className="mr-1" /> Revenue
                      </div>
                      <div className="font-bold text-green-600">
                        KES {(event.total_revenue / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/events/${event.slug}`)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center text-sm font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </button>
                    <button
                      onClick={() => navigate(`/events/${event.slug}/edit`)}
                      className="px-3 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit Event"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        ref={el => { menuBtnRefs.current[event.id] = el; }}
                        onClick={() => toggleMenu(event.id)}
                        className={`px-3 py-2 border-2 rounded-lg transition-colors ${
                          openMenuId === event.id
                            ? 'border-blue-400 bg-blue-50 text-blue-600'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === event.id && (
                        <>
                          {/* Click-outside catcher to dismiss the menu */}
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div
                            className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 ${
                              menuAlign === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}
                          >
                            <button
                              onClick={() => { setOpenMenuId(null); navigate(`/events/${event.id}/tickets`); }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Ticket className="w-4 h-4 mr-2" /> Manage Tickets
                            </button>
                            <button
                              onClick={() => { setOpenMenuId(null); navigate(`/events/${event.id}/bookings`); }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Users className="w-4 h-4 mr-2" /> View Bookings
                            </button>
                            {event.status !== 'cancelled' && event.status !== 'completed' && (
                              <button
                                onClick={() => { setOpenMenuId(null); handleCancel(event.id); }}
                                disabled={actionLoading}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Cancel Event
                              </button>
                            )}
                            <div className="my-1 border-t border-gray-100" />
                            <button
                              onClick={() => { setOpenMenuId(null); setDeleteModal(event); }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Event
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Event?</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{deleteModal.title}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsList;