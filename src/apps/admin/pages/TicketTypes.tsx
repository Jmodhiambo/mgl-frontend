// src/apps/admin/pages/TicketTypes.tsx
import { useEffect, useState, useMemo } from 'react';
import { Tag, Download, X, Plus, Search, Calendar, Pencil, DollarSign, Users, Loader2, AlertCircle, ImageOff } from 'lucide-react';
import {
  FilterBar, SectionCard, Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import { admin_getEventTicketTypes } from '@shared/api/user/ticketTypesApi';
import { formatKES } from '@admin/utils/format';
import { listAllEvents, updateTicketType } from '@admin/services/adminService';
import type { AdminTicketType, AdminEvent } from '@admin/types';

import CreateTicketTypesModal, {
  type SavedTicketType,
} from '@admin/components/modals/events/CreateTicketTypesModal';

const PAGE_SIZE = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseApiError(err: any, fallback: string): string {
  const raw = err?.response?.data?.detail;
  if (Array.isArray(raw)) {
    return raw
      .map((e: any) => {
        const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : 'field';
        return `${field}: ${e.msg}`;
      })
      .join('; ');
  }
  if (typeof raw === 'string') return raw;
  return fallback;
}

// ─── Event Picker Modal ───────────────────────────────────────────────────────

const EventPickerModal: React.FC<{
  events: AdminEvent[];
  onSelect: (event: AdminEvent) => void;
  onClose: () => void;
}> = ({ events, onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    events.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.organizer_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase()),
    ),
    [events, search],
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Select an Event</h3>
            <p className="text-sm text-gray-500 mt-0.5">Choose which event to add ticket types to</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events…"
            className="input-field pl-9 w-full"
            autoFocus
          />
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No events match your search</p>
            </div>
          ) : (
            filtered.map(event => (
              <button
                key={event.id}
                onClick={() => onSelect(event)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
              >
                {(event as any).flyer_url ? (
                  <img
                    src={(event as any).flyer_url}
                    alt={event.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-purple-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {event.organizer_name ?? 'Unknown organizer'} · {event.city}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  event.is_approved
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {event.is_approved ? 'Approved' : 'Pending'}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary w-full">Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Ticket Type Modal ───────────────────────────────────────────────────

interface EditForm {
  name: string;
  description: string;
  price: string;
  total_quantity: string;
  is_active: boolean;
}

interface EditErrors {
  name?: string;
  price?: string;
  total_quantity?: string;
}

const EditTicketTypeModal: React.FC<{
  ticket: AdminTicketType;
  event?: AdminEvent;
  onClose: () => void;
  onSaved: (updated: AdminTicketType) => void;
}> = ({ ticket, event, onClose, onSaved }) => {
  const [form, setForm] = useState<EditForm>({
    name:           ticket.name,
    description:    ticket.description ?? '',
    price:          String(ticket.price),
    total_quantity: String(ticket.total_quantity),
    is_active:      ticket.is_active,
  });
  const [errors, setErrors]   = useState<EditErrors>({});
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState('');

  const validate = (): boolean => {
    const e: EditErrors = {};
    if (!form.name.trim())                              e.name = 'Name is required';
    if (!form.price || parseFloat(form.price) <= 0)    e.price = 'Price must be > 0';
    const qty = parseInt(form.total_quantity);
    if (!form.total_quantity || qty <= 0)               e.total_quantity = 'Quantity must be > 0';
    if (qty < ticket.quantity_sold)
      e.total_quantity = `Cannot be less than ${ticket.quantity_sold} already sold`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError('');
    try {
      const updated = await updateTicketType(ticket.id, {
        name:           form.name.trim(),
        description:    form.description.trim() || undefined,
        price:          parseFloat(form.price),
        total_quantity: parseInt(form.total_quantity),
        is_active:      form.is_active,
      });
      onSaved(updated);
    } catch (err: any) {
      setSaveError(parseApiError(err, 'Failed to update ticket type. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const inp = (key: keyof EditErrors) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  const flyerUrl = (event as any)?.flyer_url as string | undefined;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-lg p-6" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Pencil className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit Ticket Type</h3>
              <p className="text-sm text-gray-500">#{ticket.id} · {ticket.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon flex-shrink-0 ml-3">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event recap with flyer */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl mb-5">
          {flyerUrl ? (
            <img
              src={flyerUrl}
              alt={event?.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <ImageOff className="w-5 h-5 text-purple-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {event?.title ?? `Event #${ticket.event_id}`}
            </p>
            {event && (
              <p className="text-xs text-gray-500">{event.venue}, {event.city}</p>
            )}
          </div>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            event?.is_approved
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {event?.is_approved ? 'Approved' : 'Pending'}
          </span>
        </div>

        {/* Sold warning — inform admin they can only raise total_quantity */}
        {ticket.quantity_sold > 0 && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">{ticket.quantity_sold} tickets already sold.</span>{' '}
              Total quantity cannot be reduced below this number.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }}
              placeholder="e.g. VIP Pass, General Admission"
              className={inp('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              rows={2}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What's included with this ticket? (optional)"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Price (KES) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number" min="0" value={form.price}
                  onChange={e => { setForm(p => ({ ...p, price: e.target.value })); setErrors(p => ({ ...p, price: undefined })); }}
                  placeholder="1500"
                  className={`${inp('price')} pl-9`}
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Total Quantity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number" min={ticket.quantity_sold || 1} value={form.total_quantity}
                  onChange={e => { setForm(p => ({ ...p, total_quantity: e.target.value })); setErrors(p => ({ ...p, total_quantity: undefined })); }}
                  placeholder="100"
                  className={`${inp('total_quantity')} pl-9`}
                />
              </div>
              {errors.total_quantity && <p className="mt-1 text-xs text-red-600">{errors.total_quantity}</p>}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">Active</p>
              <p className="text-xs text-gray-500">Inactive types are hidden from buyers</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                form.is_active ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.is_active ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Sold / remaining summary */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Sold',      value: ticket.quantity_sold.toLocaleString(),    cls: 'text-gray-900' },
            { label: 'Available', value: ticket.quantity_available.toLocaleString(), cls: 'text-emerald-700' },
            { label: 'Total',     value: ticket.total_quantity.toLocaleString(),   cls: 'text-purple-700' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
              <p className={`text-sm font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Save error */}
        {saveError && (
          <div className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-xs">{saveError}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Pencil className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Ticket Detail Modal ──────────────────────────────────────────────────────

const TicketDetailModal: React.FC<{
  ticket: AdminTicketType;
  event?: AdminEvent;
  onClose: () => void;
  onEdit: () => void;
}> = ({ ticket, event, onClose, onEdit }) => {
  const fillRate  = Math.round((ticket.quantity_sold / ticket.total_quantity) * 100);
  const remaining = ticket.quantity_available;
  const flyerUrl  = (event as any)?.flyer_url as string | undefined;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Flyer banner */}
        <div className="relative w-full h-40 bg-gray-100 flex-shrink-0">
          {flyerUrl && !imgError ? (
            <img
              src={flyerUrl}
              alt={event?.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <ImageOff className="w-8 h-8" />
              <p className="text-xs">No flyer</p>
            </div>
          )}
          {/* Overlay gradient so the tag icon reads well */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Tag icon + ticket name floating over the flyer */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{ticket.name}</p>
              <p className="text-white/70 text-xs">{event?.title ?? `Event #${ticket.event_id}`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Price hero */}
          <div className="bg-purple-50 rounded-xl p-4 mb-5 text-center">
            <p className="text-xs text-gray-500 mb-1">Ticket Price</p>
            <p className="text-3xl font-bold text-purple-700">{formatKES(ticket.price)}</p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${
              ticket.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {ticket.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {([
              ['Ticket Type ID', `#${ticket.id}`],
              ['Event ID',       `#${ticket.event_id}`],
              ['Total Capacity', ticket.total_quantity.toLocaleString()],
              ['Tickets Sold',   ticket.quantity_sold.toLocaleString()],
              ['Remaining',      remaining.toLocaleString()],
              ['Fill Rate',      `${fillRate}%`],
              ['Revenue Earned', formatKES(ticket.price * ticket.quantity_sold)],
              ['Max Revenue',    formatKES(ticket.price * ticket.total_quantity)],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {ticket.description && (
            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{ticket.description}</p>
            </div>
          )}

          {/* Fill rate bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Fill Rate</span><span>{fillRate}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${fillRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {remaining} tickets remaining of {ticket.total_quantity} total
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={onClose} className="btn-secondary flex-1">Close</button>
            <button
              onClick={onEdit}
              className="btn-primary flex-1 flex items-center justify-center gap-1.5"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TicketTypes: React.FC = () => {
  const [tickets, setTickets]     = useState<AdminTicketType[]>([]);
  const [events, setEvents]       = useState<AdminEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [alert, setAlert]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [search, setSearch]       = useState('');
  const [eventFilter, setEvent]   = useState('all');
  const [activeFilter, setActive] = useState('all');
  const [page, setPage]           = useState(1);

  // detail + edit modals
  const [detail, setDetail]               = useState<AdminTicketType | null>(null);
  const [editing, setEditing]             = useState<AdminTicketType | null>(null);

  // create flow
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadData = () => {
    setLoading(true);
    setError(null);
    listAllEvents()
      .then(async evts => {
        setEvents(evts);
        const allTickets = await Promise.all(
          evts.map(e => admin_getEventTicketTypes(e.id).catch(() => [])),
        );
        setTickets(allTickets.flat() as AdminTicketType[]);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load ticket types.');
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  // ── Derived data ───────────────────────────────────────────────────────────

  const eventOptions = useMemo(() =>
    events.map(e => ({ id: e.id, title: e.title })),
    [events],
  );

  const filtered = useMemo(() =>
    tickets.filter(t => {
      const eventTitle = events.find(e => e.id === t.event_id)?.title ?? '';
      if (search && !`${t.name} ${eventTitle}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (eventFilter !== 'all' && String(t.event_id) !== eventFilter) return false;
      if (activeFilter === 'active' && !t.is_active) return false;
      if (activeFilter === 'inactive' && t.is_active) return false;
      return true;
    }),
    [tickets, events, search, eventFilter, activeFilter],
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => ({
    totalSold:    tickets.reduce((s, t) => s + t.quantity_sold, 0),
    totalRevenue: tickets.reduce((s, t) => s + t.price * t.quantity_sold, 0),
    avgFillRate:  tickets.length
      ? Math.round(tickets.reduce((s, t) => s + (t.quantity_sold / t.total_quantity) * 100, 0) / tickets.length)
      : 0,
  }), [tickets]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleEventSelected = (event: AdminEvent) => {
    setPickerOpen(false);
    setSelectedEvent(event);
  };

  const handleCreateFinished = (_event: AdminEvent, ticketTypes: SavedTicketType[]) => {
    setSelectedEvent(null);
    setAlert({
      type: 'success',
      msg: `${ticketTypes.length} ticket ${ticketTypes.length === 1 ? 'type' : 'types'} added to "${_event.title}".`,
    });
    loadData();
  };

  const handleEditSaved = (updated: AdminTicketType) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    // keep detail modal in sync if it's still open
    if (detail?.id === updated.id) setDetail(updated);
    setEditing(null);
    setAlert({ type: 'success', msg: `"${updated.name}" updated successfully.` });
  };

  // ── Export ─────────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = [
      ['ID', 'Event', 'Name', 'Price', 'Total Qty', 'Sold', 'Available', 'Active'],
      ...filtered.map(t => [
        t.id,
        events.find(e => e.id === t.event_id)?.title ?? t.event_id,
        t.name, t.price, t.total_quantity, t.quantity_sold,
        t.quantity_available, t.is_active,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'ticket-types.csv';
    a.click();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ticket Types</h1>
          <p className="page-subtitle">{tickets.length} ticket types across {events.length} events</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPickerOpen(true)}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Ticket Type</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <div className="grid grid-cols-3 gap-4 stagger">
        <div className="card-sm text-center overflow-hidden">
          <p className="text-xs text-gray-500 mb-1">Total Sold</p>
          <p className="text-xl font-bold text-purple-700 leading-tight">{totals.totalSold.toLocaleString()}</p>
        </div>
        <div className="card-sm text-center overflow-hidden">
          <p className="text-xs text-gray-500 mb-1">Revenue</p>
          <p className="text-sm font-bold text-emerald-600 leading-tight break-all">{formatKES(totals.totalRevenue)}</p>
        </div>
        <div className="card-sm text-center overflow-hidden">
          <p className="text-xs text-gray-500 mb-1">Avg. Fill</p>
          <p className="text-xl font-bold text-blue-600 leading-tight">{totals.avgFillRate}%</p>
        </div>
      </div>

      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search ticket type or event…"
        filters={
          <>
            <select value={eventFilter} onChange={e => { setEvent(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[180px]">
              <option value="all">All Events</option>
              {eventOptions.map(e => (
                <option key={e.id} value={String(e.id)}>{e.title}</option>
              ))}
            </select>
            <select value={activeFilter} onChange={e => { setActive(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[130px]">
              <option value="all">All Types</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </>
        }
      />

      <SectionCard title="Ticket Types" subtitle={`${filtered.length} results`} noPadding>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={7} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No ticket types found"
            description={search || eventFilter !== 'all' || activeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create a ticket type to get started'
            }
          />
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Event</th><th>Price</th>
                    <th>Capacity</th><th>Sold</th><th>Fill Rate</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(t => {
                    const event    = events.find(e => e.id === t.event_id);
                    const fillRate = Math.round((t.quantity_sold / t.total_quantity) * 100);
                    return (
                      <tr key={t.id}>
                        <td className="text-gray-400 text-xs">#{t.id}</td>
                        <td>
                          <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                          {t.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[160px]">{t.description}</p>
                          )}
                        </td>
                        <td className="text-sm text-gray-700 max-w-[180px]">
                          <p className="truncate">{event?.title ?? `Event #${t.event_id}`}</p>
                        </td>
                        <td className="font-semibold text-emerald-700 whitespace-nowrap">{formatKES(t.price)}</td>
                        <td className="text-sm text-gray-700">{t.total_quantity.toLocaleString()}</td>
                        <td className="text-sm font-semibold text-gray-900">{t.quantity_sold.toLocaleString()}</td>
                        <td>
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${fillRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 w-8">{fillRate}%</span>
                          </div>
                        </td>
                        <td>
                          {t.is_active
                            ? <span className="badge-success">Active</span>
                            : <span className="badge-gray">Inactive</span>}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDetail(t)}
                              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                            >
                              View →
                            </button>
                            <span className="text-gray-300 mx-1">|</span>
                            <button
                              onClick={() => setEditing(t)}
                              className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-0.5"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(t => {
                const event    = events.find(e => e.id === t.event_id);
                const fillRate = Math.round((t.quantity_sold / t.total_quantity) * 100);
                return (
                  <div key={t.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {event?.title ?? `Event #${t.event_id}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {t.is_active
                          ? <span className="badge-success">Active</span>
                          : <span className="badge-gray">Inactive</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-emerald-700 text-sm">{formatKES(t.price)}</span>
                      <span className="text-xs text-gray-500">{t.quantity_sold} / {t.total_quantity} sold</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${fillRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8 flex-shrink-0">{fillRate}%</span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => setDetail(t)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        View details →
                      </button>
                      <button
                        onClick={() => setEditing(t)}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-0.5"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
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

      {/* Ticket detail modal */}
      {detail && (
        <TicketDetailModal
          ticket={detail}
          event={events.find(e => e.id === detail.event_id)}
          onClose={() => setDetail(null)}
          onEdit={() => { setEditing(detail); setDetail(null); }}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <EditTicketTypeModal
          ticket={editing}
          event={events.find(e => e.id === editing.event_id)}
          onClose={() => setEditing(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* Event picker → create flow */}
      {pickerOpen && (
        <EventPickerModal
          events={events}
          onSelect={handleEventSelected}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {selectedEvent && (
        <CreateTicketTypesModal
          event={selectedEvent}
          mode="standalone"
          onClose={() => setSelectedEvent(null)}
          onFinish={handleCreateFinished}
        />
      )}
    </div>
  );
};

export default TicketTypes;