import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Search, Filter, Clock, TrendingUp, ArrowRight, Ticket, Users, Star } from 'lucide-react';
import Footer from '@shared/components/navigation/Footer';

interface Event {
  id: number;
  title: string;
  venue: string;
  start_time: string;
  end_time: string;
  flyer_url: string;
  description: string;
  organizer_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterVenue, setFilterVenue] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Home - MGLTickets';
    const fetchEvents = async (): Promise<void> => {
      try {
        // Replace with: const response = await fetch('/api/events');
        // const data: Event[] = await response.json();
        
        // Simulated data
        const mockEvents: Event[] = [
          {
            id: 1,
            title: "Summer Music Festival 2025",
            venue: "Kasarani Stadium, Nairobi",
            start_time: "2025-07-15T14:00:00Z",
            end_time: "2025-07-15T23:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
            description: "The biggest music festival of the year featuring top artists from across Africa",
            organizer_id: 1,
            status: "approved",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z"
          },
          {
            id: 2,
            title: "Tech Conference 2025",
            venue: "KICC, Nairobi",
            start_time: "2025-08-20T09:00:00Z",
            end_time: "2025-08-22T18:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            description: "Connect with tech leaders and innovators in East Africa",
            organizer_id: 1,
            status: "approved",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z"
          },
          {
            id: 3,
            title: "Food & Wine Expo",
            venue: "Villa Rosa Kempinski, Nairobi",
            start_time: "2025-09-10T12:00:00Z",
            end_time: "2025-09-10T20:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
            description: "Experience the finest culinary delights and premium wines",
            organizer_id: 1,
            status: "approved",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z"
          },
          {
            id: 4,
            title: "Art Exhibition Opening",
            venue: "National Museum, Nairobi",
            start_time: "2025-07-25T16:00:00Z",
            end_time: "2025-07-25T21:00:00Z",
            flyer_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
            description: "Contemporary African art showcase featuring local and international artists",
            organizer_id: 1,
            status: "approved",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z"
          },
        ];
        
        setEvents(mockEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
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

const formatEventDateRange = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const startDate = start.toDateString();
  const endDate = end.toDateString();
  
  // Same day event
  if (startDate === endDate) {
    return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  // Multi-day event
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return `${startStr} - ${endStr}`;
};

const formatTimeRange = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const startTimeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  return `${startTimeStr} - ${endTimeStr}`;
};
  

  const filteredEvents: Event[] = events.filter((event: Event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVenue = filterVenue === '' || event.venue.toLowerCase().includes(filterVenue.toLowerCase());
    return matchesSearch && matchesVenue;
  });

  const handleGetStarted = () => {
    // Navigate to register page
    window.location.href = '/register';
  };

  const handleLogin = () => {
    // Navigate to login page
    window.location.href = '/login';
  };

  const handleViewEvent = (eventId: number) => {
    // Navigate to event details
    window.location.href = `/events/${eventId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-orange">
                MGLTickets
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#events" className="text-gray-600 hover:text-orange-600 font-medium">Events</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-orange-600 font-medium">How It Works</a>
              <a href="#features" className="text-gray-600 hover:text-orange-600 font-medium">Features</a>
            </nav>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleLogin}
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Events Section */}
      <div id="events" className="py-20 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Featured Events</h3>
            <p className="text-gray-600 text-lg">Discover amazing events happening near you</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, venues..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <button className="md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all">
                Search
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredEvents.slice(0, 4).map((event: Event) => (
                <div
                  key={event.id}
                  onClick={() => handleViewEvent(event.id)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.flyer_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      {formatDate(event.start_time)}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {event.title}
                    </h4>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="font-medium">{formatEventDateRange(event.start_time, event.end_time)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        <span>{formatTimeRange(event.start_time, event.end_time)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button 
              onClick={() => window.location.href = '/events'}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-md inline-flex items-center gap-2"
            >
              View All Events
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Your Gateway to Unforgettable Events
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Discover, book, and experience the best events in Kenya. From concerts to conferences, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted}
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-800 transition-all flex items-center justify-center gap-2"
              >
                Browse Events
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">10K+</div>
              <div className="text-gray-600">Events Hosted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">50K+</div>
              <div className="text-gray-600">Happy Attendees</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Event Organizers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Why Choose MGLTickets?</h3>
            <p className="text-gray-600 text-lg">Everything you need for a seamless event experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Ticket className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Easy Booking</h4>
              <p className="text-gray-600">Book tickets in seconds with our streamlined checkout process. No hassle, just simple clicks.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Secure Payments</h4>
              <p className="text-gray-600">Pay safely with M-PESA integration. Your transactions are encrypted and protected.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Digital Tickets</h4>
              <p className="text-gray-600">Get instant digital tickets with QR codes. Access your tickets anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
            <p className="text-orange-100 text-lg">Get started in just 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Browse Events</h4>
              <p className="text-orange-100">Discover exciting events happening in your area</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Book Tickets</h4>
              <p className="text-orange-100">Select your tickets and checkout securely</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Enjoy the Event</h4>
              <p className="text-orange-100">Present your digital ticket and have a great time!</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 text-lg mb-8">
            Join thousands of event-goers who trust MGLTickets for their event needs
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg text-lg inline-flex items-center gap-2"
          >
            Create Your Account
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;