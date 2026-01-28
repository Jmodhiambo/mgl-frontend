import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { Calendar, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface EventDetails {
  id: number;
  title: string;
  venue: string;
  start_time: string;
  organizer_name: string;
}

const AcceptCoOrganizerInvitation: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  const eventId = searchParams.get('event_id');
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !eventId) {
      setError('Invalid invitation link. Please check your email and try again.');
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login/register with return URL
      navigate(`/login?redirect=/co-organizer-invitation?token=${token}&event_id=${eventId}`);
      return;
    }

    loadInvitationDetails();
  }, [token, eventId, isAuthenticated]);

  const loadInvitationDetails = async () => {
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // const response = await getCoOrganizerInvitationDetails(token, eventId);
      
      // Mock data
      const mockEventDetails: EventDetails = {
        id: parseInt(eventId || '1'),
        title: 'Summer Music Festival 2025',
        venue: 'Kasarani Stadium, Nairobi',
        start_time: '2025-07-15T14:00:00Z',
        organizer_name: 'John Organizer'
      };

      setEventDetails(mockEventDetails);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Invitation not found or has expired.');
      } else if (err.response?.status === 400) {
        setError('This invitation has already been accepted.');
      } else {
        setError('Failed to load invitation details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token || !eventId) return;

    setAccepting(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await acceptCoOrganizerInvitation(token, eventId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirect to organizer dashboard after 2 seconds
      setTimeout(() => {
        window.open('http://localhost:3001/organizer/dashboard', '_blank');
        navigate('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('This invitation has already been accepted or is no longer valid.');
      } else if (err.response?.status === 404) {
        setError('Invitation not found. It may have been revoked.');
      } else {
        setError('Failed to accept invitation. Please try again.');
      }
    } finally {
      setAccepting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Invitation Accepted!
          </h2>
          <p className="text-gray-600 mb-6">
            You're now a co-organizer for <strong>{eventDetails?.title}</strong>.
            The organizer portal is opening in a new tab.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.open('http://localhost:3001/organizer/dashboard', '_blank')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
            >
              Organizer Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Unable to Load Invitation
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={loadInvitationDetails}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Co-Organizer Invitation</h1>
          <p className="text-orange-100">You've been invited to help organize an event</p>
        </div>

        {/* Body */}
        <div className="p-8">
          {eventDetails && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Details</h2>
                <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Event Name</p>
                    <p className="text-lg font-semibold text-gray-800">{eventDetails.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Venue</p>
                    <p className="text-gray-800">{eventDetails.venue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                    <p className="text-gray-800">{formatDate(eventDetails.start_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Invited By</p>
                    <p className="text-gray-800 font-medium">{eventDetails.organizer_name}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">What you'll be able to do:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>View and manage event bookings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Create and manage ticket types</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>View event analytics and statistics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Coordinate with the main organizer</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> By accepting this invitation, you'll gain access to the MGLTickets Organizer Portal where you can manage this event alongside the main organizer.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  disabled={accepting}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptInvitation}
                  disabled={accepting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {accepting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    'Accept Invitation'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptCoOrganizerInvitation;