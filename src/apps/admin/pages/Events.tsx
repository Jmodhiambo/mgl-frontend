// src/apps/admin/pages/Events.tsx
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, User, Plus, Download, Clock } from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import { listAllEvents, approveEvent, rejectEvent, deleteEvent, updateEventStatus } from '@admin/services/adminService';
import { formatDate } from '@admin/utils/format';
import type { AdminEvent, EventLifecycleStatus } from '@admin/types';

import CreateEventModal from '@admin/components/modals/events/CreateEventModal';
import EventDetailModal from '@admin/components/modals/events/EventDetailModal';
import EventActionsMenu from '@admin/components/menus/events/EventActionsMenu';
import CreateTicketTypesModal, { type SavedTicketType } from '@admin/components/modals/ticketTypes/CreateTicketTypesModal';
import ManageCoOrganizersModal from '@admin/components/modals/coOrganizers/ManageCoOrganizersModal';

const STATUS_OPTS   = ['all', 'upcoming', 'ongoing', 'completed', 'cancelled', 'draft'];
const APPROVAL_OPTS = ['all', 'approved', 'unapproved'];
const PAGE_SIZE     = 10;

type CreateStep =
  | { step: 'closed' }
  | { step: 'event' }
  | { step: 'tickets'; event: AdminEvent & { flyer_url?: string }; mode: 'post-create' | 'standalone' };

const Events: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents]           = useState<AdminEvent[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('all');
  const [approvalFilter, setApproval] = useState(
    searchParams.get('filter') === 'unapproved' ? 'unapproved' : 'all',
  );
  const [page, setPage]             = useState(1);
  const [confirm, setConfirm]       = useState<{ action: 'approve' | 'reject' | 'delete'; event: AdminEvent } | null>(null);
  const [actionLoading, setAL]      = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
  const [alert, setAlert]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [detailEvent, setDetail]    = useState<AdminEvent | null>(null);
  const [createFlow, setCreateFlow] = useState<CreateStep>({ step: 'closed' });
  const [coOrgsEvent, setCoOrgsEvent] = useState<AdminEvent | null>(null);

  useEffect(() => {
    listAllEvents()
      .then(data => { setEvents(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  const filtered = useMemo(() => events.filter(e => {
    if (search &&
        !e.title.toLowerCase().includes(search.toLowerCase()) &&
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
      // Roll back
      if (action === 'approve') {
        setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: false } : e));
      } else if (action === 'reject') {
        setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: true, is_active: true } : e));
      } else if (action === 'delete') {
        setEvents(p => [event, ...p]);
      }
      setAlert({ type: 'error', msg: err?.response?.data?.detail ?? 'Action failed. Please try again.' });
    } finally {
      setAL(false);
    }
  };

  const handleStatusChange = async (event: AdminEvent, newStatus: EventLifecycleStatus) => {
    const previousStatus = event.status;
    setStatusLoadingId(event.id);

    // Optimistic update
    setEvents(p => p.map(e => e.id === event.id ? { ...e, status: newStatus } : e));
    if (detailEvent?.id === event.id) {
      setDetail(d => d ? { ...d, status: newStatus } : d);
    }

    try {
      const updated = await updateEventStatus(event.id, newStatus);
      setEvents(p => p.map(e => e.id === updated.id ? updated : e));
      if (detailEvent?.id === updated.id) setDetail(updated);
      setAlert({
        type: 'success',
        msg: newStatus === 'upcoming' && previousStatus === 'cancelled'
          ? `"${event.title}" has been reopened.`
          : `"${event.title}" status changed to ${newStatus}.`,
      });
    } catch (err: any) {
      // Roll back
      setEvents(p => p.map(e => e.id === event.id ? { ...e, status: previousStatus } : e));
      if (detailEvent?.id === event.id) {
        setDetail(d => d ? { ...d, status: previousStatus } : d);
      }
      setAlert({ type: 'error', msg: err?.response?.data?.detail ?? 'Failed to update event status. Please try again.' });
    } finally {
      setStatusLoadingId(null);
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
    setAlert({
      type: 'success',
      msg: mode === 'post-create'
        ? `"${event.title}" created with ${ticketTypes.length} ticket ${ticketTypes.length === 1 ? 'type' : 'types'}.`
        : `${ticketTypes.length} ticket ${ticketTypes.length === 1 ? 'type' : 'types'} added to "${event.title}".`,
    });
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
            <button onClick={() => setApproval('unapproved')} className="btn-primary btn-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Review Pending ({pendingCount})</span>
              <span className="sm:hidden">{pendingCount}</span>
            </button>
          )}
          <button onClick={() => setCreateFlow({ step: 'event' })} className="btn-secondary btn-sm flex items-center gap-2">
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
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[130px]">
              {STATUS_OPTS.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <select value={approvalFilter} onChange={e => { setApproval(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[140px]">
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
                        <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{event.city}, {event.country}
                        </p>
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
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(event.start_time)}</td>
                      <td><span className="text-sm font-semibold text-gray-800">{event.total_bookings ?? 0}</span></td>
                      <td>
                        <EventActionsMenu
                          event={event}
                          onAction={a => setConfirm({ action: a, event })}
                          onStatusChange={s => handleStatusChange(event, s)}
                          statusUpdating={statusLoadingId === event.id}
                          onView={() => setDetail(event)}
                          onAddTicketTypes={() => openAddTicketTypes(event)}
                          onManageCoOrganizers={() => { setDetail(null); setCoOrgsEvent(event); }}
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
                      onStatusChange={s => handleStatusChange(event, s)}
                      statusUpdating={statusLoadingId === event.id}
                      onView={() => setDetail(event)}
                      onAddTicketTypes={() => openAddTicketTypes(event)}
                      onManageCoOrganizers={() => { setDetail(null); setCoOrgsEvent(event); }}
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
          onStatusChange={s => handleStatusChange(detailEvent, s)}
          onAddTicketTypes={() => openAddTicketTypes(detailEvent)}
        />
      )}

      {createFlow.step === 'event' && (
        <CreateEventModal
          onClose={() => setCreateFlow({ step: 'closed' })}
          onCreated={handleEventCreated}
        />
      )}

      {createFlow.step === 'tickets' && (
        <CreateTicketTypesModal
          event={createFlow.event}
          mode={createFlow.mode}
          onClose={() => setCreateFlow({ step: 'closed' })}
          onFinish={(event, ticketTypes) => handleTicketsFinished(event, ticketTypes, createFlow.mode)}
          onSkip={createFlow.mode === 'post-create' ? handleTicketsSkipped : undefined}
        />
      )}

      {coOrgsEvent && (
        <ManageCoOrganizersModal
          event={coOrgsEvent}
          onClose={() => setCoOrgsEvent(null)}
        />
      )}
    </div>
  );
};

export default Events;