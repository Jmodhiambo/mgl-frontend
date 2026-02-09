import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Trash2, X, Send, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface CoOrganizer {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
}

interface Event {
  id: number;
  title: string;
}

const CoOrganizerManagement: React.FC = () => {
  const [coOrganizers, setCoOrganizers] = useState<CoOrganizer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoOrganizer, setSelectedCoOrganizer] = useState<CoOrganizer | null>(null);

  const [inviteData, setInviteData] = useState({
    email: '',
    eventId: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadCoOrganizers();
    loadEvents();
  }, []);

  const loadCoOrganizers = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    // const response = await getAllCoOrganizers();
    
    const mockCoOrganizers: CoOrganizer[] = [
      {
        id: 1,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone_number: '+254701234567',
        role: 'user',
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone_number: '+254702345678',
        role: 'user',
        created_at: '2025-01-10T10:00:00Z'
      },
      {
        id: 3,
        name: 'Sarah Williams',
        email: 'sarah.williams@example.com',
        phone_number: '+254703456789',
        role: 'user',
        created_at: '2025-01-05T10:00:00Z'
      }
    ];

    setCoOrganizers(mockCoOrganizers);
    setLoading(false);
  };

  const loadEvents = async () => {
    // TODO: Replace with actual API call
    // const response = await getOrganizerEvents();
    
    const mockEvents: Event[] = [
      { id: 1, title: 'Summer Music Festival 2025' },
      { id: 2, title: 'Tech Innovation Summit' },
      { id: 3, title: 'Food & Wine Expo' }
    ];

    setEvents(mockEvents);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInviteData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!inviteData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!inviteData.eventId) {
      newErrors.eventId = 'Please select an event';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInvite = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: API call to invite co-organizer
      // await createCoOrganizer(inviteData.email, inviteData.eventId);
      
      console.log('Co-organizer invited:', inviteData);
      alert(`Invitation sent to ${inviteData.email}`);
      
      setShowInviteModal(false);
      setInviteData({ email: '', eventId: '' });
      loadCoOrganizers();
    } catch (error) {
      console.error('Error inviting co-organizer:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoOrganizer) return;

    setLoading(true);

    try {
      // TODO: API call to delete co-organizer
      // await deleteCoOrganizer(selectedCoOrganizer.id);
      
      setCoOrganizers(coOrganizers.filter(co => co.id !== selectedCoOrganizer.id));
      setShowDeleteModal(false);
      setSelectedCoOrganizer(null);
      alert('Co-organizer removed successfully');
    } catch (error) {
      console.error('Error deleting co-organizer:', error);
      alert('Failed to remove co-organizer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && coOrganizers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Co-Organizers</h1>
            <p className="text-gray-600">Invite and manage co-organizers for your events</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Co-Organizer
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">About Co-Organizers</h3>
            <p className="text-sm text-blue-800">
              Co-organizers are team members you invite to help manage specific events. They can view bookings, 
              manage ticket types, and assist with event coordination. Invitations are sent via email.
            </p>
          </div>
        </div>

        {/* Co-Organizers List */}
        {coOrganizers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No co-organizers yet</h3>
            <p className="text-gray-500 mb-6">Invite team members to help you manage events</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Invite Your First Co-Organizer
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Added On
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coOrganizers.map((coOrganizer) => (
                    <tr key={coOrganizer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-sm">
                              {coOrganizer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{coOrganizer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{coOrganizer.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{coOrganizer.phone_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(coOrganizer.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedCoOrganizer(coOrganizer);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Invite Co-Organizer</h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteData({ email: '', eventId: '' });
                  setErrors({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={inviteData.email}
                    onChange={handleInputChange}
                    placeholder="colleague@example.com"
                    className={`w-full pl-10 pr-4 py-3 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Event *
                </label>
                <select
                  name="eventId"
                  value={inviteData.eventId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.eventId ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
                >
                  <option value="">Choose an event...</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
                {errors.eventId && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventId}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  An invitation email will be sent to this address. They'll be added as a co-organizer 
                  for the selected event once they accept.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteData({ email: '', eventId: '' });
                  setErrors({});
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCoOrganizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
              Remove Co-Organizer?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to remove {selectedCoOrganizer.name} as a co-organizer? 
              They will lose access to manage events.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCoOrganizer(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto" />
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoOrganizerManagement;