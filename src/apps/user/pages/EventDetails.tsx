// src/apps/user/pages/EventDetails.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Public event detail page — shown to unauthenticated users.
// Authenticated users see BrowseEventDetails.tsx instead.
//
// Route: /events/:slug
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, Share2,
  ChevronLeft, Ticket, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import AuthModal from '@shared/components/modals/AuthModal';
import SEO from '@shared/components/SEO';
import {
  getEventBySlug,
  getTicketTypesByEvent,
} from '@user/services/eventService';
import type { EventOut, TicketTypeOut, SelectedTickets } from '@shared/types/Event';

const baseUrl = import.meta.env.VITE_BASE_URL ?? 'https://mgltickets.com';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
                Only {available} left
              </span>
            )}
            {isSoldOut && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Sold Out
              </span>
            )}
          </div>
          {ticket.description && (
            <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span>{ticket.quantity_sold} sold / {ticket.quantity_available} available</span>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-orange-600">
            KES {ticket.price.toLocaleString()}
          </div>
        </div>
      </div>

      {!isSoldOut && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600 font-medium">Quantity:</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onChange(ticket.id, Math.max(0, selectedQty - 1))}
              disabled={selectedQty === 0}
              className="w-10 h-10 rounded-lg border-2 border-orange-500 text-orange-600 font-bold hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              −
            </button>
            <span className="w-12 text-center font-bold text-lg text-gray-800">
              {selectedQty}
            </span>
            <button
              onClick={() => onChange(ticket.id, Math.min(available, selectedQty + 1))}
              disabled={selectedQty >= available}
              className="w-10 h-10 rounded-lg border-2 border-orange-500 bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page component ───────────────────────────────────────────────────────────

const EventDetailsPage: React.FC = () => {
  const navigate          = useNavigate();
  const { slug }          = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const [event, setEvent]               = useState<EventOut | null>(null);
  const [ticketTypes, setTicketTypes]   = useState<TicketTypeOut[]>([]);
  const [selectedTickets, setSelected]  = useState<SelectedTickets>({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const eventData   = await getEventBySlug(slug);
      const ticketsData = await getTicketTypesByEvent(eventData.id);
      setEvent(eventData);
      setTicketTypes(ticketsData);
    } catch {
      setError('Event not found or failed to load. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (event) document.title = `${event.title} - MGLTickets`;
  }, [event]);

  // ── Ticket selection ───────────────────────────────────────────────────────
  const handleTicketChange = (id: number, qty: number) => {
    setSelected(prev => {
      if (qty === 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
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
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
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

  // After login, redirect to the authenticated version of this page
  const handleAuthSuccess = () => {
    navigate(`/browse-events/${event?.slug ?? slug}`, {
      replace: true,
      state: { selectedTickets, event },
    });
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = () => {
    const url = `${baseUrl}/events/${event?.slug}`;
    if (navigator.share) {
      navigator.share({ title: event?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Event Not Found</h2>
          <p className="text-gray-600">{error ?? "The event you're looking for doesn't exist."}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
            <button
              onClick={() => navigate('/events')}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/events')}
              className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Back to Events
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              title="Share event"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Hero grid: flyer + booking card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Flyer */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={event.flyer_url}
                  alt={event.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>

            {/* Sticky booking card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 space-y-5">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-3">{event.title}</h1>
                  <div className="space-y-2">
                    <div className="flex items-center text-orange-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium text-sm">{formatDate(event.start_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{formatTime(event.start_time)} – {formatTime(event.end_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Status</span>
                    <p className="font-medium text-green-600 capitalize">{event.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration</span>
                    <p className="font-medium text-gray-800">{getDurationHours(event.start_time, event.end_time)}</p>
                  </div>
                </div>

                {/* Booking summary */}
                <div className="border-t border-gray-100 pt-4">
                  {totalTickets > 0 ? (
                    <div className="space-y-4">
                      {/* Selected breakdown */}
                      <div className="space-y-1">
                        {Object.entries(selectedTickets).map(([id, qty]) => {
                          const t = ticketTypes.find(t => t.id === Number(id));
                          if (!t) return null;
                          return (
                            <div key={id} className="flex justify-between text-sm text-gray-600">
                              <span>{qty}× {t.name}</span>
                              <span>KES {(t.price * qty).toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-600 font-medium">Total ({totalTickets} tickets)</span>
                        <span className="text-2xl font-bold text-orange-600">
                          KES {totalPrice.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                      >
                        {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                      </button>
                      {!isAuthenticated && (
                        <p className="text-xs text-center text-gray-500">
                          You'll be asked to sign in before completing your booking.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select tickets below to continue</p>
                    </div>
                  )}
                </div>

                {/* Support */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600 mb-3">Have questions about this event?</p>
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full border-2 border-orange-500 text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About + ticket selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              {/* About */}
              <div className="bg-white rounded-2xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Ticket types */}
              <div className="bg-white rounded-2xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Tickets</h2>
                {ticketTypes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Ticket className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No ticket types available for this event yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 sticky top-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Event Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium text-green-600 capitalize">{event.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium text-gray-800">
                        {getDurationHours(event.start_time, event.end_time)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Event ID</span>
                      <span className="font-medium text-gray-800">#{event.id}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Have questions about this event? Contact our support team.
                  </p>
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full border-2 border-orange-500 text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode="login"
      />
    </>
  );
};

export default EventDetailsPage;