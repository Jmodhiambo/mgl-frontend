// src/apps/user/pages/OrderDetail.tsx
// ─────────────────────────────────────────────────────────────────────────────
//
// Destination for the retry_url in the payment_failed email, and for the
// "View Order" links on Checkout's stuck/reported/failed screens. Deliberately
// separate from My Tickets — an order can be sitting unpaid with nothing to
// show on My Tickets yet, so sending a failed-payment user there was a dead
// end. This page is where they actually resolve it.
//
// Two independent actions are available any time the order is 'pending',
// not gated behind a live checkout attempt:
//   - Retry Payment: fires a fresh STK push for this same order.
//   - Report M-Pesa Code: for "I was definitely charged" cases — queues the
//     payment for admin review on the Orders page. Available as long as
//     there's a payment on this order that isn't already completed or
//     already under review.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft,
  Loader2, RefreshCw, Smartphone, ShieldCheck, MessageSquareWarning, KeyRound,
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { fetchUserOrdersEnriched } from '@user/services/dashboardService';
import type { UserOrderEnriched } from '@user/services/dashboardService';
import { getEventById } from '@user/services/eventService';
import {
  initiateMpesaPayment, pollPaymentStatus, checkPaymentStatus, reportManualPayment,
  getPaymentsByOrder,
} from '@shared/api/user/paymentsApi';
import type { PaymentOut } from '@shared/api/user/paymentsApi';
import { formatDate, formatTime } from '@shared/utils/format';
import { parseApiError } from '@shared/utils/parseApiError';

type FlowStep = 'idle' | 'awaiting_pin' | 'stuck' | 'reported' | 'complete' | 'failed';

interface EventDetail {
  venue: string;
  start_time: string;
  flyer_url?: string;
}

interface FormErrors {
  phoneNumber?: string;
  mpesaCode?: string;
  general?: string;
}

const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
};

const OrderDetailPage: React.FC = () => {
  const { orderId: orderIdParam } = useParams<{ orderId: string }>();
  const orderId = Number(orderIdParam);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [order, setOrder]             = useState<UserOrderEnriched | null>(null);
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [payments, setPayments]       = useState<PaymentOut[]>([]);

  const [flowStep, setFlowStep]       = useState<FlowStep>('idle');
  const [activePaymentId, setActivePaymentId] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [stuckMessage, setStuckMessage]   = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showReportForm, setShowReportForm]     = useState(false);
  const [mpesaCode, setMpesaCode]         = useState('');
  const [isReporting, setIsReporting]     = useState(false);
  const [errors, setErrors]               = useState<FormErrors>({});

  const cancelPollRef = useRef<(() => void) | null>(null);
  useEffect(() => () => { cancelPollRef.current?.(); }, []);

  const latestPayment = payments.length
    ? [...payments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  const currentPaymentId = activePaymentId ?? latestPayment?.id ?? null;

  const canReport = !!latestPayment
    && latestPayment.status !== 'completed'
    && latestPayment.manual_review_status !== 'pending';

  useEffect(() => {
    document.title = 'Order Details – MGLTickets';
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const orders = await fetchUserOrdersEnriched();
        const found = orders.find(o => o.id === orderId);
        if (!found) { if (!cancelled) { setNotFound(true); setLoading(false); } return; }
        if (cancelled) return;

        setOrder(found);
        setPhoneNumber(found.mpesa_phone ?? user?.phone_number ?? '');

        const [event, pmts] = await Promise.all([
          getEventById(found.event_id).catch(() => null),
          getPaymentsByOrder(found.id).catch(() => []),
        ]);
        if (cancelled) return;

        if (event) {
          setEventDetail({ venue: event.venue, start_time: event.start_time, flyer_url: event.flyer_url });
        }
        setPayments(pmts);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [orderId, user]);

  // ── Payment actions ────────────────────────────────────────────────────────

  const validatePhone = (): boolean => {
    if (!/^(\+254|0)[17]\d{8}$/.test(phoneNumber.trim())) {
      setErrors(p => ({ ...p, phoneNumber: 'Enter a valid Kenyan number (e.g. +254712345678 or 0712345678)' }));
      return false;
    }
    setErrors(p => ({ ...p, phoneNumber: undefined }));
    return true;
  };

  const validateMpesaCode = (): boolean => {
    const code = mpesaCode.trim();
    if (!code) {
      setErrors(p => ({ ...p, mpesaCode: 'Enter the M-Pesa code from your confirmation SMS' }));
      return false;
    }
    if (code.length < 6 || code.length > 20) {
      setErrors(p => ({ ...p, mpesaCode: 'That doesn\'t look like a valid M-Pesa code' }));
      return false;
    }
    setErrors(p => ({ ...p, mpesaCode: undefined }));
    return true;
  };

  const handleTimeout = async (paymentId: number) => {
    try {
      const result = await checkPaymentStatus(paymentId);
      if (result.resolved && result.status === 'completed') { setFlowStep('complete'); return; }
      if (result.resolved && result.status === 'failed') {
        setFlowStep('failed');
        setErrors({ general: result.message || 'Payment failed or was cancelled. Please try again.' });
        return;
      }
      setStuckMessage(result.message || "We haven't heard back from M-Pesa yet.");
      setFlowStep('stuck');
    } catch {
      setStuckMessage("We couldn't reach M-Pesa to confirm your payment.");
      setFlowStep('stuck');
    }
  };

  const handleRetryPayment = async () => {
    if (!order || !validatePhone()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      const stk = await initiateMpesaPayment({ order_id: order.id, phone_number: phoneNumber.trim() });

      if (stk.checkout_request_id === null) {
        setFlowStep('complete');
        return;
      }

      setActivePaymentId(stk.payment_id);
      setFlowStep('awaiting_pin');
      setStatusMessage(stk.message);

      const cancel = pollPaymentStatus(stk.payment_id, {
        onPending: () => setStatusMessage('Waiting for M-Pesa confirmation…'),
        onComplete: () => setFlowStep('complete'),
        onFailed: () => {
          setFlowStep('failed');
          setErrors({ general: 'Payment failed or was cancelled. Please try again.' });
        },
        onTimeout: () => handleTimeout(stk.payment_id),
        intervalMs: 3000,
        maxAttempts: 30,
      });
      cancelPollRef.current = cancel;
    } catch (err: any) {
      setErrors({ general: parseApiError(err, 'Failed to initiate payment. Please try again.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckAgain = async () => {
    if (!currentPaymentId) return;
    setIsCheckingStatus(true);
    try {
      const result = await checkPaymentStatus(currentPaymentId);
      if (result.resolved && result.status === 'completed') { setFlowStep('complete'); return; }
      if (result.resolved && result.status === 'failed') {
        setFlowStep('failed');
        setErrors({ general: result.message || 'Payment failed or was cancelled. Please try again.' });
        return;
      }
      setStuckMessage(result.message || 'Still waiting on M-Pesa — this can take a few minutes.');
    } catch {
      setStuckMessage("We couldn't reach M-Pesa just now. Try again shortly.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!validateMpesaCode() || !currentPaymentId) return;
    setIsReporting(true);
    setErrors(p => ({ ...p, general: undefined }));
    try {
      await reportManualPayment({
        payment_id: currentPaymentId,
        mpesa_code: mpesaCode.trim().toUpperCase(),
        phone_number: phoneNumber.trim() || undefined,
      });
      setFlowStep('reported');
    } catch (err: any) {
      setErrors({ general: parseApiError(err, 'Could not submit your M-Pesa code. Please try again.') });
    } finally {
      setIsReporting(false);
    }
  };

  // ── Loading / not found ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-500 text-sm mb-6">
            We couldn't find this order, or it doesn't belong to your account.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalTickets = order.bookings.reduce((s, b) => s + b.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-orange-600 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── Order summary ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {eventDetail?.flyer_url && (
            <div className="relative h-32 overflow-hidden">
              <img src={eventDetail.flyer_url} alt={order.event_title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-white font-bold leading-tight">{order.event_title}</p>
              </div>
            </div>
          )}

          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {!eventDetail?.flyer_url && (
                  <h1 className="text-lg font-bold text-gray-900 truncate">{order.event_title}</h1>
                )}
                <p className="text-xs text-gray-400 mt-0.5">Order #{order.id}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0 ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {order.status}
              </span>
            </div>

            {eventDetail && (
              <div className="space-y-1.5 text-xs text-gray-500">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" /> {formatDate(eventDetail.start_time)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" /> {formatTime(eventDetail.start_time)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" /> {eventDetail.venue}
                </p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {totalTickets} ticket{totalTickets !== 1 ? 's' : ''}
              </p>
              {order.bookings.map(b => (
                <div key={b.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{b.quantity}× {b.ticket_type_name}</span>
                  <span className="font-medium text-gray-800">KES {b.total_price.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100 mt-1">
                <span className="text-gray-800">Total</span>
                <span className="text-orange-600">KES {order.total_price.toLocaleString()}</span>
              </div>
            </div>

            {latestPayment?.mpesa_ref && (
              <p className="text-xs text-gray-400 font-mono">M-Pesa Ref: {latestPayment.mpesa_ref}</p>
            )}
          </div>
        </div>

        {/* ── Confirmed ── */}
        {order.status === 'confirmed' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="font-bold text-gray-900 mb-1">This order is confirmed</h2>
            <p className="text-sm text-gray-500 mb-5">Your tickets are ready.</p>
            <button
              onClick={() => navigate('/my-tickets')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              View My Tickets
            </button>
          </div>
        )}

        {/* ── Cancelled ── */}
        {order.status === 'cancelled' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="font-bold text-gray-900 mb-1">This order was cancelled</h2>
            <p className="text-sm text-gray-500">Contact support if you think this is a mistake.</p>
          </div>
        )}

        {/* ── Pending: action panel ── */}
        {order.status === 'pending' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            {errors.general && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {latestPayment?.manual_review_status === 'pending' && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
                <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Your M-Pesa code is with our team for verification — you'll get an email once it's confirmed.
                </p>
              </div>
            )}

            {flowStep === 'idle' && (
              <>
                <h2 className="font-bold text-gray-900 mb-4">Retry Payment</h2>
                <label className="block text-sm font-semibold text-gray-700 mb-2">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => { setPhoneNumber(e.target.value); setErrors(p => ({ ...p, phoneNumber: undefined })); }}
                  placeholder="+254712345678"
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:ring-0 ${
                    errors.phoneNumber ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-orange-400'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errors.phoneNumber}
                  </p>
                )}
                <button
                  onClick={handleRetryPayment}
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> Pay KES {order.total_price.toLocaleString()}</>
                  )}
                </button>

                {canReport && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    {!showReportForm ? (
                      <button
                        onClick={() => setShowReportForm(true)}
                        className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2"
                      >
                        <KeyRound className="w-4 h-4" /> Already paid? Report your M-Pesa code
                      </button>
                    ) : (
                      <div className="text-left space-y-3">
                        <p className="text-xs text-gray-500">
                          Enter the M-Pesa code from your confirmation SMS (e.g.{' '}
                          <span className="font-mono">QGH7XXXXXX</span>). Our team will verify it against
                          M-Pesa's records — this isn't instant.
                        </p>
                        <input
                          type="text"
                          value={mpesaCode}
                          onChange={e => { setMpesaCode(e.target.value); setErrors(p => ({ ...p, mpesaCode: undefined })); }}
                          placeholder="QGH7XXXXXX"
                          className={`w-full px-4 py-3 rounded-xl border-2 text-sm uppercase tracking-wide transition-colors focus:outline-none focus:ring-0 ${
                            errors.mpesaCode ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-orange-400'
                          }`}
                        />
                        {errors.mpesaCode && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errors.mpesaCode}
                          </p>
                        )}
                        <button
                          onClick={handleSubmitReport}
                          disabled={isReporting}
                          className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          {isReporting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                          ) : 'Submit for review'}
                        </button>
                        <button
                          onClick={() => { setShowReportForm(false); setErrors(p => ({ ...p, mpesaCode: undefined })); }}
                          className="w-full text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {flowStep === 'awaiting_pin' && (
              <div className="text-center py-4">
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-orange-100 animate-ping opacity-40" />
                  <div className="relative w-16 h-16 rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center">
                    <Smartphone className="w-7 h-7 text-orange-500" />
                  </div>
                </div>
                <h2 className="font-bold text-gray-900 mb-1">Check your phone</h2>
                <p className="text-sm text-gray-500 mb-5">{statusMessage}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 text-orange-500 animate-spin" /> Waiting for confirmation…
                </div>
              </div>
            )}

            {flowStep === 'stuck' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquareWarning className="w-7 h-7 text-amber-500" />
                </div>
                <h2 className="font-bold text-gray-900 mb-1">Still confirming…</h2>
                <p className="text-sm text-gray-500 mb-5">{stuckMessage}</p>
                <div className="space-y-3 max-w-xs mx-auto">
                  <button
                    onClick={handleCheckAgain}
                    disabled={isCheckingStatus}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    {isCheckingStatus ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
                    ) : (
                      <><RefreshCw className="w-4 h-4" /> Check again</>
                    )}
                  </button>
                  <button
                    onClick={() => setFlowStep('idle')}
                    className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {flowStep === 'reported' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7 text-blue-500" />
                </div>
                <h2 className="font-bold text-gray-900 mb-1">Code submitted</h2>
                <p className="text-sm text-gray-500">
                  We've received your M-Pesa code — you'll get an email once it's confirmed.
                </p>
              </div>
            )}

            {flowStep === 'failed' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <h2 className="font-bold text-gray-900 mb-1">Payment didn't go through</h2>
                <button
                  onClick={() => { setFlowStep('idle'); setErrors({}); }}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {flowStep === 'complete' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
                <h2 className="font-bold text-gray-900 mb-1">You're going!</h2>
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  View My Tickets
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderDetailPage;