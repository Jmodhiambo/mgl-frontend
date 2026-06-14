// src/apps/user/pages/Checkout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ShieldCheck, Ticket, Phone,
  CheckCircle, AlertCircle, ChevronLeft, X, FileText, RefreshCw, Loader2,
} from 'lucide-react';
import { CheckoutSEO, BookingSEO } from '@shared/components/SEO';
import { TermsContent, RefundContent } from '@shared/pages';
import { useAuth } from '@shared/contexts/AuthContext';
import { createOrder } from '@shared/api/user/bookingsApi';
import { initiateMpesaPayment, pollPaymentStatus } from '@shared/api/user/paymentsApi';

interface Event {
  id: number;
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

// Payment step shown in UI after STK push is sent
type PaymentStep = 'form' | 'awaiting_pin' | 'complete' | 'failed';

const CheckoutBookingPage: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [event, setEvent]             = useState<Event | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreedToTerms, setAgreed]    = useState(false);
  const [errors, setErrors]           = useState<FormErrors>({});
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('form');
  const [paymentId, setPaymentId]     = useState<number | null>(null);
  const [orderTotal, setOrderTotal]   = useState<number | null>(null);
  const [modalContent, setModalContent] = useState<'terms' | 'refund' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Store poll cancel fn so we can clean up on unmount
  const cancelPollRef = useRef<(() => void) | null>(null);
  useEffect(() => () => { cancelPollRef.current?.(); }, []);

  useEffect(() => {
    document.title = 'Checkout - MGLTickets';
    const state = location.state as { bookingData?: BookingData; event?: Event };
    if (!state?.bookingData || !state?.event) { navigate('/events'); return; }
    setBookingData(state.bookingData);
    setEvent(state.event);
    // Pre-fill phone from user profile if available
    if (user?.phone_number) setPhoneNumber(user.phone_number);
  }, [location, navigate, user]);

  const calculateSubtotal = () =>
    bookingData?.tickets.reduce((s, t) => s + t.price * t.quantity, 0) ?? 0;

  // No processing fee — total equals the subtotal of selected tickets.
  const calculateTotal = () => calculateSubtotal();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Invalid Kenyan phone number format';
    }
    if (!agreedToTerms) newErrors.terms = 'You must agree to the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm() || !bookingData || !event) return;
    setPaymentStep('form');
    setErrors({});

    try {
      // 1. Create the order — one Booking row per ticket type, created
      //    atomically by the backend. Pricing is computed server-side
      //    from current TicketType prices —
      //    calculateTotal() below is only used for the on-screen estimate
      //    before checkout; the amount actually charged is order.total_price.
      const order = await createOrder({
        event_id: event.id,
        items: bookingData.tickets.map(t => ({
          ticket_type_id: t.ticket_type_id,
          quantity: t.quantity,
        })),
      });

      // 2. Initiate M-Pesa STK push for the WHOLE order
      //    (covers every ticket type in one payment / one PIN prompt)
      const stkResponse = await initiateMpesaPayment({
        order_id: order.id,
        phone_number: phoneNumber.trim(),
      });

      setOrderTotal(order.total_price);  // backend-computed authoritative total
      setPaymentId(stkResponse.payment_id);
      setPaymentStep('awaiting_pin');
      setStatusMessage(stkResponse.message);

      // 3. Start polling for payment result
      const cancelPoll = pollPaymentStatus(stkResponse.payment_id, {
        onPending: () =>
          setStatusMessage('Waiting for M-PESA confirmation...'),
        onComplete: () => {
          setPaymentStep('complete');
        },
        onFailed: () => {
          setPaymentStep('failed');
          setErrors({ general: 'Payment failed or was cancelled. Please try again.' });
        },
        onTimeout: () => {
          setPaymentStep('failed');
          setErrors({ general: 'Payment confirmation timed out. Check your M-PESA messages and contact support if charged.' });
        },
        intervalMs: 3000,
        maxAttempts: 10,
      });

      cancelPollRef.current = cancelPoll;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process payment. Please try again.';
      setErrors({ general: msg });
      setPaymentStep('form');
    }
  };

  if (!bookingData || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // ── Booking complete screen ────────────────────────────────────────────────
  if (paymentStep === 'complete') {
    return (
      <>
        <BookingSEO />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your tickets have been sent to {user?.email}</p>
            <div className="bg-orange-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-medium text-gray-800">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tickets:</span>
                  <span className="font-medium text-gray-800">
                    {bookingData.tickets.reduce((s, t) => s + t.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-bold text-orange-600">
                    KES {(orderTotal ?? calculateTotal()).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/my-tickets')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                View My Tickets
              </button>
              <button
                onClick={() => navigate('/browse-events')}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Awaiting PIN screen ────────────────────────────────────────────────────
  if (paymentStep === 'awaiting_pin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Check Your Phone</h2>
          <p className="text-gray-600 mb-2">{statusMessage}</p>
          <p className="text-sm text-gray-500 mb-8">
            Enter your M-PESA PIN to complete the payment of{' '}
            <span className="font-bold text-orange-600">
              KES {(orderTotal ?? calculateTotal()).toLocaleString()}
            </span>
          </p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
            <span className="text-sm text-gray-600">Waiting for confirmation...</span>
          </div>
          <button
            onClick={() => { cancelPollRef.current?.(); setPaymentStep('form'); }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel and try again
          </button>
        </div>
      </div>
    );
  }

  // ── Main checkout form ─────────────────────────────────────────────────────
  return (
    <>
      <CheckoutSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <header className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(`/events/${event.id}`)}
              className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Back to Event Details
            </button>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h2>
            <p className="text-gray-600">Complete your booking in a few simple steps</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Contact + Payment method */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user?.name ?? ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">M-PESA Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => { setPhoneNumber(e.target.value); setErrors(p => ({ ...p, phoneNumber: undefined })); }}
                      placeholder="+254712345678"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* M-Pesa info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h3>
                <div className="border-2 border-orange-500 bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">M-PESA</div>
                      <div className="text-sm text-gray-600">Pay via M-PESA STK Push</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">How M-PESA payment works:</p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700">
                        <li>Enter your M-PESA phone number above</li>
                        <li>Click "Complete Payment" — you'll receive an STK push</li>
                        <li>Enter your M-PESA PIN on your phone</li>
                        <li>Tickets will be sent to your email instantly</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}
            </div>

            {/* Right — Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>

                <div className="mb-6">
                  <img src={event.flyer_url} alt={event.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" />{formatDate(event.start_time)}</div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2" />{formatTime(event.start_time)}</div>
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" />{event.venue}</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Tickets</h4>
                  <div className="space-y-3">
                    {bookingData.tickets.map((ticket, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div>
                          <div className="font-medium text-gray-800">{ticket.name}</div>
                          <div className="text-gray-600">{ticket.quantity} × KES {ticket.price.toLocaleString()}</div>
                        </div>
                        <div className="font-semibold text-gray-800">
                          KES {(ticket.quantity * ticket.price).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between font-bold text-gray-800 text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">KES {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={paymentStep !== 'form'}
                  className="w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="w-5 h-5 mr-2" /> Complete Payment
                </button>

                {/* Terms checkbox */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={e => { setAgreed(e.target.checked); setErrors(p => ({ ...p, terms: undefined })); }}
                      className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <button type="button" onClick={() => setModalContent('terms')}
                        className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2">
                        Terms &amp; Conditions
                      </button>
                      {' '}and{' '}
                      <button type="button" onClick={() => setModalContent('refund')}
                        className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2">
                        Refund Policy
                      </button>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1 pl-7">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errors.terms}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 mr-1" /> Secure payment powered by MGLTickets
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Legal Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalContent(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  {modalContent === 'terms' ? <FileText className="w-4 h-4 text-orange-600" /> : <RefreshCw className="w-4 h-4 text-orange-600" />}
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {modalContent === 'terms' ? 'Terms & Conditions' : 'Refund Policy'}
                </h2>
              </div>
              <button onClick={() => setModalContent(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {modalContent === 'terms' ? <TermsContent /> : <RefundContent />}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">Read the full policy before agreeing</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setModalContent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Close
                </button>
                <button
                  onClick={() => { setAgreed(true); setErrors(p => ({ ...p, terms: undefined })); setModalContent(null); }}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700">
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