// src/apps/organizer/pages/EventDetails.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Edit, Trash2, Users, DollarSign,
  Ticket, ArrowLeft, Plus, Eye, EyeOff, XCircle, TrendingUp,
  CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';
import { getEventDetailsBySlug, updateEventStatus } from '@organizer/services/eventService';
import { organizer_updateTicketType } from '@shared/api/user/ticketTypesApi';
import { formatKES, formatDate, formatTime } from '@shared/utils/format';
import { parseApiError } from '@shared/utils/parseApiError';
import type { OrganizerEventOut, TicketTypeOut, EventStats } from '@shared/types/Event';
import type { Booking as BookingOut } from '@shared/types/Booking';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ event: OrganizerEventOut }> = ({ event }) => {
  if (!event.is_approved)
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">Pending Approval</span>;
  if (event.status === 'pending_deletion') {
    return (
      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
        Pending Deletion
      </span>
    );
  }
  const colours: Record<string, string> = {
    upcoming:  'bg-blue-100 text-blue-700',
    ongoing:   'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${colours[event.status] ?? 'bg-gray-100 text-gray-700'}`}>
      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
    </span>
  );
};

const BookingStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    confirmed: { cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
    pending:   { cls: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
    cancelled: { cls: 'bg-red-100 text-red-700',    icon: <XCircle className="w-3 h-3" /> },
  };
  const { cls, icon } = map[status] ?? { cls: 'bg-gray-100 text-gray-700', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
      {icon}{status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EventDetails: React.FC = () => {
  // Route param is now :slug (string), not :eventId (number)
  const { slug }  = useParams<{ slug: string }>();
  const navigate  = useNavigate();

  const [event,          setEvent]          = useState<OrganizerEventOut | null>(null);
  const [stats,          setStats]          = useState<EventStats | null>(null);
  const [ticketTypes,    setTicketTypes]    = useState<TicketTypeOut[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingOut[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading,  setActionLoading]  = useState(false);
  const [actionError,    setActionError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const details = await getEventDetailsBySlug(slug);
      setEvent(details.event);
      setStats(details.stats);
      setTicketTypes(details.ticket_types);
      setRecentBookings(details.recent_bookings);
    } catch (err: any) {
      setError(parseApiError(err, 'Failed to load event details. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    if (!event) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await updateEventStatus(event.id, 'cancelled');
      setEvent(updated);
    } catch (err: any) {
      setActionError(parseApiError(err, 'Failed to cancel event.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await updateEventStatus(event.id, 'deleted');
      setShowDeleteModal(false);

      if (updated.status === 'deleted') {
        // Event is fully gone — nothing left to show on this page.
        navigate('/events', { state: { flash: `"${updated.title}" was deleted.` } });
        return;
      }

      // Backend redirected 'deleted' -> 'pending_deletion' because of
      // unresolved bookings. Stay put so the organizer sees the new badge
      // and understands refunds are still outstanding.
      setEvent(updated);
    } catch (err: any) {
      setActionError(parseApiError(err, 'Failed to delete event.'));
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTicketActive = async (ticket: TicketTypeOut) => {
    setActionError(null);
    try {
      const updated = await organizer_updateTicketType(ticket.id, { is_active: !ticket.is_active });
      setTicketTypes(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err: any) {
      setActionError(parseApiError(err, 'Failed to update ticket type status.'));
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-600 font-semibold">{error ?? 'Event not found.'}</p>
          <button onClick={() => navigate('/events')} className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const canCancel = !['cancelled', 'completed', 'deleted', 'pending_deletion'].includes(event.status);

  return (
    <div className="space-y-8">

      {/* Back */}
      <button onClick={() => navigate('/events')} className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Events
      </button>

      {/* Action error */}
      {actionError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      {/* Event header */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 flex-shrink-0">
            <img src={event.flyer_url} alt={event.title} className="w-full h-64 md:h-full object-cover" />
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 leading-tight">{event.title}</h1>
                <StatusBadge event={event} />
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                {/* Edit navigates using slug */}
                <button
                  onClick={() => navigate(`/events/${event.slug}/edit`)}
                  className="p-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Edit Event"
                >
                  <Edit className="w-5 h-5" />
                </button>
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="p-2 border-2 border-orange-400 text-orange-500 rounded-lg hover:bg-orange-50 disabled:opacity-50"
                    title="Cancel Event"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                {event.status === 'pending_deletion' ? (
                  <span
                    className="p-2 flex items-center gap-1.5 text-orange-500 text-xs"
                    title="Deletion requested — waiting on refunds"
                  >
                    <Trash2 className="w-5 h-5" />
                  </span>
                ) : (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50"
                    title="Delete Event"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-5 text-gray-600">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm">{formatDate(event.start_time)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm">{formatTime(event.start_time)} – {formatTime(event.end_time)}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm">{event.venue}, {event.city}</span>
              </div>
            </div>

            {event.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{event.description}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/events/${event.id}/tickets`)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center text-sm"
              >
                <Ticket className="w-4 h-4 mr-2" /> Manage Tickets
              </button>
              <button
                onClick={() => navigate(`/events/${event.id}/bookings`)}
                className="flex-1 border-2 border-blue-500 text-blue-600 py-2.5 rounded-lg font-semibold hover:bg-blue-50 flex items-center justify-center text-sm"
              >
                <Eye className="w-4 h-4 mr-2" /> View Bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Bookings',
            value: event.total_bookings,
            icon: <Ticket className="w-6 h-6 text-blue-500" />,
            extra: <TrendingUp className="w-4 h-4 text-green-500" />,
          },
          {
            label: 'Tickets Sold',
            value: stats?.tickets_sold ?? '—',
            icon: <Users className="w-6 h-6 text-blue-500" />,
          },
          {
            label: 'Remaining',
            value: stats?.tickets_remaining ?? '—',
            icon: <Ticket className="w-6 h-6 text-purple-500" />,
          },
          {
            label: 'Gross Revenue',
            value: formatKES(event.total_revenue),
            icon: <DollarSign className="w-6 h-6 text-green-500" />,
            valueClass: 'text-green-600',
          },
        ].map(({ label, value, icon, extra, valueClass }) => (
          <div key={label} className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-3">
              {icon}{extra}
            </div>
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className={`text-2xl font-bold ${valueClass ?? 'text-gray-800'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Commission / revenue breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Revenue Breakdown</h2>
          {event.commission_source === 'negotiated' && (
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              Negotiated Rate
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Gross Revenue</p>
            <p className="text-xl font-bold text-gray-800">{formatKES(event.total_revenue)}</p>
            <p className="text-xs text-gray-400 mt-1">All confirmed bookings</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Platform Cut ({event.commission_rate}%)</p>
            <p className="text-xl font-bold text-red-600">− {formatKES(event.platform_cut)}</p>
            {event.commission_source === 'negotiated' && event.commission_approved_by_name && (
              <p className="text-xs text-gray-400 mt-1">Approved by {event.commission_approved_by_name}</p>
            )}
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <p className="text-xs text-gray-500 mb-1">Your Earnings</p>
            <p className="text-xl font-bold text-green-600">{formatKES(event.organizer_net)}</p>
            <p className="text-xs text-gray-400 mt-1">After platform fees</p>
          </div>
        </div>
      </div>

      {/* Ticket Types + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ticket Types */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">Ticket Types</h2>
            <button
              onClick={() => navigate(`/events/${event.id}/tickets`)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Type
            </button>
          </div>
          {ticketTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Ticket className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No ticket types yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ticketTypes.map(ticket => (
                <div key={ticket.id} className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm">{ticket.name}</h3>
                      {ticket.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ticket.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-blue-600 flex-shrink-0 ml-3">
                      {formatKES(ticket.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>Sold: {ticket.quantity_sold} / {ticket.quantity_available}</span>
                    <button
                      onClick={() => handleToggleTicketActive(ticket)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        ticket.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={ticket.is_active ? 'Deactivate ticket type' : 'Reactivate ticket type'}
                    >
                      {ticket.is_active
                        ? <><Eye className="w-3 h-3" /> Active</>
                        : <><EyeOff className="w-3 h-3" /> Inactive</>}
                    </button>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (ticket.quantity_sold / ticket.quantity_available) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
            <button
              onClick={() => navigate(`/events/${event.id}/bookings`)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(booking => (
                <div key={booking.id} className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Booking #{booking.id}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">{booking.quantity}× ticket</span>
                    <span className="font-bold text-green-600">{formatKES(booking.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Event?</h3>
            <p className="text-gray-600 text-center text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold">"{event.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;