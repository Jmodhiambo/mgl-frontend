// src/apps/user/pages/MyTickets.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Ticket, Download, QrCode,
  MapPin, Clock, Search, CheckCircle, XCircle, AlertCircle,
  ChevronDown, ChevronUp, Pencil, Check, X, Loader2, CalendarCheck,
} from 'lucide-react';
import { MyTicketsSEO } from '@shared/components/SEO';
import { getUserTicketInstances, updateTicketHolderName } from '@shared/api/user/ticketInstancesApi';
import type { TicketInstanceEnriched } from '@shared/api/user/ticketInstancesApi';
import { renderQrToCanvas, downloadQrCode } from '@shared/utils/qrCode';

const PAGE_SIZE = 10;
const HOLDER_NAME_MAX_LENGTH = 150;

const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets]           = useState<TicketInstanceEnriched[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');
  const [page, setPage]                 = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<TicketInstanceEnriched | null>(null);
  const [downloading, setDownloading]   = useState(false);

  // Which ticket cards are expanded — collapsed by default so long lists
  // stay scannable. Independent per card so a couple can be compared
  // side by side without losing state.
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Holder-name inline edit state — only one card can be in edit mode
  // at a time, which keeps the save/cancel affordances unambiguous.
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editValue, setEditValue]   = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError]   = useState<string | null>(null);

  useEffect(() => {
    document.title = 'My Tickets - MGLTickets';
    getUserTicketInstances()
      .then(data => {
        setTickets(data as TicketInstanceEnriched[]);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load tickets. Please try again.');
        setLoading(false);
      });
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (searchTerm) {
        const str = `${t.event_title} ${t.code}`.toLowerCase();
        if (!str.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }, [tickets, filterStatus, searchTerm]);

  // Reset to page 1 whenever the filtered set changes shape
  useEffect(() => { setPage(1); }, [filterStatus, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const paginatedTickets = filteredTickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const ticketCounts = useMemo(() => ({
    all:       tickets.length,
    issued:    tickets.filter(t => t.status === 'issued').length,
    used:      tickets.filter(t => t.status === 'used').length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length,
  }), [tickets]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

  const formatDateShort = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const statusColor = (status: string) => {
    if (status === 'issued')    return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'used')      return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const statusIcon = (status: string) => {
    if (status === 'issued' || status === 'used') return <CheckCircle className="w-4 h-4" />;
    if (status === 'cancelled') return <XCircle className="w-4 h-4" />;
    return null;
  };

  const toggleExpanded = (ticketId: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(ticketId)) {
        next.delete(ticketId);
      } else {
        next.add(ticketId);
      }
      return next;
    });
  };

  const handleDownloadTicket = async (ticket: TicketInstanceEnriched) => {
    setDownloading(true);
    try {
      // Encode the signed qr_payload (not the bare code) — this is the
      // same payload the gate scanner expects, so a downloaded ticket
      // scans identically to the in-app "Show QR" view.
      // downloadQrCode now takes the FULL filename base (no more implicit
      // "ticket-" prefix, since the util is shared with event/site QRs too).
      await downloadQrCode(ticket.qr_payload, `ticket-${ticket.code}`);
    } catch {
      setError('Failed to generate ticket download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Holder name editing ─────────────────────────────────────────────────

  const startEditingHolderName = (ticket: TicketInstanceEnriched) => {
    setEditingId(ticket.id);
    setEditValue(ticket.issued_to ?? '');
    setEditError(null);
  };

  const cancelEditingHolderName = () => {
    setEditingId(null);
    setEditValue('');
    setEditError(null);
  };

  const saveHolderName = async (ticket: TicketInstanceEnriched) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditError('Name cannot be empty.');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const updated = await updateTicketHolderName(ticket.id, trimmed);
      setTickets(prev => prev.map(t => (
        t.id === ticket.id ? { ...t, issued_to: updated.issued_to } : t
      )));
      setEditingId(null);
      setEditValue('');
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setEditError('This ticket was checked in or cancelled, so the name can no longer be changed.');
      } else {
        setEditError('Failed to save. Please try again.');
      }
    } finally {
      setEditSaving(false);
    }
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
            <p className="text-gray-600">Manage and view all your event tickets</p>
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
              { key: 'all',       label: `All Tickets (${ticketCounts.all})` },
              { key: 'issued',    label: `Active (${ticketCounts.issued})` },
              { key: 'used',      label: `Used (${ticketCounts.used})` },
              { key: 'cancelled', label: `Cancelled (${ticketCounts.cancelled})` },
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
                placeholder="Search tickets by event name or ticket code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Tickets list — one collapsible card per ticket instance. Each
              card's header (event, status, date) is always visible and
              toggles the expanded detail section, which holds the QR code,
              actions, and holder-name editing. Keeping cards collapsed by
              default is what makes long ticket lists scannable. */}
          <div className="space-y-3">
            {paginatedTickets.map(ticket => {
              const isExpanded = expandedIds.has(ticket.id);
              const isEditing = editingId === ticket.id;

              return (
                <div key={ticket.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
                  {/* Collapsed header — always visible, click to expand/collapse */}
                  <button
                    onClick={() => toggleExpanded(ticket.id)}
                    className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800 truncate">{ticket.event_title}</h3>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor(ticket.status)}`}>
                          {statusIcon(ticket.status)}
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        {ticket.event_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateShort(ticket.event_date)}
                          </span>
                        )}
                        <span className="font-mono">{ticket.code}</span>
                        {ticket.issued_to && (
                          <span className="truncate">For: {ticket.issued_to}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Expanded detail section */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-6 border-t border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pt-4">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {ticket.event_date && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                                <span className="text-sm">{formatDate(ticket.event_date)}</span>
                              </div>
                            )}
                            {ticket.event_date && (
                              <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-orange-500" />
                                <span className="text-sm">{formatTime(ticket.event_date)}</span>
                              </div>
                            )}
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="text-sm">{ticket.venue}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Ticket className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="text-sm">{ticket.ticket_type_name}</span>
                            </div>
                          </div>

                          {/* Ticket holder name — editable only while 'issued'.
                              This is intentionally not collected at booking
                              time to keep checkout friction-free; buyers
                              assign names to individual tickets afterward. */}
                          <div className="mb-4 pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-1.5">Ticket Holder</div>
                            {isEditing ? (
                              <div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    maxLength={HOLDER_NAME_MAX_LENGTH}
                                    placeholder="Enter holder's name"
                                    autoFocus
                                    disabled={editSaving}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
                                  />
                                  <button
                                    onClick={() => saveHolderName(ticket)}
                                    disabled={editSaving}
                                    className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                                    aria-label="Save"
                                  >
                                    {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={cancelEditingHolderName}
                                    disabled={editSaving}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    aria-label="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                {editError && (
                                  <p className="text-xs text-red-600 mt-1.5">{editError}</p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-800">
                                  {ticket.issued_to || <span className="text-gray-400 font-normal">Not set</span>}
                                </span>
                                {ticket.status === 'issued' && (
                                  <button
                                    onClick={() => startEditingHolderName(ticket)}
                                    className="p-1 rounded text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                    aria-label="Edit ticket holder name"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Ticket Code</div>
                              <div className="font-mono text-sm font-medium text-gray-800">{ticket.code}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-1">Price</div>
                              <div className="text-lg font-bold text-orange-600">
                                KES {ticket.price.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Issued-at timestamp — created_at doubles as this,
                              since a ticket instance is only ever created once,
                              at issuance right after payment confirmation. */}
                          <div className="flex items-center text-gray-400 mt-3">
                            <CalendarCheck className="w-3.5 h-3.5 mr-1.5" />
                            <span className="text-xs">
                              Issued {formatDateShort(ticket.created_at)} at {formatTime(ticket.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2">
                          {ticket.status === 'issued' && (
                            <>
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="flex-1 md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                              >
                                <QrCode className="w-4 h-4" /> Show QR
                              </button>
                              <button
                                onClick={() => handleDownloadTicket(ticket)}
                                disabled={downloading}
                                className="flex-1 md:w-auto border-2 border-orange-500 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <Download className="w-4 h-4" /> Download
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
                  )}
                </div>
              );
            })}
          </div>

          {filteredTickets.length === 0 && !loading && (
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

          {/* Pagination */}
          {filteredTickets.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTickets.length)} of {filteredTickets.length} tickets
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-orange-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-orange-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>

        {/* QR Modal — renders a real QR code onto a canvas, encoding the
            ticket's unique code. Download button inside the modal generates
            the same QR at higher resolution and saves it as a PNG named
            after the ticket code. */}
        {selectedTicket && (
          <QrModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onDownload={() => handleDownloadTicket(selectedTicket)}
            downloading={downloading}
          />
        )}
      </div>
    </>
  );
};

// ─── QR Modal sub-component ───────────────────────────────────────────────────
// Separated out so the canvas ref + render effect are scoped to exactly the
// ticket currently being shown, and re-render cleanly if the user switches
// between tickets without closing the modal.

interface QrModalProps {
  ticket: TicketInstanceEnriched;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}

const QrModal: React.FC<QrModalProps> = ({ ticket, onClose, onDownload, downloading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    // Encode the full signed payload, not ticket.code — the scanner
    // verifies a signature embedded in this JSON before ever calling the
    // check-in endpoint, so encoding just the bare code would make every
    // scan fail signature verification.
    renderQrToCanvas(canvasRef.current, ticket.qr_payload, 240).catch(() => setRenderError(true));
  }, [ticket.qr_payload]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{ticket.event_title}</h3>
          <p className="text-gray-600 mb-6">{ticket.ticket_type_name}</p>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 mb-6">
            <div className="w-60 h-60 mx-auto bg-white rounded-lg flex items-center justify-center overflow-hidden">
              {renderError ? (
                <QrCode className="w-32 h-32 text-orange-300" />
              ) : (
                <canvas ref={canvasRef} width={240} height={240} />
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-xs text-gray-500 mb-1">Ticket Code</div>
            <div className="font-mono font-bold text-gray-800">{ticket.code}</div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Present this QR code at the event entrance for scanning
          </p>
          <div className="flex gap-3">
            <button
              onClick={onDownload}
              disabled={downloading}
              className="flex-1 border-2 border-orange-500 text-orange-600 py-3 rounded-lg font-medium hover:bg-orange-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTicketsPage;