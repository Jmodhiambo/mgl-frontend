import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Edit, Trash2, Users, DollarSign, Eye, Plus, Search, Filter, MoreVertical, XCircle, CheckCircle } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  slug: string;
  venue: string;
  start_time: string;
  end_time: string;
  flyer_url: string;
  description: string;
  status: string;
  approved: boolean;
  rejected: boolean;
  created_at: string;
  bookings_count?: number;
  revenue?: number;
}

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, statusFilter]);

  const loadEvents = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    // const response = await getOrganizerEvents();
    
    const mockEvents: Event[] = [
      {
        id: 1,
        title: "Summer Music Festival 2025",
        slug: "summer-music-festival-2025",
        venue: "Kasarani Stadium, Nairobi",
        start_time: "2025-07-15T14:00:00Z",
        end_time: "2025-07-15T23:00:00Z",
        flyer_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400",
        description: "The biggest music festival of the year",
        status: "upcoming",
        approved: true,
        rejected: false,
        created_at: "2024-12-01T10:00:00Z",
        bookings_count: 89,
        revenue: 445000
      },
      {
        id: 2,
        title: "Tech Innovation Summit",
        slug: "tech-innovation-summit",
        venue: "KICC Nairobi",
        start_time: "2025-02-20T09:00:00Z",
        end_time: "2025-02-20T17:00:00Z",
        flyer_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
        description: "Discover the latest in technology",
        status: "upcoming",
        approved: true,
        rejected: false,
        created_at: "2024-12-05T10:00:00Z",
        bookings_count: 56,
        revenue: 280000
      },
      {
        id: 3,
        title: "Food & Wine Expo",
        slug: "food-and-wine-expo",
        venue: "Sarit Centre",
        start_time: "2025-01-25T12:00:00Z",
        end_time: "2025-01-25T20:00:00Z",
        flyer_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
        description: "Experience culinary delights",
        status: "upcoming",
        approved: false,
        rejected: false,
        created_at: "2024-12-10T10:00:00Z",
        bookings_count: 43,
        revenue: 215000
      },
      {
        id: 4,
        title: "Marathon for Charity 2024",
        slug: "marathon-for-charity-2024",
        venue: "Uhuru Park",
        start_time: "2024-12-15T06:00:00Z",
        end_time: "2024-12-15T12:00:00Z",
        flyer_url: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400",
        description: "Run for a cause",
        status: "completed",
        approved: true,
        rejected: false,
        created_at: "2024-11-01T10:00:00Z",
        bookings_count: 234,
        revenue: 702000
      }
    ];

    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
    setLoading(false);
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

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

  const getStatusBadge = (event: Event) => {
    if (!event.approved && !event.rejected) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
          Pending Approval
        </span>
      );
    }
    if (event.rejected) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          Rejected
        </span>
      );
    }

    switch (event.status) {
      case 'upcoming':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Upcoming
          </span>
        );
      case 'ongoing':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Ongoing
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    // TODO: API call to delete event
    // await updateEventStatus(eventId, 'deleted');
    setEvents(events.filter(e => e.id !== eventId));
    setShowDeleteModal(false);
    setSelectedEvent(null);
  };

  const handleCancelEvent = async (eventId: number) => {
    // TODO: API call to cancel event
    // await updateEventStatus(eventId, 'cancelled');
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, status: 'cancelled' } : e
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Events</h1>
            <p className="text-gray-600">Manage and track all your events</p>
          </div>
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events by title or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first event'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all">
                Create Your First Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.flyer_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(event)}
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="flex items-center text-gray-600 text-xs mb-1">
                        <Users size={14} className="mr-1" />
                        Bookings
                      </div>
                      <div className="font-bold text-gray-800">{event.bookings_count || 0}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-600 text-xs mb-1">
                        <DollarSign size={14} className="mr-1" />
                        Revenue
                      </div>
                      <div className="font-bold text-green-600">
                        KES {((event.revenue || 0) / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center text-sm font-medium">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button className="px-3 py-2 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <div className="relative group/menu">
                      <button className="px-3 py-2 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 hidden group-hover/menu:block z-10">
                        {event.status !== 'cancelled' && event.status !== 'completed' && (
                          <button 
                            onClick={() => handleCancelEvent(event.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Event
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDeleteModal(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Event
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
              Delete Event?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{selectedEvent.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEvent(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsList;