// src/apps/admin/pages/Events.tsx
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar, CheckCircle, XCircle, Trash2, Eye,
  MoreVertical, MapPin, User, X, Clock, Download,
  Plus, ImageOff, Tag, DollarSign, Users, Loader2,
} from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import {
  listAllEvents, approveEvent, rejectEvent, deleteEvent,
  getTicketTypesByEvent,
} from '@admin/services/adminService';
import { formatDateTime, formatDate, formatKES } from '@admin/utils/format';
import type { AdminEvent, AdminTicketType } from '@admin/types';

import CreateEventModal from '@admin/components/modals/events/CreateEventModal';
import CreateTicketTypesModal, {
  type SavedTicketType,
} from '@admin/components/modals/events/CreateTicketTypesModal';

const STATUS_OPTS   = ['all', 'upcoming', 'ongoing', 'completed', 'cancelled', 'draft'];
const APPROVAL_OPTS = ['all', 'approved', 'unapproved'];
const PAGE_SIZE     = 10;

type CreateStep =
  | { step: 'closed' }
  | { step: 'event' }
  | { step: 'tickets'; event: AdminEvent & { flyer_url?: string }; mode: 'post-create' | 'standalone' };

// ─── Main Page ────────────────────────────────────────────────────────────────

const Events: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents]           = useState<AdminEvent[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('all');
  const [approvalFilter, setApproval] = useState(
    searchParams.get('filter') === 'unapproved' ? 'unapproved' : 'all',
  );
  const [page, setPage]               = useState(1);
  const [confirm, setConfirm]         = useState<{ action: 'approve' | 'reject' | 'delete'; event: AdminEvent } | null>(null);
  const [actionLoading, setAL]        = useState(false);
  const [alert, setAlert]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [detailEvent, setDetail]      = useState<AdminEvent | null>(null);
  const [createFlow, setCreateFlow]   = useState<CreateStep>({ step: 'closed' });

  useEffect(() => {
    listAllEvents()
      .then(data => { setEvents(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  const filtered = useMemo(() => events.filter(e => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
        !(e.organizer_name ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (approvalFilter === 'approved'   && !e.is_approved) return false;
    if (approvalFilter === 'unapproved' &&  e.is_approved) return false;
    return true;
  }), [events, search, statusFilter, approvalFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAction = async () => {
    if (!confirm) return;
    setAL(true);
    const { action, event } = confirm;

    // Optimistic update
    if (action === 'approve') {
      setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: true } : e));
    } else if (action === 'reject') {
      setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: false, is_active: false } : e));
    } else if (action === 'delete') {
      setEvents(p => p.filter(e => e.id !== event.id));
    }

    setConfirm(null);

    try {
      if (action === 'approve') {
        const updated = await approveEvent(event.id);
        setEvents(p => p.map(e => e.id === updated.id ? updated : e));
        setAlert({ type: 'success', msg: `"${event.title}" approved.` });
      } else if (action === 'reject') {
        const updated = await rejectEvent(event.id);
        setEvents(p => p.map(e => e.id === updated.id ? updated : e));
        setAlert({ type: 'success', msg: `"${event.title}" rejected.` });
      } else if (action === 'delete') {
        await deleteEvent(event.id);
        setAlert({ type: 'success', msg: `"${event.title}" deleted.` });
      }
    } catch (err: any) {
      // Roll back optimistic update
      if (action === 'approve') {
        setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: false } : e));
      } else if (action === 'reject') {
        setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: true, is_active: true } : e));
      } else if (action === 'delete') {
        setEvents(p => [event, ...p]);
      }
      const detail = err?.response?.data?.detail ?? 'Action failed. Please try again.';
      setAlert({ type: 'error', msg: detail });
    } finally {
      setAL(false);
    }
  };

  const handleEventCreated = (newEvent: AdminEvent & { flyer_url?: string }) => {
    setEvents(p => [newEvent, ...p]);
    setCreateFlow({ step: 'tickets', event: newEvent, mode: 'post-create' });
  };

  const handleTicketsFinished = (
    event: AdminEvent & { flyer_url?: string },
    ticketTypes: SavedTicketType[],
    mode: 'post-create' | 'standalone',
  ) => {
    setCreateFlow({ step: 'closed' });
    if (mode === 'post-create') {
      setAlert({
        type: 'success',
        msg: `"${event.title}" created with ${ticketTypes.length} ticket ${ticketTypes.length === 1 ? 'type' : 'types'}.`,
      });
    } else {
      setAlert({
        type: 'success',
        msg: `${ticketTypes.length} ticket ${ticketTypes.length === 1 ? 'type' : 'types'} added to "${event.title}".`,
      });
    }
  };

  const handleTicketsSkipped = (event: AdminEvent & { flyer_url?: string }) => {
    setCreateFlow({ step: 'closed' });
    setAlert({
      type: 'success',
      msg: `"${event.title}" created. Remember to add ticket types before it can accept bookings.`,
    });
  };

  const openAddTicketTypes = (event: AdminEvent) => {
    setDetail(null);
    setCreateFlow({ step: 'tickets', event, mode: 'standalone' });
  };

  const closeCreateFlow = () => setCreateFlow({ step: 'closed' });

  const exportCSV = () => {
    const rows = [
      ['ID', 'Title', 'Organizer', 'Status', 'Approved', 'City', 'Start Date', 'Bookings', 'Revenue'],
      ...filtered.map(e => [
        e.id, e.title, e.organizer_name, e.status, e.is_approved,
        e.city, e.start_time, e.total_bookings, e.total_revenue,
      ]),
    ];
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'));
    a.download = 'events.csv';
    a.click();
  };

  const pendingCount = events.filter(e => !e.is_approved).length;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Management</h1>
          <p className="page-subtitle">
            {events.length} total events
            {pendingCount > 0 && (
              <span className="ml-2 badge-warning">{pendingCount} pending approval</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={() => setApproval('unapproved')}
              className="btn-primary btn-sm flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Review Pending ({pendingCount})</span>
              <span className="sm:hidden">{pendingCount}</span>
            </button>
          )}
          <button
            onClick={() => setCreateFlow({ step: 'event' })}
            className="btn-secondary btn-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Event</span>
          </button>
          <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <FilterBar
        search={search} onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search events or organizer…"
        filters={
          <>
            <select
              value={statusFilter}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[130px]"
            >
              {STATUS_OPTS.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={approvalFilter}
              onChange={e => { setApproval(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[140px]"
            >
              {APPROVAL_OPTS.map(a => (
                <option key={a} value={a}>
                  {a === 'all' ? 'All Approval' : a.charAt(0).toUpperCase() + a.slice(1)}
                </option>
              ))}
            </select>
          </>
        }
      />

      <SectionCard title="All Events" subtitle={`${paginated.length} of ${filtered.length} events`} noPadding>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={7} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={Calendar} title="No events found" description="Try adjusting your filters" />
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Event</th><th>Organizer</th><th>Status</th>
                    <th>Approval</th><th>Date</th><th>Bookings</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(event => (
                    <tr key={event.id}>
                      <td className="text-gray-400 text-xs">{event.id}</td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{event.city}, {event.country}
                          </p>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-gray-700 flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />{event.organizer_name}
                        </p>
                      </td>
                      <td><StatusBadge status={event.status} /></td>
                      <td>
                        {event.is_approved
                          ? <span className="badge-success">Approved</span>
                          : <span className="badge-warning">Pending</span>}
                      </td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(event.start_time)}
                      </td>
                      <td>
                        <span className="text-sm font-semibold text-gray-800">
                          {event.total_bookings ?? 0}
                        </span>
                      </td>
                      <td>
                        <EventActionsMenu
                          event={event}
                          onAction={a => setConfirm({ action: a, event })}
                          onView={() => setDetail(event)}
                          onAddTicketTypes={() => openAddTicketTypes(event)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(event => (
                <div key={event.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 leading-snug">{event.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.city}, {event.country}</span>
                      </p>
                    </div>
                    <EventActionsMenu
                      event={event}
                      onAction={a => setConfirm({ action: a, event })}
                      onView={() => setDetail(event)}
                      onAddTicketTypes={() => openAddTicketTypes(event)}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={event.status} />
                    {event.is_approved
                      ? <span className="badge-success">Approved</span>
                      : <span className="badge-warning">Pending</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />{event.organizer_name}
                    </span>
                    <span>{formatDate(event.start_time)} · {event.total_bookings ?? 0} bookings</span>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
              total={filtered.length}
              limit={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </SectionCard>

      {confirm && (
        <ConfirmDialog
          title={`${confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)} Event`}
          message={`Are you sure you want to ${confirm.action} "${confirm.event.title}"?`}
          confirmLabel={confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)}
          variant={confirm.action === 'delete' || confirm.action === 'reject' ? 'danger' : 'info'}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetail(null)}
          onApprove={() => { setConfirm({ action: 'approve', event: detailEvent }); setDetail(null); }}
          onReject={() => { setConfirm({ action: 'reject', event: detailEvent }); setDetail(null); }}
          onAddTicketTypes={() => openAddTicketTypes(detailEvent)}
        />
      )}

      {createFlow.step === 'event' && (
        <CreateEventModal
          onClose={closeCreateFlow}
          onCreated={handleEventCreated}
        />
      )}

      {createFlow.step === 'tickets' && (
        <CreateTicketTypesModal
          event={createFlow.event}
          mode={createFlow.mode}
          onClose={closeCreateFlow}
          onFinish={(event, ticketTypes) =>
            handleTicketsFinished(event, ticketTypes, createFlow.mode)
          }
          onSkip={createFlow.mode === 'post-create' ? handleTicketsSkipped : undefined}
        />
      )}
    </div>
  );
};

// ─── Event Actions Dropdown ───────────────────────────────────────────────────

const EventActionsMenu: React.FC<{
  event: AdminEvent;
  onAction: (a: 'approve' | 'reject' | 'delete') => void;
  onView: () => void;
  onAddTicketTypes: () => void;
}> = ({ event, onAction, onView, onAddTicketTypes }) => {
  const [open, setOpen]       = useState(false);
  const [menuStyle, setStyle] = useState<React.CSSProperties>({});
  const triggerRef            = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const menuHeight = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;
    setStyle(
      openUpward
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right, top: 'auto' }
        : { position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right },
    );
    setOpen(o => !o);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const menu = open && createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
      <div
        style={{ ...menuStyle, zIndex: 9999 }}
        className="w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up"
      >
        <button
          onClick={() => { onView(); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700"
        >
          <Eye className="w-4 h-4 text-gray-400" /> View Details
        </button>
        <button
          onClick={() => { onAddTicketTypes(); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-700"
        >
          <Tag className="w-4 h-4" /> Add Ticket Types
        </button>
        {!event.is_approved && (
          <button
            onClick={() => { onAction('approve'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-emerald-50 text-emerald-700"
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </button>
        )}
        {event.is_approved && (
          <button
            onClick={() => { onAction('reject'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-amber-50 text-amber-700"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
        )}
        <div className="divider my-1" />
        <button
          onClick={() => { onAction('delete'); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </>,
    document.body,
  );

  return (
    <>
      <button ref={triggerRef} onClick={handleOpen} className="btn-icon">
        <MoreVertical className="w-4 h-4" />
      </button>
      {menu}
    </>
  );
};

// ─── Event Detail Modal ───────────────────────────────────────────────────────

const EventDetailModal: React.FC<{
  event: AdminEvent & { flyer_url?: string };
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onAddTicketTypes: () => void;
}> = ({ event, onClose, onApprove, onReject, onAddTicketTypes }) => {
  const [imgError, setImgError]           = useState(false);
  const [ticketTypes, setTicketTypes]     = useState<AdminTicketType[]>([]);
  const [ticketsLoading, setTkLoading]    = useState(true);
  const [ticketsError, setTicketsError]   = useState(false);

  const flyerUrl = (event as any).flyer_url as string | undefined;

  useEffect(() => {
    setTkLoading(true);
    setTicketsError(false);
    getTicketTypesByEvent(event.id)
      .then(data => { setTicketTypes(data); setTkLoading(false); })
      .catch(() => { setTicketsError(true); setTkLoading(false); });
  }, [event.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Flyer */}
        <div className="relative w-full h-56 bg-gray-100 flex-shrink-0 rounded-t-2xl overflow-hidden">
          {flyerUrl && !imgError ? (
            <img
              src={flyerUrl}
              alt={`${event.title} flyer`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <ImageOff className="w-10 h-10" />
              <p className="text-sm">No flyer uploaded</p>
            </div>
          )}
          <div className="absolute top-3 left-3">
            {event.is_approved
              ? <span className="badge-success shadow-sm">Approved</span>
              : <span className="badge-warning shadow-sm">Pending Approval</span>}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Title + venue */}
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {event.venue}, {event.city}, {event.country}
            </p>
          </div>

          {event.description && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                {event.description}
              </p>
            </div>
          )}

          {/* Event details grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
            {([
              ['Event ID',       `#${event.id}`],
              ['Category',       event.category],
              ['Status',         event.status],
              ['Organizer',      event.organizer_name ?? 'N/A'],
              ['Start',          formatDateTime(event.start_time)],
              ['End',            formatDateTime(event.end_time)],
              ['Total Bookings', String(event.total_bookings ?? 0)],
              ['Total Revenue',  event.total_revenue ? `KES ${event.total_revenue.toLocaleString()}` : 'N/A'],
              ['Created',        formatDateTime(event.created_at)],
              ['Last Updated',   formatDateTime(event.updated_at)],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* ── Ticket Types section ── */}
          <div className="border-t border-gray-100 pt-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-500" /> Ticket Types
              </p>
              <button
                onClick={onAddTicketTypes}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {ticketsLoading ? (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading ticket types…</span>
              </div>
            ) : ticketsError ? (
              <p className="text-sm text-red-500 text-center py-4">Failed to load ticket types.</p>
            ) : ticketTypes.length === 0 ? (
              <div className="text-center py-5 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Tag className="w-7 h-7 mx-auto mb-1.5 opacity-40" />
                <p className="text-sm text-gray-500">No ticket types yet</p>
                <button
                  onClick={onAddTicketTypes}
                  className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Add ticket types →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {ticketTypes.map(t => {
                  const fillRate = Math.round((t.quantity_sold / t.total_quantity) * 100);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                          {!t.is_active && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full flex-shrink-0">
                              Inactive
                            </span>
                          )}
                        </div>
                        {/* Fill bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${fillRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 w-16 text-right">
                            {t.quantity_sold}/{t.total_quantity} sold
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-emerald-700">{formatKES(t.price)}</p>
                        <p className="text-xs text-gray-400">{fillRate}% full</p>
                      </div>
                    </div>
                  );
                })}

                {/* Summary row */}
                <div className="flex items-center justify-between pt-2 px-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {ticketTypes.reduce((s, t) => s + t.total_quantity, 0).toLocaleString()} total capacity
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {formatKES(ticketTypes.reduce((s, t) => s + t.price * t.quantity_sold, 0))} earned
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 sm:flex-row">
            <button onClick={onClose} className="btn-secondary flex-1 order-last sm:order-first">
              Close
            </button>
            <button
              onClick={onAddTicketTypes}
              className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <Tag className="w-4 h-4" /> Add Ticket Types
            </button>
            {!event.is_approved ? (
              <>
                <button onClick={onReject} className="btn-danger flex-1">Reject</button>
                <button onClick={onApprove} className="btn-primary flex-1">Approve</button>
              </>
            ) : (
              <button onClick={onReject} className="btn-danger flex-1">Revoke Approval</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;