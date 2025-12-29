import React, { useState, useEffect } from 'react';
import { Calendar, Ticket, Download, QrCode, MapPin, Clock, Search, CheckCircle, XCircle } from 'lucide-react';

interface TicketInstance {
  id: number;
  code: string;
  status: 'issued' | 'used' | 'cancelled';
  event_title: string;
  venue: string;
  event_date: string;
  ticket_type: string;
  price: number;
  issued_to: string;
  created_at: string;
  used_at?: string;
}

interface TicketCounts {
  all: number;
  issued: number;
  used: number;
  cancelled: number;
}

const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketInstance[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketInstance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<TicketInstance | null>(null);

  useEffect(() => {
    const fetchTickets = async (): Promise<void> => {
      try {
        // Replace with actual API call:
        // const response = await fetch('/api/users/me/ticket-instances');
        // const data: TicketInstance[] = await response.json();
        
        // Mock data
        const mockTickets: TicketInstance[] = [
          {
            id: 1,
            code: "SMFST-2025-001234",
            status: "issued",
            event_title: "Summer Music Festival 2025",
            venue: "Kasarani Stadium, Nairobi",
            event_date: "2025-07-15T14:00:00Z",
            ticket_type: "VIP Pass",
            price: 5000,
            issued_to: "John Doe",
            created_at: "2025-01-15T10:30:00Z"
          },
          {
            id: 2,
            code: "TCHCF-2025-005678",
            status: "issued",
            event_title: "Tech Conference 2025",
            venue: "KICC, Nairobi",
            event_date: "2025-08-20T09:00:00Z",
            ticket_type: "Regular Admission",
            price: 5000,
            issued_to: "John Doe",
            created_at: "2025-01-10T15:20:00Z"
          },
          {
            id: 3,
            code: "FWEXP-2025-009012",
            status: "used",
            event_title: "Food & Wine Expo",
            venue: "Villa Rosa Kempinski, Nairobi",
            event_date: "2024-12-10T12:00:00Z",
            ticket_type: "VIP Pass",
            price: 4000,
            issued_to: "John Doe",
            created_at: "2024-12-01T12:00:00Z",
            used_at: "2024-12-10T12:15:00Z"
          },
          {
            id: 4,
            code: "CMEDY-2025-003456",
            status: "cancelled",
            event_title: "Comedy Night Special",
            venue: "Safari Park Hotel, Nairobi",
            event_date: "2025-08-30T19:00:00Z",
            ticket_type: "Regular Admission",
            price: 2000,
            issued_to: "John Doe",
            created_at: "2025-01-05T12:00:00Z"
          }
        ];

        setTickets(mockTickets);
        setFilteredTickets(mockTickets);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((ticket: TicketInstance) => ticket.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((ticket: TicketInstance) =>
        ticket.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  }, [filterStatus, searchTerm, tickets]);

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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'used':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string): React.ReactNode | null => {
    switch (status) {
      case 'issued':
        return <CheckCircle className="w-4 h-4" />;
      case 'used':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleDownloadTicket = (ticket: TicketInstance): void => {
    console.log('Downloading ticket:', ticket.id);
    // Implement ticket download logic
  };

  const handleShowQR = (ticket: TicketInstance): void => {
    setSelectedTicket(ticket);
  };

  const ticketCounts: TicketCounts = {
    all: tickets.length,
    issued: tickets.filter((t: TicketInstance) => t.status === 'issued').length,
    used: tickets.filter((t: TicketInstance) => t.status === 'used').length,
    cancelled: tickets.filter((t: TicketInstance) => t.status === 'cancelled').length
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">My Tickets</h2>
          <p className="text-gray-600">Manage and view all your event tickets</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            All Tickets ({ticketCounts.all})
          </button>
          <button
            onClick={() => setFilterStatus('issued')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'issued'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            Active ({ticketCounts.issued})
          </button>
          <button
            onClick={() => setFilterStatus('used')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'used'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            Used ({ticketCounts.used})
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'cancelled'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            Cancelled ({ticketCounts.cancelled})
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tickets by event name or ticket code..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.map((ticket: TicketInstance) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {ticket.event_title}
                        </h3>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="text-sm">{formatDate(ticket.event_date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="text-sm">{formatTime(ticket.event_date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="text-sm">{ticket.venue}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Ticket className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="text-sm">{ticket.ticket_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Ticket Code</div>
                        <div className="font-mono text-sm font-medium text-gray-800">
                          {ticket.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Price</div>
                        <div className="text-lg font-bold text-orange-600">
                          KES {ticket.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex md:flex-col gap-2">
                    {ticket.status === 'issued' && (
                      <>
                        <button
                          onClick={() => handleShowQR(ticket)}
                          className="flex-1 md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Show QR
                        </button>
                        <button
                          onClick={() => handleDownloadTicket(ticket)}
                          className="flex-1 md:w-auto border-2 border-orange-500 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </>
                    )}
                    {ticket.status === 'used' && ticket.used_at && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs text-blue-600 font-medium">Used on</div>
                        <div className="text-sm text-blue-800">{formatDate(ticket.used_at)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTickets.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your filters or search term'
                : "You haven't purchased any tickets yet"}
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all">
              Browse Events
            </button>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedTicket.event_title}
              </h3>
              <p className="text-gray-600 mb-6">{selectedTicket.ticket_type}</p>
              
              {/* QR Code Placeholder */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 mb-6">
                <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-orange-500" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-xs text-gray-500 mb-1">Ticket Code</div>
                <div className="font-mono font-bold text-gray-800">
                  {selectedTicket.code}
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Present this QR code at the event entrance for scanning
              </p>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;