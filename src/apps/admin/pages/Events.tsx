// src/apps/admin/pages/Events.tsx
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar, CheckCircle, XCircle, Trash2, Eye,
  MoreVertical, MapPin, User, X, Clock, Download,
  Plus, Upload, ImageOff,
} from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import { listAllEvents, approveEvent, rejectEvent, deleteEvent } from '@admin/services/adminService';
import { dummyUsers, formatDateTime, formatDate } from '@admin/utils/dummyData';
import type { AdminEvent } from '@admin/types';

const STATUS_OPTS   = ['all', 'upcoming', 'ongoing', 'completed', 'cancelled', 'draft'];
const APPROVAL_OPTS = ['all', 'approved', 'unapproved'];
const CATEGORIES    = ['Music', 'Tech', 'Sports', 'Food', 'Comedy', 'Culture', 'Party', 'Other'];
const PAGE_SIZE     = 10;

// ─── Create Event Modal ───────────────────────────────────────────────────────
interface CreateEventForm {
  title: string;
  description: string;
  venue: string;
  city: string;
  country: string;
  category: string;
  start_time: string;
  end_time: string;
  organizer_id: number | '';
  flyer: File | null;
}

const CreateEventModal: React.FC<{
  onClose: () => void;
  onCreated: (event: AdminEvent) => void;
}> = ({ onClose, onCreated }) => {
  const organizers = dummyUsers.filter(u => u.role === 'organizer');

  const [form, setForm] = useState<CreateEventForm>({
    title: '', description: '', venue: '', city: '', country: 'Kenya',
    category: 'Music', start_time: '', end_time: '',
    organizer_id: '', flyer: null,
  });
  const [flyerPreview, setFlyerPreview] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof CreateEventForm, string>>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: Partial<Record<keyof CreateEventForm, string>> = {};
    if (!form.title.trim())         e.title        = 'Event title is required';
    if (!form.venue.trim())         e.venue        = 'Venue is required';
    if (!form.city.trim())          e.city         = 'City is required';
    if (!form.start_time)           e.start_time   = 'Start time is required';
    if (!form.end_time)             e.end_time     = 'End time is required';
    if (form.organizer_id === '')   e.organizer_id = 'Select an organizer';
    if (form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time))
      e.end_time = 'End time must be after start time';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, flyer: 'Max 5 MB' })); return; }
    if (!file.type.startsWith('image/')) { setErrors(p => ({ ...p, flyer: 'Images only' })); return; }
    setForm(p => ({ ...p, flyer: file }));
    const reader = new FileReader();
    reader.onloadend = () => setFlyerPreview(reader.result as string);
    reader.readAsDataURL(file);
    setErrors(p => ({ ...p, flyer: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: replace with real API — FormData upload
      await new Promise(r => setTimeout(r, 900));
      const org = organizers.find(o => o.id === Number(form.organizer_id))!;
      const newEvent: AdminEvent = {
        id: Math.floor(Math.random() * 9000) + 1000,
        title:          form.title,
        slug:           form.title.toLowerCase().replace(/\s+/g, '-'),
        description:    form.description,
        category:       form.category,
        venue:          form.venue,
        city:           form.city,
        country:        form.country,
        start_time:     new Date(form.start_time).toISOString(),
        end_time:       new Date(form.end_time).toISOString(),
        organizer_id:   Number(form.organizer_id),
        organizer_name: `${org.first_name} ${org.last_name}`,
        status:         'upcoming',
        is_approved:    false,
        is_active:      false,
        created_at:     new Date().toISOString(),
        updated_at:     new Date().toISOString(),
        total_bookings: 0,
        total_revenue:  0,
        // store preview url for display
        flyer_url: flyerPreview || undefined,
      } as AdminEvent & { flyer_url?: string };
      onCreated(newEvent);
    } catch {
      setErrors({ title: 'Failed to create event. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inp = (key: keyof CreateEventForm) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Create Event on Behalf of Organizer</h3>
            <p className="text-sm text-gray-500 mt-0.5">This event will be attributed to the selected organizer and submitted for review.</p>
          </div>
          <button onClick={onClose} className="btn-icon flex-shrink-0 ml-4"><X className="w-5 h-5" /></button>
        </div>

        {/* Organizer notice */}
        <div className="mt-4 mb-5 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <User className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Events created here are logged under your admin account. The organizer will see it in their dashboard and can edit details before it goes live.
          </p>
        </div>

        <div className="space-y-4">
          {/* Organizer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organizer <span className="text-red-500">*</span></label>
            <select value={form.organizer_id} onChange={e => setForm(p => ({ ...p, organizer_id: Number(e.target.value) || '' }))} className={inp('organizer_id')}>
              <option value="">Select organizer…</option>
              {organizers.map(o => (
                <option key={o.id} value={o.id}>{o.first_name} {o.last_name} — {o.email}</option>
              ))}
            </select>
            {errors.organizer_id && <p className="mt-1 text-xs text-red-600">{errors.organizer_id}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} placeholder="e.g. Nairobi Jazz Fest 2026"
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inp('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} rows={3} placeholder="Tell attendees about this event…"
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none" />
          </div>

          {/* Category + Country row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inp('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className={inp('country')} />
            </div>
          </div>

          {/* Venue + City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue <span className="text-red-500">*</span></label>
              <input type="text" value={form.venue} placeholder="e.g. KICC Grounds"
                onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} className={inp('venue')} />
              {errors.venue && <p className="mt-1 text-xs text-red-600">{errors.venue}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
              <input type="text" value={form.city} placeholder="Nairobi"
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={inp('city')} />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={form.start_time}
                onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className={inp('start_time')} />
              {errors.start_time && <p className="mt-1 text-xs text-red-600">{errors.start_time}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={form.end_time}
                onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className={inp('end_time')} />
              {errors.end_time && <p className="mt-1 text-xs text-red-600">{errors.end_time}</p>}
            </div>
          </div>

          {/* Flyer upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Flyer</label>
            {flyerPreview ? (
              <div className="relative">
                <img src={flyerPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <button type="button"
                  onClick={() => { setFlyerPreview(''); setForm(p => ({ ...p, flyer: null })); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label htmlFor="create-event-flyer"
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-6 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                <div className="p-2.5 bg-gray-100 rounded-full"><Upload className="w-5 h-5 text-gray-500" /></div>
                <p className="text-sm text-gray-600 font-medium">Click to upload flyer</p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP — max 5 MB</p>
                <input id="create-event-flyer" type="file" accept="image/*" className="hidden" onChange={handleFlyerChange} />
              </label>
            )}
            {errors.flyer && <p className="mt-1 text-xs text-red-600">{errors.flyer}</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              : <><Plus className="w-4 h-4" /> Create Event</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Events: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents]       = useState<AdminEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState(searchParams.get('filter') === 'unapproved' ? 'all' : 'all');
  const [approvalFilter, setApproval] = useState(searchParams.get('filter') === 'unapproved' ? 'unapproved' : 'all');
  const [page, setPage]           = useState(1);
  const [confirm, setConfirm]     = useState<{ action: 'approve' | 'reject' | 'delete'; event: AdminEvent } | null>(null);
  const [actionLoading, setAL]    = useState(false);
  const [alert, setAlert]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [detailEvent, setDetail]  = useState<AdminEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    listAllEvents().then(data => { setEvents(data); setLoading(false); });
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
    try {
      const { action, event } = confirm;
      if (action === 'approve') {
        await approveEvent(event.id);
        setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: true } : e));
        setAlert({ type: 'success', msg: `"${event.title}" approved.` });
      } else if (action === 'reject') {
        await rejectEvent(event.id);
        setEvents(p => p.map(e => e.id === event.id ? { ...e, is_approved: false, status: 'cancelled' } : e));
        setAlert({ type: 'success', msg: `"${event.title}" rejected.` });
      } else if (action === 'delete') {
        await deleteEvent(event.id);
        setEvents(p => p.filter(e => e.id !== event.id));
        setAlert({ type: 'success', msg: `"${event.title}" deleted.` });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Action failed. Please try again.' });
    } finally { setAL(false); setConfirm(null); }
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Title', 'Organizer', 'Status', 'Approved', 'City', 'Start Date', 'Bookings', 'Revenue'],
      ...filtered.map(e => [e.id, e.title, e.organizer_name, e.status, e.is_approved, e.city, e.start_time, e.total_bookings, e.total_revenue]),
    ];
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'));
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
            <button onClick={() => setApproval('unapproved')} className="btn-primary btn-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Review Pending ({pendingCount})
            </button>
          )}
          <button onClick={() => setShowCreate(true)} className="btn-secondary btn-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </button>
          <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <FilterBar
        search={search} onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search events or organizer…"
        filters={
          <>
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} className="select-field w-auto min-w-[130px]">
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select value={approvalFilter} onChange={e => { setApproval(e.target.value); setPage(1); }} className="select-field w-auto min-w-[140px]">
              {APPROVAL_OPTS.map(a => <option key={a} value={a}>{a === 'all' ? 'All Approval' : a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
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
            <div className="table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr><th>#</th><th>Event</th><th>Organizer</th><th>Status</th><th>Approval</th><th>Date</th><th>Bookings</th><th>Actions</th></tr>
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
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(event.start_time)}</td>
                      <td><span className="text-sm font-semibold text-gray-800">{event.total_bookings ?? 0}</span></td>
                      <td>
                        <EventActionsMenu
                          event={event}
                          onAction={a => setConfirm({ action: a, event })}
                          onView={() => setDetail(event)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} total={filtered.length} limit={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </SectionCard>

      {confirm && (
        <ConfirmDialog
          title={`${confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)} Event`}
          message={`Are you sure you want to ${confirm.action} "${confirm.event.title}"?`}
          confirmLabel={confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)}
          variant={confirm.action === 'delete' || confirm.action === 'reject' ? 'danger' : 'info'}
          onConfirm={handleAction} onCancel={() => setConfirm(null)} loading={actionLoading}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetail(null)}
          onApprove={() => { setConfirm({ action: 'approve', event: detailEvent }); setDetail(null); }}
          onReject={() => { setConfirm({ action: 'reject', event: detailEvent }); setDetail(null); }}
        />
      )}

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={newEvent => {
            setEvents(p => [newEvent, ...p]);
            setShowCreate(false);
            setAlert({ type: 'success', msg: `"${newEvent.title}" created and submitted for approval.` });
          }}
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
}> = ({ event, onAction, onView }) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    if (triggerRef.current) {
      const { bottom } = triggerRef.current.getBoundingClientRect();
      setOpenUpward(window.innerHeight - bottom < 200);
    }
    setOpen(o => !o);
  }, []);

  return (
    <div className="relative">
      <button ref={triggerRef} onClick={handleOpen} className="btn-icon">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 z-20 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up ${openUpward ? 'bottom-full mb-1' : 'top-8'}`}>
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

// ─── Event Detail Modal (rich version with flyer) ─────────────────────────────
const EventDetailModal: React.FC<{
  event: AdminEvent & { flyer_url?: string };
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}> = ({ event, onClose, onApprove, onReject }) => {
  const [imgError, setImgError] = useState(false);
  const flyerUrl = (event as any).flyer_url as string | undefined;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* ── Flyer banner ── */}
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

          {/* Approval badge overlay */}
          <div className="absolute top-3 left-3">
            {event.is_approved
              ? <span className="badge-success shadow-sm">Approved</span>
              : <span className="badge-warning shadow-sm">Pending Approval</span>}
          </div>

          {/* Close button overlay */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-6">
          {/* Title & venue */}
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {event.venue}, {event.city}, {event.country}
            </p>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{event.description}</p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
            {([
              ['Event ID',        `#${event.id}`],
              ['Category',        event.category],
              ['Status',          event.status],
              ['Organizer',       event.organizer_name ?? 'N/A'],
              ['Start',           formatDateTime(event.start_time)],
              ['End',             formatDateTime(event.end_time)],
              ['Total Bookings',  String(event.total_bookings ?? 0)],
              ['Total Revenue',   event.total_revenue ? `KES ${event.total_revenue.toLocaleString()}` : 'N/A'],
              ['Created',         formatDateTime(event.created_at)],
              ['Last Updated',    formatDateTime(event.updated_at)],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
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
    </div>
  );
};

export default Events;