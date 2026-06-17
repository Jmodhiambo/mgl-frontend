// src/apps/user/pages/Checkout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Checkout page — visual states:
//   'form'         — main checkout form (default)
//   'awaiting_pin' — STK push sent, waiting for M-Pesa PIN (paid events only)
//   'complete'     — booking confirmed (free events skip straight here)
//   'failed'       — payment failed / timed out
//
// Free-event behaviour:
//   - Payment method selector and phone input are hidden
//   - Total row shows "FREE" in green instead of "KES 0"
//   - CTA reads "Confirm Free Booking" instead of "Pay KES …"
//   - After createOrder, if checkout_request_id === null the page jumps
//     directly to 'complete' — no STK push, no polling
//
// Layout: header → two-col body (left: details, right: sticky summary + CTA).
// Terms checkbox lives in the right card, directly above the CTA.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ShieldCheck, Ticket, Phone,
  CheckCircle, AlertCircle, ChevronLeft, X, FileText,
  RefreshCw, Loader2, Lock, Smartphone, CreditCard,
} from 'lucide-react';
import { CheckoutSEO, BookingSEO } from '@shared/components/SEO';
import { TermsContent, RefundContent } from '@shared/pages';
import { useAuth } from '@shared/contexts/AuthContext';
import { createOrder } from '@shared/api/user/bookingsApi';
import { initiateMpesaPayment, pollPaymentStatus } from '@shared/api/user/paymentsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  id: number;
  slug: string;
  title: string;
  venue: string;
  start_time: string;
  flyer_url: string;
}

interface TicketItem {
  ticket_type_id: number;
  name: string;
  quantity: number;
  price: number;
}

interface BookingData {
  eventId: number;
  tickets: TicketItem[];
  total: number;
}

interface FormErrors {
  phoneNumber?: string;
  terms?: string;
  general?: string;
}

type PaymentStep = 'form' | 'awaiting_pin' | 'complete' | 'failed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// ─── Component ────────────────────────────────────────────────────────────────

const CheckoutBookingPage: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent]               = useState<Event | null>(null);
  const [bookingData, setBookingData]   = useState<BookingData | null>(null);
  const [phoneNumber, setPhoneNumber]   = useState('');
  const [agreedToTerms, setAgreed]      = useState(false);
  const [errors, setErrors]             = useState<FormErrors>({});
  const [paymentStep, setPaymentStep]   = useState<PaymentStep>('form');
  const [paymentId, setPaymentId]       = useState<number | null>(null);
  const [orderTotal, setOrderTotal]     = useState<number | null>(null);
  const [modalContent, setModalContent] = useState<'terms' | 'refund' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');

  const cancelPollRef = useRef<(() => void) | null>(null);
  useEffect(() => () => { cancelPollRef.current?.(); }, []);

  useEffect(() => {
    document.title = 'Checkout – MGLTickets';
    const state = location.state as { bookingData?: BookingData; event?: Event };
    if (!state?.bookingData || !state?.event) { navigate('/events'); return; }
    setBookingData(state.bookingData);
    setEvent(state.event);
    if (user?.phone_number) setPhoneNumber(user.phone_number);
  }, [location, navigate, user]);

  const calculateTotal = () =>
    bookingData?.tickets.reduce((s, t) => s + t.price * t.quantity, 0) ?? 0;

  const totalTickets = () =>
    bookingData?.tickets.reduce((s, t) => s + t.quantity, 0) ?? 0;

  // ── Validation ────────────────────────────────────────────────────────────

  const isFree = calculateTotal() === 0;

  const validateForm = (): boolean => {
    const errs: FormErrors = {};
    // Phone validation is only needed for paid events
    if (!isFree) {
      if (!phoneNumber.trim()) {
        errs.phoneNumber = 'Phone number is required';
      } else if (!/^(\+254|0)[17]\d{8}$/.test(phoneNumber.trim())) {
        errs.phoneNumber = 'Enter a valid Kenyan number (e.g. +254712345678 or 0712345678)';
      }
    }
    if (!agreedToTerms) errs.terms = 'Please agree to the terms and conditions';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Checkout handler ──────────────────────────────────────────────────────

  const handleCheckout = async () => {
    if (!validateForm() || !bookingData || !event) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const order = await createOrder({
        event_id: event.id,
        items: bookingData.tickets.map(t => ({
          ticket_type_id: t.ticket_type_id,
          quantity: t.quantity,
        })),
      });

      const stkResponse = await initiateMpesaPayment({
        order_id: order.id,
        phone_number: isFree ? '' : phoneNumber.trim(),
      });

      setOrderTotal(order.total_price);

      // Free events: backend returns checkout_request_id === null — no STK push
      // needed, booking is already confirmed, skip straight to the success screen.
      if (stkResponse.checkout_request_id === null) {
        setPaymentStep('complete');
        return;
      }

      // Paid events: wait for the user to approve the STK push on their phone.
      setPaymentId(stkResponse.payment_id);
      setPaymentStep('awaiting_pin');
      setStatusMessage(stkResponse.message);

      const cancelPoll = pollPaymentStatus(stkResponse.payment_id, {
        onPending: () => setStatusMessage('Waiting for M-Pesa confirmation…'),
        onComplete: () => { setPaymentStep('complete'); },
        onFailed:  () => {
          setPaymentStep('failed');
          setErrors({ general: 'Payment failed or was cancelled. Please try again.' });
        },
        onTimeout: () => {
          setPaymentStep('failed');
          setErrors({ general: 'Payment confirmation timed out. Check your M-Pesa messages and contact support if charged.' });
        },
        intervalMs:  3000,
        maxAttempts: 10,
      });

      cancelPollRef.current = cancelPoll;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process payment. Please try again.';
      setErrors({ general: msg });
      setPaymentStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────

  if (!bookingData || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // ── Complete screen ───────────────────────────────────────────────────────

  if (paymentStep === 'complete') {
    return (
      <>
        <BookingSEO />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full overflow-hidden">

            {/* Green top bar */}
            <div className="h-2 bg-gradient-to-r from-green-400 to-green-500" />

            <div className="p-8 text-center">
              {/* Icon */}
              <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">You're going!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Tickets sent to <span className="font-medium text-gray-700">{user?.email}</span>
              </p>

              {/* Summary card */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={event.flyer_url}
                    alt={event.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{event.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {event.venue}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(event.start_time)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-1.5">
                  {bookingData.tickets.map((t, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.quantity}× {t.name}</span>
                      <span className="font-medium text-gray-800">KES {(t.price * t.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-800">Total paid</span>
                    {(orderTotal ?? calculateTotal()) === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      <span className="text-orange-600">KES {(orderTotal ?? calculateTotal()).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
                >
                  View My Tickets
                </button>
                <button
                  onClick={() => navigate('/browse-events')}
                  className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-medium transition-colors text-sm"
                >
                  Browse More Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Awaiting PIN screen ───────────────────────────────────────────────────

  if (paymentStep === 'awaiting_pin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full p-8 text-center">

          {/* Pulsing phone icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-orange-100 animate-ping opacity-40" />
            <div className="relative w-20 h-20 rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center">
              <Smartphone className="w-9 h-9 text-orange-500" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your phone</h2>
          <p className="text-gray-500 text-sm mb-1">{statusMessage}</p>
          <p className="text-sm text-gray-400 mb-8">
            Enter your M-Pesa PIN to pay{' '}
            <span className="font-bold text-orange-600">
              KES {(orderTotal ?? calculateTotal()).toLocaleString()}
            </span>
          </p>

          {/* Steps */}
          <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left space-y-2">
            {[
              'An M-Pesa prompt has been sent to your phone',
              'Open the prompt and enter your M-Pesa PIN',
              "We'll confirm your booking automatically",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-200 text-orange-700 font-bold text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-orange-800">{step}</span>
              </div>
            ))}
          </div>

          {/* Spinner */}
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
            Waiting for confirmation…
          </div>

          <button
            onClick={() => { cancelPollRef.current?.(); setPaymentStep('form'); setErrors({}); }}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            Cancel and try again
          </button>
        </div>
      </div>
    );
  }

  // ── Failed screen (inline on form via errors.general, but also shown standalone) ──

  // ── Main checkout form ────────────────────────────────────────────────────

  return (
    <>
      <CheckoutSEO />
      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => {
                const route = isAuthenticated
                  ? `/browse-events/${event.slug}`
                  : `/events/${event.slug}`;
                // Rebuild selectedTickets map so the event page can restore the stepper
                const selectedTickets = Object.fromEntries(
                  bookingData?.tickets.map(t => [t.ticket_type_id, t.quantity]) ?? []
                );
                navigate(route, { state: { selectedTickets } });
              }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-orange-600 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Event
            </button>
            {/* Secure badge */}
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <Lock className="w-3.5 h-3.5" /> Secure checkout
            </span>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-500 text-sm mt-1">
              {totalTickets()} ticket{totalTickets() !== 1 ? 's' : ''} for{' '}
              <span className="font-medium text-gray-700">{event.title}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* ── Left col: payment details ──────────────────────────────── */}
            <div className="lg:col-span-3 space-y-5">

              {/* General error */}
              {errors.general && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-0.5">Payment failed</p>
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Who's buying — compact read-only strip */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Booking for</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm">
                      {(user?.name ?? 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Payment method selector — hidden for free events */}
              {!isFree && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Payment Method</h2>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* M-Pesa option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === 'mpesa'
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'mpesa' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Phone className={`w-4 h-4 ${paymentMethod === 'mpesa' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold leading-tight ${paymentMethod === 'mpesa' ? 'text-gray-900' : 'text-gray-500'}`}>
                        M-Pesa
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">STK Push</p>
                    </div>
                  </button>

                  {/* Card option — coming soon */}
                  <div className="relative flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed select-none">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 leading-tight">Card</p>
                      <p className="text-xs text-gray-400 mt-0.5">Visa / Mastercard</p>
                    </div>
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wide">
                      Soon
                    </span>
                  </div>
                </div>

                {/* M-Pesa phone input */}
                {paymentMethod === 'mpesa' && (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => {
                        setPhoneNumber(e.target.value);
                        setErrors(p => ({ ...p, phoneNumber: undefined }));
                      }}
                      placeholder="+254712345678"
                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:ring-0 ${
                        errors.phoneNumber
                          ? 'border-red-400 bg-red-50 focus:border-red-500'
                          : 'border-gray-200 focus:border-orange-400'
                      }`}
                    />
                    {errors.phoneNumber ? (
                      <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errors.phoneNumber}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-gray-400">
                        Accepts Safaricom numbers: 07xx or +2547xx
                      </p>
                    )}

                    {/* How it works */}
                    <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                      {[
                        'Click "Pay now" — an STK push will appear on your phone',
                        'Enter your M-Pesa PIN to confirm',
                        'Your tickets are sent to your email instantly',
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-gray-500">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>}

            </div>

            {/* ── Right col: order summary (sticky) ─────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">

                {/* Event thumbnail strip */}
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={event.flyer_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-bold text-sm leading-tight line-clamp-1">{event.title}</p>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Event meta */}
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      {formatDate(event.start_time)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      {formatTime(event.start_time)}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      {event.venue}
                    </p>
                  </div>

                  {/* Ticket lines */}
                  <div className="border-t border-gray-100 pt-4 space-y-2.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Order Summary</p>
                    {bookingData.tickets.map((ticket, i) => (
                      <div key={i} className="flex items-start justify-between gap-2 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{ticket.name}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.quantity} × KES {ticket.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-800 flex-shrink-0">
                          KES {(ticket.quantity * ticket.price).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-gray-100 pt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">
                      Total
                      <span className="ml-1.5 text-xs font-normal text-gray-400">
                        ({totalTickets()} ticket{totalTickets() !== 1 ? 's' : ''})
                      </span>
                    </span>
                    {isFree ? (
                      <span className="text-xl font-bold text-green-600">FREE</span>
                    ) : (
                      <span className="text-xl font-bold text-orange-600">
                        KES {calculateTotal().toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Terms — lives here so it's always visible directly above the CTA on every screen size */}
                  <div className={`rounded-xl border p-3.5 transition-colors ${
                    errors.terms ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={e => {
                          setAgreed(e.target.checked);
                          setErrors(p => ({ ...p, terms: undefined }));
                        }}
                        className="mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0 accent-orange-500"
                      />
                      <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setModalContent('terms')}
                          className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2"
                        >
                          Terms &amp; Conditions
                        </button>
                        {' '}and{' '}
                        <button
                          type="button"
                          onClick={() => setModalContent('refund')}
                          className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2"
                        >
                          Refund Policy
                        </button>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="mt-2 text-xs text-red-600 flex items-center gap-1 pl-6">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting || paymentStep !== 'form'}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing…
                      </>
                    ) : isFree ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Free Booking
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Pay KES {calculateTotal().toLocaleString()}
                      </>
                    )}
                  </button>

                  {/* Trust badge */}
                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    Secured by MGLTickets · M-Pesa
                  </p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ── Legal Modal ───────────────────────────────────────────────────── */}
      {modalContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setModalContent(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  {modalContent === 'terms'
                    ? <FileText className="w-4 h-4 text-orange-600" />
                    : <RefreshCw className="w-4 h-4 text-orange-600" />}
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {modalContent === 'terms' ? 'Terms & Conditions' : 'Refund Policy'}
                </h2>
              </div>
              <button
                onClick={() => setModalContent(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1">
              {modalContent === 'terms' ? <TermsContent /> : <RefundContent />}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400">Read the full policy before agreeing</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setModalContent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setAgreed(true);
                    setErrors(p => ({ ...p, terms: undefined }));
                    setModalContent(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutBookingPage;