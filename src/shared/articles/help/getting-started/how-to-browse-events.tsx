// src/shared/articles/help/getting-started/how-to-browse-events.tsx
import React from 'react';
import { Search, SlidersHorizontal, MapPin, Calendar, Tag, Star, Info } from 'lucide-react';

const HowToBrowseEvents: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Whether you know exactly what you're looking for or just want to see what's happening
        nearby, MGLTickets gives you a few different ways to discover events.
      </p>

      {/* Search */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Search</h2>
        </div>
        <p className="text-gray-700 mb-4">
          The search bar at the top of every page looks up events by name, venue, or organizer.
          Start typing and matching events will appear as suggestions before you even hit enter.
        </p>
      </div>

      {/* Categories */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Browse by Category</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Events are grouped into categories like Music, Sports, Arts & Culture, Business, and
          Nightlife. Selecting a category from the homepage or navigation menu shows every
          upcoming event within it.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Filter Your Results</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Once you have a list of events, narrow it down using the filter panel:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <Calendar className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Date</h3>
            <p className="text-sm text-gray-600">Today, this weekend, or a custom date range</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <MapPin className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
            <p className="text-sm text-gray-600">Filter by city or venue</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <Tag className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Price</h3>
            <p className="text-sm text-gray-600">Set a minimum and maximum ticket price</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <Star className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Featured Events</h3>
            <p className="text-sm text-gray-600">Highlighted picks shown on the homepage</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium m-0">Pro Tip</p>
            <p className="text-blue-800 text-sm m-0 mt-1">
              Combine filters for faster results — for example, Music events in Nairobi under
              KES 2,000 happening this weekend.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HowToBrowseEvents;