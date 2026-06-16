// src/apps/user/pages/BrowseEventDetails.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Authenticated event detail page — shown to logged-in users.
// Unauthenticated users see EventDetails.tsx instead.
//
// Route: /browse-events/:slug
// Supports navigation state restore: when a user selects tickets on
// EventDetails.tsx and is then redirected here after login, the ticket
// selection is preserved via location.state.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, Share2, Heart,
  ChevronLeft, Ticket, AlertCircle, RefreshCw, Tag,
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import SEO from '@shared/components/SEO';
import {
  getEventBySlug,
  getTicketTypesByEvent,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '@user/services/eventService';
import type { EventOut, TicketTypeOut, SelectedTickets } from '@shared/types/Event';

const baseUrl = import.meta.env.VITE_BASE_URL ?? 'https://mgltickets.com';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseApiError(err: any, fallback: string): string {
  const raw = err?.response?.data?.detail;
  if (Array.isArray(raw))
    return raw
      .map((e: any) => `${Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : 'field'}: ${e.msg}`)
      .join('; ');
  if (typeof raw === 'string') return raw;
  return fallback;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const getDurationHours = (start: string, end: string): string => {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60 / 60;
  if (diff < 1)  return `${Math.round(diff * 60)} min`;
  if (diff === Math.floor(diff)) return `${diff}h`;
  return `${Math.floor(diff)}h ${Math.round((diff % 1) * 60)}min`;
};

// ─── Ticket selector row ──────────────────────────────────────────────────────

const TicketRow: React.FC<{
  ticket: TicketTypeOut;
  selectedQty: number;
  onChange: (id: number, qty: number) => void;
}> = ({ ticket, selectedQty, onChange }) => {
  const available  = ticket.quantity_available;
  const isLowStock = available <= 10 && available > 0;
  const isSoldOut  = available <= 0;

  return (
    <div
      className={`rounded-xl border-2 p-5 transition-all ${
        selectedQty > 0
          ? 'border-orange-400 bg-orange-50'
          : isSoldOut
          ? 'border-gray-200 bg-gray-50 opacity-60'
          : 'border-gray-200 hover:border-orange-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: name + description + stock */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base">{ticket.name}</h3>
            {isLowStock && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                Only {available} left!
              </span>
            )}
            {isSoldOut && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                Sold Out
              </span>
            )}
          </div>
          {ticket.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-2">{ticket.description}</p>
          )}
          {!isSoldOut && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {available} tickets remaining
            </p>
          )}
        </div>

        {/* Right: price + stepper */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className="text-xl font-bold text-orange-600">
            KES {ticket.price.toLocaleString()}
          </span>
          {!isSoldOut && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange(ticket.id, Math.max(0, selectedQty - 1))}
                disabled={selectedQty === 0}
                className="w-8 h-8 rounded-lg border-2 border-orange-400 text-orange-600 font-bold text-sm hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-gray-800">{selectedQty}</span>
              <button
                onClick={() => onChange(ticket.id, Math.min(available, selectedQty + 1))}
                disabled={selectedQty >= available}
                className="w-8 h-8 rounded-lg border-2 border-orange-500 bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Page component ───────────────────────────────────────────────────────────

const BrowseEventDetailsPage: React.FC = () => {
  const navigate            = useNavigate();
  const location            = useLocation();
  const { slug }            = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const [event, setEvent]               = useState<EventOut | null>(null);
  const [ticketTypes, setTicketTypes]   = useState<TicketTypeOut[]>([]);
  const [selectedTickets, setSelected]  = useState<SelectedTickets>({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [isFavorite, setIsFavorite]     = useState(false);
  const [favLoading, setFavLoading]     = useState(false);
  const [favError, setFavError]         = useState<string | null>(null);
  const [copied, setCopied]             = useState(false);

  // ── Restore ticket selection from login redirect state ────────────────────
  useEffect(() => {
    const state = location.state as {
      selectedTickets?: SelectedTickets;
      event?: EventOut;
    } | null;
    if (state?.selectedTickets) setSelected(state.selectedTickets);
    if (state?.event) {
      setEvent(state.event);
      setLoading(false);
    }
  }, []);

  // ── Load event + tickets + favourite state ────────────────────────────────
  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const eventData = await getEventBySlug(slug);
      const [ticketsData, favData] = await Promise.all([
        getTicketTypesByEvent(eventData.id),
        getFavorites().catch(() => [] as { event_id: number }[]),
      ]);
      setEvent(eventData);
      setTicketTypes(ticketsData);
      setIsFavorite(favData.some(f => f.event_id === eventData.id));
    } catch (err: any) {
      setError(parseApiError(err, 'Event not found or failed to load. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!event) {
      load();
    } else {
      (async () => {
        try {
          const [ticketsData, favData] = await Promise.all([
            getTicketTypesByEvent(event.id),
            getFavorites().catch(() => [] as { event_id: number }[]),
          ]);
          setTicketTypes(ticketsData);
          setIsFavorite(favData.some(f => f.event_id === event.id));
        } catch { /* non-critical */ }
        setLoading(false);
      })();
    }
  }, [load]);

  useEffect(() => {
    if (event) document.title = `${event.title} - MGLTickets`;
  }, [event]);

  // ── Ticket selection ───────────────────────────────────────────────────────
  const handleTicketChange = (id: number, qty: number) => {
    setSelected(prev => {
      if (qty === 0) { const next = { ...prev }; delete next[id]; return next; }
      return { ...prev, [id]: qty };
    });
  };

  const totalTickets = Object.values(selectedTickets).reduce((s, q) => s + q, 0);
  const totalPrice   = Object.entries(selectedTickets).reduce((s, [id, qty]) => {
    const t = ticketTypes.find(t => t.id === Number(id));
    return s + (t ? t.price * qty : 0);
  }, 0);

  // ── Checkout ───────────────────────────────────────────────────────────────
  const handleCheckout = () => {
    const bookingData = {
      eventId: event?.id,
      tickets: Object.entries(selectedTickets).map(([id, qty]) => {
        const t = ticketTypes.find(t => t.id === Number(id));
        return { ticket_type_id: Number(id), name: t?.name ?? '', quantity: qty, price: t?.price ?? 0 };
      }),
      total: totalPrice,
    };
    navigate('/checkout', { state: { bookingData, event } });
  };

  // ── Favourite toggle ───────────────────────────────────────────────────────
  const handleFavoriteToggle = async () => {
    if (!event || favLoading) return;
    setFavLoading(true);
    setFavError(null);
    try {
      if (isFavorite) { await removeFavorite(event.id); setIsFavorite(false); }
      else            { await addFavorite(event.id);    setIsFavorite(true);  }
    } catch (err: any) {
      setFavError(parseApiError(err, 'Could not update favourite. Please try again.'));
    } finally {
      setFavLoading(false);
    }
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = () => {
    const url = `${baseUrl}/events/${event?.slug}`;
    if (navigator.share) {
      navigator.share({ title: event?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto" />
          <p className="text-gray-500 text-sm">Loading event…</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Event Not Found</h2>
          <p className="text-gray-500 text-sm">{error ?? "The event you're looking for doesn't exist."}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
            <button
              onClick={() => navigate('/browse-events')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600"
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lowestPrice = ticketTypes.length > 0
    ? Math.min(...ticketTypes.filter(t => t.quantity_available > 0).map(t => t.price))
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title={event.title}
        description={`${(event.description ?? '').substring(0, 155)}… Get tickets now!`}
        keywords={`${event.title}, ${event.venue}, Kenya events, tickets`}
        ogImage={event.flyer_url}
        ogType="article"
        canonicalUrl={`${baseUrl}/events/${event.slug}`}
      />

      <div className="min-h-screen bg-gray-50">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="relative w-full h-[420px] sm:h-[500px] overflow-hidden bg-gray-900">
          <img
            src={event.flyer_url}
            alt={event.title}
            className="w-full h-full object-cover opacity-50"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

          {/* Back + actions — top bar */}
          <div className="absolute top-0 left-0 right-0 px-4 sm:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/browse-events')}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Events
            </button>
            <div className="flex items-center gap-2">
              {/* Favourite */}
              {isAuthenticated && (
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favLoading}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm disabled:opacity-60 ${
                    isFavorite
                      ? 'bg-orange-500/80 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>
              )}
              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>

          {/* Event title + meta — bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 max-w-[1400px] mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                {event.category}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                event.status === 'upcoming'  ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40' :
                event.status === 'ongoing'   ? 'bg-green-500/30 text-green-200 border border-green-400/40' :
                event.status === 'completed' ? 'bg-gray-500/30 text-gray-300 border border-gray-400/40' :
                                               'bg-red-500/30 text-red-200 border border-red-400/40'
              }`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              {lowestPrice !== null && (
                <span className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full border border-white/20">
                  From KES {lowestPrice.toLocaleString()}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-sm">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                {formatDate(event.start_time)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                {formatTime(event.start_time)} – {formatTime(event.end_time)}
                <span className="text-white/50">({getDurationHours(event.start_time, event.end_time)})</span>
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                {event.venue}
              </span>
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Favourite error banner */}
          {favError && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{favError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Left: About + Details + Tickets ───────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* About */}
              {event.description && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {event.description}
                  </p>
                </section>
              )}

              {/* Event Info strip */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Event Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Calendar className="w-5 h-5 text-orange-500" />,
                      label: 'Date',
                      value: formatDate(event.start_time),
                    },
                    {
                      icon: <Clock className="w-5 h-5 text-orange-500" />,
                      label: 'Time',
                      value: `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`,
                    },
                    {
                      icon: <MapPin className="w-5 h-5 text-orange-500" />,
                      label: 'Venue',
                      value: event.venue,
                    },
                    {
                      icon: <Tag className="w-5 h-5 text-orange-500" />,
                      label: 'Category',
                      value: event.category,
                    },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="mt-0.5 flex-shrink-0">{icon}</div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-gray-800">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Ticket types */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Select Tickets</h2>
                  {ticketTypes.length > 0 && (
                    <span className="text-xs text-gray-400">{ticketTypes.length} type{ticketTypes.length !== 1 ? 's' : ''} available</span>
                  )}
                </div>

                {ticketTypes.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Ticket className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No ticket types available for this event yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ticketTypes.map(ticket => (
                      <TicketRow
                        key={ticket.id}
                        ticket={ticket}
                        selectedQty={selectedTickets[ticket.id] ?? 0}
                        onChange={handleTicketChange}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ── Right: Booking card (sticky) ───────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6 space-y-5">

                {/* Price summary header */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Your Order</p>
                  {totalTickets === 0 ? (
                    <p className="text-sm text-gray-400">No tickets selected yet.</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      KES {totalPrice.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Line items */}
                {totalTickets > 0 && (
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    {Object.entries(selectedTickets).map(([id, qty]) => {
                      const t = ticketTypes.find(t => t.id === Number(id));
                      if (!t) return null;
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {qty}× <span className="font-medium text-gray-800">{t.name}</span>
                          </span>
                          <span className="font-semibold text-gray-800">
                            KES {(t.price * qty).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Total ({totalTickets} ticket{totalTickets !== 1 ? 's' : ''})
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        KES {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={totalTickets === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm text-sm"
                >
                  {totalTickets === 0 ? 'Select tickets to continue' : 'Proceed to Checkout'}
                </button>

                {/* Divider + trust signals */}
                <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-400">
                  <p className="flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5 text-orange-400" />
                    Instant booking confirmation
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    {event.venue}
                  </p>
                </div>

                {/* Support */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-3">Questions about this event?</p>
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-600 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrowseEventDetailsPage;