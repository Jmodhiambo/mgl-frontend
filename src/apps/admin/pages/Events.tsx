// src/apps/admin/pages/Events.tsx
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar, CheckCircle, XCircle, Trash2, Eye,
  MoreVertical, MapPin, User, X, Clock,
  Download,
} from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import { listAllEvents, approveEvent, rejectEvent, deleteEvent } from '@admin/services/adminService';
import { formatDateTime, formatDate } from '@admin/utils/dummyData';
import type { AdminEvent } from '@admin/types';

const STATUS_OPTS = ['all', 'upcoming', 'ongoing', 'completed', 'cancelled', 'draft'];
const APPROVAL_OPTS = ['all', 'approved', 'unapproved'];
const PAGE_SIZE = 10;

const Events: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [events, setEvents]     = useState<AdminEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState(searchParams.get('filter') === 'unapproved' ? 'all' : 'all');
  const [approvalFilter, setApproval] = useState(searchParams.get('filter') === 'unapproved' ? 'unapproved' : 'all');
  const [page, setPage]         = useState(1);
  const [confirm, setConfirm]   = useState<{ action: 'approve'|'reject'|'delete'; event: AdminEvent } | null>(null);
  const [actionLoading, setAL]  = useState(false);
  const [alert, setAlert]       = useState<{ type: 'success'|'error'; msg: string } | null>(null);
  const [detailEvent, setDetail] = useState<AdminEvent | null>(null);

  useEffect(() => {
    listAllEvents().then(data => { setEvents(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
          !(e.organizer_name ?? '').toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (approvalFilter === 'approved' && !e.is_approved) return false;
      if (approvalFilter === 'unapproved' && e.is_approved) return false;
      return true;
    });
  }, [events, search, statusFilter, approvalFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAction = async () => {
    if (!confirm) return;
    setAL(true);
    try {
      const { action, event } = confirm;
      if (action === 'approve') {
        await approveEvent(event.id);
        setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: true } : e));
        setAlert({ type: 'success', msg: `"${event.title}" approved successfully.` });
      } else if (action === 'reject') {
        await rejectEvent(event.id);
        setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: false, status: 'cancelled' } : e));
        setAlert({ type: 'success', msg: `"${event.title}" has been rejected.` });
      } else if (action === 'delete') {
        await deleteEvent(event.id);
        setEvents(p => p.filter(e => e.id !== event.id));
        setAlert({ type: 'success', msg: `"${event.title}" deleted.` });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Action failed. Please try again.' });
    } finally {
      setAL(false);
      setConfirm(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['ID','Title','Organizer','Status','Approved','City','Start Date','Bookings','Revenue'],
      ...filtered.map(e => [
        e.id, e.title, e.organizer_name, e.status, e.is_approved,
        e.city, e.start_time, e.total_bookings, e.total_revenue,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'events.csv'; a.click();
  };

  const pendingCount = events.filter(e => !e.is_approved).length;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Management</h1>
          <p className="page-subtitle">
            {events.length} total events
            {pendingCount > 0 && <span className="ml-2 badge-warning">{pendingCount} pending approval</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={() => setApproval('unapproved')}
              className="btn-primary btn-sm flex items-center gap-2"
            >
              <Clock className="w-4 h-4" /> Review Pending ({pendingCount})
            </button>
          )}
          <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search events or organizer…"
        filters={
          <>
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[130px]">
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select value={approvalFilter} onChange={e => { setApproval(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[140px]">
              {APPROVAL_OPTS.map(a => <option key={a} value={a}>{a === 'all' ? 'All Approval' : a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
            </select>
          </>
        }
      />

      <SectionCard
        title="All Events"
        subtitle={`${paginated.length} of ${filtered.length} events`}
        noPadding
      >
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={7} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={Calendar} title="No events found" description="Try adjusting your filters" />
        ) : (
          <>
            <div className="table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Event</th>
                    <th>Organizer</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th>Date</th>
                    <th>Bookings</th>
                    <th>Actions</th>
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
                          onAction={(a) => setConfirm({ action: a, event })}
                          onView={() => setDetail(event)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {detailEvent && <EventDetailModal event={detailEvent} onClose={() => setDetail(null)} onApprove={() => { setConfirm({ action: 'approve', event: detailEvent }); setDetail(null); }} onReject={() => { setConfirm({ action: 'reject', event: detailEvent }); setDetail(null); }} />}
    </div>
  );
};

const EventActionsMenu: React.FC<{
  event: AdminEvent;
  onAction: (a: 'approve'|'reject'|'delete') => void;
  onView: () => void;
}> = ({ event, onAction, onView }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="btn-icon">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up">
            <button onClick={() => { onView(); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700">
              <Eye className="w-4 h-4 text-gray-400" /> View Details
            </button>
            {!event.is_approved && (
              <button onClick={() => { onAction('approve'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-emerald-50 text-emerald-700">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            )}
            {event.is_approved && (
              <button onClick={() => { onAction('reject'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-amber-50 text-amber-700">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            )}
            <div className="divider my-1" />
            <button onClick={() => { onAction('delete'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const EventDetailModal: React.FC<{
  event: AdminEvent;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}> = ({ event, onClose, onApprove, onReject }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-panel max-w-2xl p-6" onClick={e => e.stopPropagation()}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />{event.venue}, {event.city}
          </p>
        </div>
        <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          ['Event ID', `#${event.id}`],
          ['Category', event.category],
          ['Status', event.status],
          ['Approved', event.is_approved ? 'Yes' : 'No'],
          ['Organizer', event.organizer_name ?? 'N/A'],
          ['Country', event.country],
          ['Start', formatDateTime(event.start_time)],
          ['End', formatDateTime(event.end_time)],
          ['Total Bookings', event.total_bookings ?? 0],
          ['Total Revenue', event.total_revenue ? `KES ${event.total_revenue.toLocaleString()}` : 'N/A'],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <p className="text-xs text-gray-500 mb-1">Description</p>
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{event.description}</p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="btn-secondary flex-1">Close</button>
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
);

export default Events;