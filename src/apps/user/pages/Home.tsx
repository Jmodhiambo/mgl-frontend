// src/apps/user/pages/Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Search,
  TrendingUp, ArrowRight, Ticket, Users, Star,
  ChevronRight, Zap, Shield,
} from 'lucide-react';
import { HomeSEO } from '@shared/components/SEO';
import { useAuth } from '@shared/contexts/AuthContext';
import { getLatestEvents } from '@user/services/eventService';
import type { EventOut } from '@shared/types/Event';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) {
    return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return (
    s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' – ' +
    e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
};

const formatTimeRange = (start: string, end: string): string =>
  new Date(start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) +
  ' – ' +
  new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// ─── Component ────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [events, setEvents]           = useState<EventOut[]>([]);
  const [filtered, setFiltered]       = useState<EventOut[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getLatestEvents(6);
      setEvents(data);
      setFiltered(data);
    } catch {
      // Home page degrades gracefully — events section just stays empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Home - MGLTickets';
    load();
  }, []);

  useEffect(() => {
    const q = searchTerm.toLowerCase();
    setFiltered(
      q
        ? events.filter(
            e =>
              e.title.toLowerCase().includes(q) ||
              e.venue.toLowerCase().includes(q),
          )
        : events,
    );
  }, [searchTerm, events]);

  const eventsRoute = isAuthenticated ? '/browse-events' : '/events';

  const handleViewEvent = (slug: string) => {
    navigate(isAuthenticated ? `/browse-events/${slug}` : `/events/${slug}`);
  };

  // ── Event card skeleton ────────────────────────────────────────────────────
  const EventSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-9 bg-gray-200 rounded-lg mt-2" />
      </div>
    </div>
  );

  return (
    <>
      <HomeSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10" />
          {/* Decorative blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-5 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white opacity-5 rounded-full" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Zap className="w-4 h-4" /> Kenya's #1 Event Ticketing Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Your Gateway to<br />Unforgettable Events
              </h1>
              <p className="text-xl text-orange-100 mb-10">
                Discover, book, and experience the best events in Kenya.
                From concerts to conferences, we've got you covered.
              </p>

              {/* Search bar */}
              <div className="relative max-w-xl mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, venues…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && navigate(eventsRoute)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/browse-events')}
                    className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Browse Events <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/register')}
                      className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      Get Started Free <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-800 transition-all flex items-center justify-center gap-2"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section className="bg-white py-12 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { value: '10K+', label: 'Events Hosted' },
                { value: '50K+', label: 'Happy Attendees' },
                { value: '500+', label: 'Event Organizers' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold text-orange-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Events ────────────────────────────────────────────────── */}
        <section id="events" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h2 className="text-3xl font-bold text-gray-800">Featured Events</h2>
                </div>
                <p className="text-gray-600">Handpicked events you don't want to miss</p>
              </div>
              <button
                onClick={() => navigate(eventsRoute)}
                className="hidden sm:flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Ticket size={56} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'No events match your search.' : 'No upcoming events right now.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleViewEvent(event.slug)}
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.flyer_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <p className="text-orange-600 font-bold text-sm">
                          {new Date(event.start_time).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                          <span className="font-medium">{formatDateRange(event.start_time, event.end_time)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                          <span>{formatTimeRange(event.start_time, event.end_time)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-md">
                        View Details <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <button
                onClick={() => navigate(eventsRoute)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-md inline-flex items-center gap-2"
              >
                View All Events <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose MGLTickets?</h2>
              <p className="text-gray-600 text-lg">Everything you need for a seamless event experience</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Ticket,
                  title: 'Easy Booking',
                  desc: 'Book tickets in seconds with our streamlined checkout process. No hassle, just simple clicks.',
                },
                {
                  icon: Shield,
                  title: 'Secure Payments',
                  desc: 'Pay safely with M-PESA integration. Your transactions are encrypted and protected.',
                },
                {
                  icon: Star,
                  title: 'Digital Tickets',
                  desc: 'Get instant digital tickets with QR codes. Access your tickets anytime, anywhere.',
                },
              ].map(f => (
                <div key={f.title} className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
                  <p className="text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-orange-100 text-lg">Get started in just 3 simple steps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: '1', title: 'Browse Events',  desc: 'Discover exciting events happening in your area' },
                { n: '2', title: 'Book Tickets',   desc: 'Select your tickets and checkout securely' },
                { n: '3', title: 'Enjoy the Event', desc: 'Present your digital ticket and have a great time!' },
              ].map(step => (
                <div key={step.n} className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">{step.n}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-orange-100">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        {!isAuthenticated && (
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
              <p className="text-gray-600 text-lg mb-8">
                Join thousands of event-goers who trust MGLTickets for their event needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg text-lg inline-flex items-center gap-2"
                >
                  Create Your Account <ArrowRight className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-orange-500 text-orange-600 px-12 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-all text-lg"
                >
                  Sign In
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default HomePage;