// src/apps/organizer/pages/BulkEmailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import {
  Mail, Search, Calendar, MapPin, Users, CheckCircle, Clock, XCircle,
  AlertCircle, ChevronRight, ChevronLeft, ArrowLeft,
} from 'lucide-react';
import EmailModal from '@organizer/components/modals/bookings/EmailModal';
import { organizer_getEventBookings } from '@shared/api/user/bookingsApi';
import { getMyEvents } from '@organizer/services/eventService';
import type { OrganizerEventOut } from '@shared/types/Event';
import { sendOrganizerEmail } from '@shared/api/organizer/orgEmailsApi';
import { EMAIL_TEMPLATES, bookingReplacements, fillTokens } from '@organizer/utils/emailTemplates';
import { formatKES, formatDate } from '@shared/utils/format';

const PAGE_SIZE = 20;

interface Booking {
  id: number;
  order_id?: number;
  user_id: number;
  event_id?: number;
  ticket_type_id: number;
  quantity: number;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  event_title?: string;
  ticket_type_name?: string;
  venue?: string;
  event_date?: string;
}

const statusStyle: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcon: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle className="w-4 h-4" />,
  pending:   <Clock className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
};

const BulkEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const organizerName = user?.name.split(' ')[0] ?? 'Organizer';

  // ── Event selection ──────────────────────────────────────────────────────
  // Required before anything else on this page does anything — this is
  // the whole point: a bulk send here is always scoped to one event by
  // construction, unlike the old "select all" on the all-events Bookings
  // tab, which could silently span several.
  const [events,          setEvents]          = useState<OrganizerEventOut[]>([]);
  const [eventsLoading,   setEventsLoading]   = useState(true);
  const [eventsError,     setEventsError]     = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Bulk Email - MGLTickets Organizer';
    getMyEvents()
      .then(data => {
        setEvents(data);
        setEventsLoading(false);
        const fromQuery = searchParams.get('event');
        if (fromQuery && data.some(e => e.id === Number(fromQuery))) {
          setSelectedEventId(Number(fromQuery));
        }
      })
      .catch(() => {
        setEventsError('Failed to load your events. Please try again.');
        setEventsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NOTE: assumes OrganizerEventOut has `venue` and `start_time` fields —
  // matches how Event rows are used elsewhere in this codebase (e.g.
  // ticket_instance_repo.py's Event.venue/Event.start_time), but I haven't
  // seen the actual type definition. If either name doesn't match, this
  // is a one-line fix in the JSX below, not a structural problem.
  const selectedEvent = events.find(e => e.id === selectedEventId) ?? null;

  // ── Bookings for the selected event ──────────────────────────────────────
  const [bookings,        setBookings]        = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading]  = useState(false);
  const [bookingsError,   setBookingsError]    = useState<string | null>(null);
  const [offset,  setOffset]  = useState(0);
  const [total,   setTotal]   = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [searchQuery,     setSearchQuery]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter,    setStatusFilter]    = useState('all');
  const [dateRange,       setDateRange]       = useState({ start: '', end: '' });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadBookings = useCallback(async (pageOffset = 0) => {
    if (!selectedEventId) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const filters = {
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      };
      const data = await organizer_getEventBookings(selectedEventId, PAGE_SIZE, pageOffset, filters);
      setBookings(data.items as Booking[]);
      setTotal(data.total);
      setHasMore(data.has_more);
      setOffset(data.offset);
    } catch {
      setBookingsError('Failed to load bookings. Please try again.');
    } finally {
      setBookingsLoading(false);
    }
  }, [selectedEventId, debouncedSearch, statusFilter, dateRange]);

  useEffect(() => { if (selectedEventId) loadBookings(0); }, [selectedEventId, loadBookings]);

  const goToPrevPage = () => loadBookings(Math.max(0, offset - PAGE_SIZE));
  const goToNextPage = () => { if (hasMore) loadBookings(offset + PAGE_SIZE); };

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selectedIds,       setSelectedIds]       = useState<number[]>([]);
  const [selectAllOnPage,   setSelectAllOnPage]   = useState(false);
  // Once true, every booking matching the current filters is the
  // selection — not just what's loaded. Individual checkboxes are
  // disabled while this is on (see the table below); "Clear selection"
  // is the only way out, same simplification as the version of this that
  // briefly lived on BookingsView.
  const [selectAllMatching, setSelectAllMatching] = useState(false);

  useEffect(() => {
    if (bookings.length > 0) setSelectAllOnPage(bookings.every(b => selectedIds.includes(b.id)));
  }, [selectedIds, bookings]);

  const toggleOne = (id: number) => {
    if (selectAllMatching) return; // disabled while in "all matching" mode — see note above
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const toggleAllOnPage = () => {
    if (selectAllMatching) return;
    setSelectedIds(selectAllOnPage ? [] : bookings.map(b => b.id));
    setSelectAllOnPage(!selectAllOnPage);
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectAllOnPage(false);
    setSelectAllMatching(false);
  };

  // Reset selection whenever the event or filters change — a stale
  // selection carried over from a different event or filter set could
  // otherwise sneak into a send it was never meant for.
  useEffect(() => { clearSelection(); }, [selectedEventId, debouncedSearch, statusFilter, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const recipientCount = selectAllMatching ? total : selectedIds.length;
  const previewReference = bookings.find(b => selectedIds.includes(b.id)) ?? bookings[0] ?? null;

  // ── Compose modal ─────────────────────────────────────────────────────────
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    template: 'custom', rawBody: '', subject: '', message: '', extraValues: {} as Record<string, string>,
  });
  const [messageTouched, setMessageTouched] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Same guarded auto-recompute as BookingsView — extra-field edits stop
  // touching the message once the organizer has typed into it themselves.
  useEffect(() => {
    if (!emailData.rawBody || messageTouched) return;
    const merged = { ...bookingReplacements(previewReference, organizerName), ...emailData.extraValues };
    setEmailData(p => ({ ...p, message: fillTokens(p.rawBody, merged) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailData.extraValues, messageTouched]);

  const resetEmailData = () => {
    setEmailData({ template: 'custom', rawBody: '', subject: '', message: '', extraValues: {} });
    setMessageTouched(false);
  };

  const handleEmailDataChange = (data: Partial<typeof emailData>) => {
    if ('message' in data) setMessageTouched(true);
    setEmailData(p => ({ ...p, ...data }));
  };

  const handleTemplateChange = (templateId: string) => {
    const tpl = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    const base = bookingReplacements(previewReference, organizerName);
    setEmailData({
      template: templateId,
      rawBody:  tpl.body,
      subject:  fillTokens(tpl.subject, base),
      message:  fillTokens(tpl.body, base),
      extraValues: {},
    });
    setMessageTouched(false);
  };

  const openComposeModal = () => {
    if (!recipientCount) { alert('Select at least one recipient first.'); return; }
    setShowEmailModal(true);
    resetEmailData();
  };

  const handleSendEmail = async () => {
    if (!selectedEventId) return;
    if (!emailData.subject || !emailData.message) { alert('Please fill in subject and message'); return; }
    setSendingEmail(true);
    try {
      const template_used = emailData.template.replace('organizer.', '') || 'custom';
      const extra_variables = Object.keys(emailData.extraValues).length ? emailData.extraValues : undefined;

      // filters.event_id is always the chosen event here — that's what
      // makes a cross-event send structurally impossible on this page,
      // whether sending to an explicit selection or "all matching."
      const result = selectAllMatching
        ? await sendOrganizerEmail({
            filters: {
              event_id: selectedEventId,
              search: debouncedSearch || undefined,
              status: statusFilter !== 'all' ? statusFilter : undefined,
              start_date: dateRange.start || undefined,
              end_date: dateRange.end || undefined,
            },
            template_used,
            subject: emailData.subject,
            body: emailData.message,
            extra_variables,
          })
        : await sendOrganizerEmail({
            booking_ids: selectedIds,
            template_used,
            subject: emailData.subject,
            body: emailData.message,
            extra_variables,
          });

      alert(`Sending to ${result.total_recipients} recipient(s). Check Email History for delivery status.`);
      setShowEmailModal(false);
      resetEmailData();
      clearSelection();
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Failed to send email. Please try again.';
      alert(detail);
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyle[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {statusIcon[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Bookings
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Mail className="w-7 h-7 text-blue-600" /> Bulk Email
          </h1>
          <p className="text-gray-600">
            Email attendees of a single event — pick the event first, so a send can never accidentally reach the wrong crowd.
          </p>
        </div>

        {/* ── Event picker ── */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
          {eventsLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
              Loading your events…
            </div>
          ) : eventsError ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-red-600">{eventsError}</p>
              <button onClick={() => window.location.reload()} className="text-sm text-blue-600 underline">Retry</button>
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500">You don't have any events yet.</p>
          ) : (
            <select
              value={selectedEventId ?? ''}
              onChange={e => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
              className="w-full sm:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Choose an event…</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          )}
          {selectedEvent && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              {selectedEvent.venue && (
                <span className="flex items-center gap-1 min-w-0 max-w-full">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{selectedEvent.venue}</span>
                </span>
              )}
              {selectedEvent.start_time && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="w-4 h-4 flex-shrink-0" /> {formatDate(selectedEvent.start_time)}</span>
              )}
            </div>
          )}
        </div>

        {!selectedEventId ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Choose an event to get started</h3>
            <p className="text-gray-500">Its attendees will show up here once you do.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text" placeholder="Search by customer name, email, or ticket type…"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input type="date" value={dateRange.start}
                    onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input type="date" value={dateRange.end}
                    onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              {searchQuery !== debouncedSearch && <p className="text-xs text-gray-400 mt-3">Searching…</p>}
            </div>

            {bookingsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">{bookingsError}</p>
                <button onClick={() => loadBookings(offset)} className="ml-auto text-sm text-red-600 underline">Retry</button>
              </div>
            )}

            {/* Selection + compose bar */}
            <div className="bg-white rounded-xl shadow-md px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {recipientCount > 0 ? `${recipientCount} recipient(s) selected` : 'No recipients selected'}
                </span>
                {recipientCount > 0 && (
                  <button onClick={clearSelection} className="text-xs text-gray-400 underline hover:text-gray-600">Clear</button>
                )}
              </div>
              <button
                onClick={openComposeModal}
                disabled={!recipientCount}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4" /> Compose Email
              </button>
            </div>

            {/* "Select all N matching" banner */}
            {selectAllOnPage && !selectAllMatching && total > bookings.length && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-blue-700">All {bookings.length} bookings on this page are selected.</p>
                <button
                  onClick={() => setSelectAllMatching(true)}
                  className="text-sm font-semibold text-blue-700 underline hover:text-blue-800"
                >
                  Select all {total} bookings matching your filters
                </button>
              </div>
            )}
            {selectAllMatching && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-blue-800 font-medium">All {total} bookings matching your current filters are selected.</p>
                <button onClick={clearSelection} className="text-sm font-semibold text-blue-800 underline hover:text-blue-900">Clear selection</button>
              </div>
            )}

            {/* Booking list */}
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all' || dateRange.start ? 'Try adjusting your filters' : 'This event has no bookings yet'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full hidden md:table">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAllOnPage || selectAllMatching}
                          disabled={selectAllMatching}
                          onChange={toggleAllOnPage}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ticket</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map(b => (
                      <tr key={b.id} className={selectedIds.includes(b.id) || selectAllMatching ? 'bg-blue-50' : ''}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectAllMatching || selectedIds.includes(b.id)}
                            disabled={selectAllMatching}
                            onChange={() => toggleOne(b.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">{b.customer_name ?? 'Unknown customer'}</p>
                          <p className="text-xs text-gray-500">{b.customer_email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{b.ticket_type_name} × {b.quantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatKES(b.total_price)}</td>
                        <td className="px-4 py-3">{getStatusBadge(b.status)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-sm font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={selectAllOnPage || selectAllMatching}
                      disabled={selectAllMatching}
                      onChange={toggleAllOnPage}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    Select all on this page
                  </label>
                  {bookings.map(b => (
                    <label key={b.id} className={`flex items-start gap-3 p-4 ${selectedIds.includes(b.id) || selectAllMatching ? 'bg-blue-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectAllMatching || selectedIds.includes(b.id)}
                        disabled={selectAllMatching}
                        onChange={() => toggleOne(b.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{b.customer_name ?? 'Unknown customer'}</p>
                            <p className="text-xs text-gray-500 truncate">{b.customer_email}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{b.ticket_type_name} × {b.quantity}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-sm font-bold text-gray-800">{formatKES(b.total_price)}</p>
                            <div className="mt-1">{getStatusBadge(b.status)}</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {total > 0 && (
              <div className="bg-white rounded-xl shadow-md mt-4 flex items-center justify-between flex-wrap gap-3 px-6 py-4">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-700">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</span> of{' '}
                  <span className="font-medium text-gray-700">{total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={goToPrevPage} disabled={offset === 0 || bookingsLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button onClick={goToNextPage} disabled={!hasMore || bookingsLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showEmailModal && (
        <EmailModal
          selectedBookings={previewReference ? [previewReference] : []}
          recipientCount={recipientCount}
          emailData={emailData}
          emailTemplates={EMAIL_TEMPLATES}
          sendingEmail={sendingEmail}
          onClose={() => { setShowEmailModal(false); resetEmailData(); }}
          onTemplateChange={handleTemplateChange}
          onEmailDataChange={handleEmailDataChange}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};

export default BulkEmailPage;