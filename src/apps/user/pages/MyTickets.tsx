// src/apps/user/pages/MyTickets.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Ticket, Download, QrCode,
  MapPin, Clock, Search, CheckCircle, XCircle, AlertCircle, RefreshCw,
} from 'lucide-react';
import { MyTicketsSEO } from '@shared/components/SEO';
import { getUserTicketInstances } from '@shared/api/user/ticketInstancesApi';
import type { TicketInstanceEnriched } from '@shared/api/user/ticketInstancesApi';
import { fetchUserOrdersEnriched, type UserOrderEnriched } from '@user/services/dashboardService';

// ─── View model ────────────────────────────────────────────────────────────
// One card per order. If the order is confirmed, it carries the issued
// ticket instances for that order (for QR / download). If it's pending or
// failed, there are no ticket instances yet — the card still renders so the
// user can see what happened to their booking instead of it vanishing.

interface OrderTicketGroup {
  order: UserOrderEnriched;
  tickets: TicketInstanceEnriched[];
}

const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups]             = useState<OrderTicketGroup[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketInstanceEnriched | null>(null);

  useEffect(() => {
    document.title = 'My Tickets - MGLTickets';

    const load = async () => {
      try {
        // Orders are the source of truth — every checkout shows up here,
        // whether or not payment has completed yet. Ticket instances are
        // layered on top wherever they exist (i.e. payment confirmed).
        const [orders, tickets] = await Promise.all([
          fetchUserOrdersEnriched(),
          getUserTicketInstances() as Promise<TicketInstanceEnriched[]>,
        ]);

        const ticketsByBookingId = new Map<number, TicketInstanceEnriched[]>();
        for (const t of tickets) {
          const list = ticketsByBookingId.get(t.booking_id) ?? [];
          list.push(t);
          ticketsByBookingId.set(t.booking_id, list);
        }

        const built: OrderTicketGroup[] = orders.map((order) => {
          const orderTickets = order.bookings.flatMap(
            (b) => ticketsByBookingId.get(b.id) ?? [],
          );
          return { order, tickets: orderTickets };
        });

        setGroups(built);
      } catch {
        setError('Failed to load your tickets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────
  // Status filter works at the order level: 'issued' really means "has at
  // least one active ticket", 'used' means all tickets used, 'cancelled'
  // covers cancelled orders, and 'pending' (new) surfaces orders still
  // awaiting payment confirmation.

  const groupStatus = (group: OrderTicketGroup): string => {
    if (group.order.status === 'cancelled') return 'cancelled';
    if (group.order.status === 'pending') return 'pending';
    if (group.tickets.length === 0) return 'pending';
    if (group.tickets.every((t) => t.status === 'used')) return 'used';
    if (group.tickets.some((t) => t.status === 'issued')) return 'issued';
    return 'cancelled';
  };

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (filterStatus !== 'all' && groupStatus(g) !== filterStatus) return false;
      if (searchTerm) {
        const str = `${g.order.event_title} ${g.tickets.map((t) => t.code).join(' ')}`.toLowerCase();
        if (!str.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }, [groups, filterStatus, searchTerm]);

  const counts = useMemo(() => ({
    all:       groups.length,
    issued:    groups.filter((g) => groupStatus(g) === 'issued').length,
    used:      groups.filter((g) => groupStatus(g) === 'used').length,
    pending:   groups.filter((g) => groupStatus(g) === 'pending').length,
    cancelled: groups.filter((g) => groupStatus(g) === 'cancelled').length,
  }), [groups]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const statusColor = (status: string) => {
    if (status === 'issued')    return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'used')      return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'pending')   return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const statusIcon = (status: string) => {
    if (status === 'issued' || status === 'used') return <CheckCircle className="w-4 h-4" />;
    if (status === 'pending') return <Clock className="w-4 h-4" />;
    if (status === 'cancelled') return <XCircle className="w-4 h-4" />;
    return null;
  };

  const handleDownloadTicket = (ticket: TicketInstanceEnriched) => {
    // TODO: implement PDF download when ticket PDF endpoint is ready
    console.log('Download ticket:', ticket.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <MyTicketsSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">My Tickets</h2>
            <p className="text-gray-600">Manage and view all your event bookings</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Filter tabs */}
          <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex flex-wrap gap-2">
            {([
              { key: 'all',       label: `All (${counts.all})` },
              { key: 'issued',    label: `Active (${counts.issued})` },
              { key: 'used',      label: `Used (${counts.used})` },
              { key: 'pending',   label: `Pending (${counts.pending})` },
              { key: 'cancelled', label: `Cancelled (${counts.cancelled})` },
            ] as { key: string; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === tab.key
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by event name or ticket code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Orders list */}
          <div className="space-y-4">
            {filteredGroups.map(({ order, tickets }) => {
              const status = groupStatus({ order, tickets });
              const quantity = order.bookings.reduce((sum, b) => sum + b.quantity, 0);
              const sampleTicket = tickets[0];

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{order.event_title}</h3>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusColor(status)}`}>
                              {statusIcon(status)}
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {sampleTicket?.event_date && (
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="text-sm">{formatDate(sampleTicket.event_date)}</span>
                            </div>
                          )}
                          {sampleTicket?.event_date && (
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="text-sm">{formatTime(sampleTicket.event_date)}</span>
                            </div>
                          )}
                          {sampleTicket?.venue && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="text-sm">{sampleTicket.venue}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Ticket className="w-4 h-4 mr-2 text-orange-500" />
                            <span className="text-sm">
                              {order.bookings.map((b) => b.ticket_type_name).join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* Pending / failed payment messaging — replaces the
                            silent disappearance these orders used to suffer */}
                        {status === 'pending' && (
                          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 text-sm text-yellow-800">
                            <RefreshCw className="w-4 h-4 flex-shrink-0" />
                            {order.payment_status === 'failed'
                              ? 'Payment failed. Please retry checkout for this order.'
                              : 'Payment pending confirmation. Your tickets will appear here once payment completes.'}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              {quantity} ticket{quantity !== 1 ? 's' : ''} · Order #{order.id}
                            </div>
                            {order.mpesa_ref && (
                              <div className="font-mono text-xs text-gray-600">Ref: {order.mpesa_ref}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Total</div>
                            <div className="text-lg font-bold text-orange-600">
                              {order.total_price === 0 ? 'Free' : `KES ${order.total_price.toLocaleString()}`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions — per ticket instance when issued */}
                      {tickets.length > 0 && (
                        <div className="flex md:flex-col gap-2">
                          {tickets.some((t) => t.status === 'issued') && (
                            <button
                              onClick={() => setSelectedTicket(tickets.find((t) => t.status === 'issued') ?? tickets[0])}
                              className="flex-1 md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                            >
                              <QrCode className="w-4 h-4" /> Show QR
                            </button>
                          )}
                          {tickets.some((t) => t.status === 'issued') && (
                            <button
                              onClick={() => tickets.filter((t) => t.status === 'issued').forEach(handleDownloadTicket)}
                              className="flex-1 md:w-auto border-2 border-orange-500 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" /> Download
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredGroups.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search term'
                  : "You haven't purchased any tickets yet"}
              </p>
              <button
                onClick={() => navigate('/browse-events')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Browse Events
              </button>
            </div>
          )}
        </main>

        {/* QR Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedTicket.event_title}</h3>
                <p className="text-gray-600 mb-6">{selectedTicket.ticket_type_name}</p>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 mb-6">
                  <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-orange-500" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-xs text-gray-500 mb-1">Ticket Code</div>
                  <div className="font-mono font-bold text-gray-800">{selectedTicket.code}</div>
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
    </>
  );
};

export default MyTicketsPage;