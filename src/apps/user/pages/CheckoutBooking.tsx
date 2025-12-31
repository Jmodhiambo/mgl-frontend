import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, CreditCard, ShieldCheck, Ticket, Phone, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';

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

interface UserInfo {
  name: string;
  email: string;
  phone: string;
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

type PaymentMethod = 'mpesa' | 'card';

const CheckoutBookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bookingComplete, setBookingComplete] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    // Get booking data from navigation state
    const state = location.state as { bookingData?: BookingData; event?: Event };
    
    if (!state?.bookingData || !state?.event) {
      navigate('/events');
      return;
    }

    setBookingData(state.bookingData);
    setEvent(state.event);

    // TODO: Fetch user info from API
    // const fetchUserInfo = async () => {
    //   const response = await fetch('/api/users/me', {
    //     headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    //   });
    //   const data = await response.json();
    //   setUserInfo(data);
    //   setPhoneNumber(data.phone);
    // };
    // fetchUserInfo();

    // Mock user data
    const mockUser: UserInfo = {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+254712345678"
    };
    setUserInfo(mockUser);
    setPhoneNumber(mockUser.phone);
  }, [location, navigate]);

  const calculateSubtotal = (): number => {
    if (!bookingData) return 0;
    return bookingData.tickets.reduce((sum: number, ticket: TicketItem) => 
      sum + (ticket.price * ticket.quantity), 0
    );
  };

  const calculateFees = (): number => {
    return Math.round(calculateSubtotal() * 0.03);
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateFees();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!phoneNumber || phoneNumber.trim() === '') {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Invalid Kenyan phone number format';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Replace with actual API calls
      // 1. Create booking
      // const bookingResponse = await fetch('/api/users/me/bookings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   },
      //   body: JSON.stringify({
      //     user_id: userId,
      //     ticket_type_id: bookingData.tickets[0].ticket_type_id,
      //     quantity: bookingData.tickets.reduce((sum, t) => sum + t.quantity, 0),
      //     total_price: calculateTotal()
      //   })
      // });
      // const booking = await bookingResponse.json();
      
      // 2. Create payment
      // const paymentResponse = await fetch('/api/users/me/payments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   },
      //   body: JSON.stringify({
      //     booking_id: booking.id,
      //     amount: calculateTotal(),
      //     currency: 'KES',
      //     method: paymentMethod,
      //     mpesa_ref: 'generated-ref'
      //   })
      // });

      await new Promise(resolve => setTimeout(resolve, 2000));
      setBookingComplete(true);
    } catch (error) {
      console.error('Checkout error:', error);
      setErrors({ general: 'Failed to process payment. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your tickets have been sent to {userInfo.email}
          </p>
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
                  {bookingData.tickets.reduce((sum: number, t: TicketItem) => sum + t.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-bold text-orange-600">KES {calculateTotal().toLocaleString()}</span>
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
              onClick={() => navigate('/events')}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Event Details
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h2>
          <p className="text-gray-600">Complete your booking in a few simple steps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userInfo.name}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={userInfo.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPhoneNumber(e.target.value);
                      setErrors({ ...errors, phoneNumber: undefined });
                    }}
                    placeholder="+254712345678"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h3>
              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">M-PESA</div>
                        <div className="text-sm text-gray-600">Pay via M-PESA STK Push</div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'mpesa'
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'mpesa' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all opacity-50 ${
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Coming soon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">How M-PESA payment works:</p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700">
                        <li>Enter your M-PESA phone number</li>
                        <li>You'll receive an STK push on your phone</li>
                        <li>Enter your M-PESA PIN to complete payment</li>
                        <li>Tickets will be sent to your email instantly</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAgreedToTerms(e.target.checked);
                    setErrors({ ...errors, terms: undefined });
                  }}
                  className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                    Refund Policy
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-600 flex items-center ml-8">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.terms}
                </p>
              )}
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>

              {/* Event Info */}
              <div className="mb-6">
                <img
                  src={event.flyer_url}
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(event.start_time)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatTime(event.start_time)}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.venue}
                  </div>
                </div>
              </div>

              {/* Tickets */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Tickets</h4>
                <div className="space-y-3">
                  {bookingData.tickets.map((ticket: TicketItem, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium text-gray-800">{ticket.name}</div>
                        <div className="text-gray-600">
                          {ticket.quantity} × KES {ticket.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="font-semibold text-gray-800">
                        KES {(ticket.quantity * ticket.price).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>KES {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Processing Fee</span>
                  <span>KES {calculateFees().toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800 text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">KES {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Complete Payment
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Secure payment powered by MGLTickets
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutBookingPage;