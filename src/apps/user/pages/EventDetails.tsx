// src/apps/user/pages/EventDetails.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Public event detail page — shown to unauthenticated users.
// Authenticated users are redirected to BrowseEventDetails.tsx (see effect
// below) — this route (/events/:slug) is the CANONICAL, shareable URL: it's
// what goes into QR codes, posters, and shared links, since it must resolve
// for a scanner who isn't logged in yet. Authenticated users get bounced to
// the richer /browse-events/:slug experience without ever seeing this page.
//
// LAYOUT (Aug 2026 revamp): mirrors BrowseEventDetails.tsx — compact
// identity strip instead of a full-bleed hero, booking panel first in the
// markup so it's what a mobile visitor sees on load, no "Back to Events"
// link. See BrowseEventDetails.tsx for the full rationale.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Share2, QrCode, Link2,
  Ticket, AlertCircle, RefreshCw, Tag,
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import AuthModal from '@shared/components/modals/AuthModal';
import ShareEventModal from '@shared/components/modals/ShareEventModal';
import SEO from '@shared/components/SEO';
import { BASE_URL } from '@shared/components/ENV';
import TicketRow from '@user/components/modals/events/TicketRow';
import {
  getEventBySlug,
  getTicketTypesByEvent,
} from '@user/services/eventService';
import { formatDate, formatTime } from '@shared/utils/format';
import type { EventOut, TicketTypeOut, SelectedTickets } from '@shared/types/Event';

// ─── Page component ───────────────────────────────────────────────────────────

const EventDetailsPage: React.FC = () => {
  const navigate            = useNavigate();
  const { slug }            = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const [event, setEvent]               = useState<EventOut | null>(null);
  const [ticketTypes, setTicketTypes]   = useState<TicketTypeOut[]>([]);
  const [selectedTickets, setSelected]  = useState<SelectedTickets>({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied]             = useState(false);
  const [linkCopied, setLinkCopied]     = useState(false);

  // ── Canonical-URL redirect ─────────────────────────────────────────────────
  // This route is the public, shareable canonical URL (what goes into QR
  // codes and shared links). Authenticated users get the richer
  // /browse-events/:slug experience instead — bounce them there immediately,
  // before firing off the event/ticket fetch below, so there's no wasted
  // request or flash of the public page.
  useEffect(() => {
    if (isAuthenticated && slug) {
      navigate(`/browse-events/${slug}`, { replace: true });
    }
  }, [isAuthenticated, slug, navigate]);

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
    if (isAuthenticated) return; // redirect effect above will navigate away
    load();
  }, [load, isAuthenticated]);

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
    if (!isAuthenticated) { setShowAuthModal(true); return; }
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

  const handleAuthSuccess = () => {
    navigate(`/browse-events/${event?.slug ?? slug}`, {
      replace: true,
      state: { selectedTickets, event },
    });
  };

  // ── Share (native share sheet / copy fallback) ─────────────────────────────
  const handleShare = () => {
    const url = `${BASE_URL}/events/${event?.slug}`;
    if (navigator.share) {
      navigator.share({ title: event?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // ── Copy Link — explicit one-click copy, independent of the native share
  // sheet (which some browsers open instead of copying) and the QR modal.
  const handleCopyLink = () => {
    if (!event) return;
    navigator.clipboard.writeText(`${BASE_URL}/events/${event.slug}`).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
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
              onClick={() => navigate('/events')}
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

  const shareUrl = `${BASE_URL}/events/${event.slug}`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title={event.title}
        description={`${(event.description ?? '').substring(0, 155)}… Get tickets now!`}
        keywords={`${event.title}, ${event.venue}, Kenya events, tickets`}
        ogImage={event.flyer_url}
        ogType="article"
        canonicalUrl={shareUrl}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">

          {/* ── Identity strip ────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-6">

            {/* Mobile-only row: badges + icon actions get the full width to
                themselves here, instead of squeezing in next to the thumbnail
                and title below — that squeeze was cutting the title down to
                a couple of characters on phone widths. */}
            <div className="flex sm:hidden items-center justify-between mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                  {event.category}
                </span>
                {lowestPrice !== null && (
                  <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 text-[11px] font-semibold rounded-full border border-orange-100">
                    {lowestPrice === 0 ? 'Free' : `From KES ${lowestPrice.toLocaleString()}`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0 -mr-1.5">
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors"
                  title={linkCopied ? 'Copied!' : 'Copy event link'}
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors"
                  title="Get a QR code for this event"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors"
                  title={copied ? 'Copied!' : 'Share this event'}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <img
                src={event.flyer_url}
                alt={event.title}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl object-cover flex-shrink-0 bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                {/* Desktop-only badges — mobile shows these in the row above */}
                <div className="hidden sm:flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                    {event.category}
                  </span>
                  {lowestPrice !== null && (
                    <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 text-[11px] font-semibold rounded-full border border-orange-100">
                      {lowestPrice === 0 ? 'Free' : `From KES ${lowestPrice.toLocaleString()}`}
                    </span>
                  )}
                </div>
                <h1 className="text-base sm:text-2xl font-bold text-gray-900 leading-snug sm:leading-tight mb-1.5">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-x-4 text-gray-500 text-xs sm:text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    {formatDate(event.start_time)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    {formatTime(event.start_time)} – {formatTime(event.end_time)}
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                    {event.venue}
                  </span>
                </div>
              </div>

              {/* Desktop-only icon actions — mobile shows these in the row above */}
              <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors"
                  title={linkCopied ? 'Copied!' : 'Copy event link'}
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors"
                  title="Get a QR code for this event"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors"
                  title={copied ? 'Copied!' : 'Share this event'}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Body ───────────────────────────────────────────────────────
              Booking panel first in markup for mobile; pinned right on
              desktop via col-start. */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── Booking panel (tickets + totals + checkout, sticky) ────── */}
            <div className="lg:col-start-3 lg:col-span-1 lg:row-start-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6 space-y-4">

                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">Tickets</h2>
                  {ticketTypes.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {ticketTypes.length} type{ticketTypes.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {ticketTypes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No ticket types available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
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

                {/* Totals */}
                {totalTickets > 0 && (
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">
                        Total ({totalTickets} ticket{totalTickets !== 1 ? 's' : ''})
                      </span>
                      {totalPrice === 0 ? (
                        <span className="text-lg font-bold text-green-600">Free</span>
                      ) : (
                        <span className="text-lg font-bold text-orange-600">
                          KES {totalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={totalTickets === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm text-sm"
                >
                  {totalTickets === 0
                    ? 'Select tickets to continue'
                    : isAuthenticated
                    ? 'Proceed to Checkout'
                    : 'Sign in to Checkout'}
                </button>

                {!isAuthenticated && totalTickets > 0 && (
                  <p className="text-xs text-center text-gray-400">
                    You'll be asked to sign in before completing your purchase.
                  </p>
                )}

                {/* Trust signals */}
                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-400">
                  <p className="flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5 text-orange-400" />
                    Instant booking confirmation
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    {event.venue}
                  </p>
                </div>
              </div>
            </div>

            {/* ── About + Event Details (secondary content) ───────────────── */}
            <div className="lg:col-start-1 lg:col-span-2 lg:row-start-1 space-y-6">

              {event.description && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {event.description}
                  </p>
                </section>
              )}

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

              {/* Support — kept here rather than in the booking panel so the
                  panel stays focused purely on buying. */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-sm text-gray-500 mb-3">Questions about this event?</p>
                <button
                  onClick={() => navigate('/contact')}
                  className="border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Contact Support
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode="login"
      />

      <ShareEventModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={event.title}
        subtitle="Scan or share this QR code to let others book"
        shareUrl={shareUrl}
        downloadFilename={`event-${event.slug}`}
        accent="orange"
      />
    </>
  );
};

export default EventDetailsPage;