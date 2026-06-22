// src/apps/admin/pages/Bookings.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { Ticket, Download, Eye, Trash2, X, MoreVertical, RefreshCw } from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import { admin_listAllBookings, admin_deleteBooking } from '@shared/api/user/bookingsApi';
import { formatDateTime, formatKES } from '@admin/utils/format';
import type { AdminBooking } from '@admin/types';

const STATUS_OPTS = ['all', 'pending', 'confirmed', 'cancelled', 'refunded'];
const PAGE_SIZE = 10;

/* ── Kebab menu ── */
const RowMenu: React.FC<{
  onView: () => void;
  onDelete: () => void;
}> = ({ onView, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        className="btn-icon btn-sm"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-gray-100 bg-white shadow-lg py-1">
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onView(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 text-gray-400" /> View Details
          </button>
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const Bookings: React.FC = () => {
  const [bookings, setBookings]   = useState<AdminBooking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [page, setPage]           = useState(1);
  const [confirm, setConfirm]     = useState<{ booking: AdminBooking } | null>(null);
  const [actionLoading, setAL]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [detail, setDetail]       = useState<AdminBooking | null>(null);

  const fetchData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    admin_listAllBookings()
      .then(data => { setBookings(data as AdminBooking[]); })
      .catch(() => { setError('Failed to load bookings.'); })
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const str = `${b.customer_name ?? ''} ${b.customer_email ?? ''} ${b.event_title ?? ''}`.toLowerCase();
      if (search && !str.includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      return true;
    });
  }, [bookings, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => ({
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    refunded:  bookings.filter(b => b.status === 'refunded').length,
    revenue:   bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.total_price, 0),
  }), [bookings]);

  const handleDelete = async () => {
    if (!confirm) return;
    setAL(true);
    try {
      await admin_deleteBooking(confirm.booking.id);
      setBookings(p => p.filter(b => b.id !== confirm.booking.id));
      setAlert({ type: 'success', msg: 'Booking deleted successfully.' });
    } catch {
      setAlert({ type: 'error', msg: 'Failed to delete booking.' });
    } finally {
      setAL(false);
      setConfirm(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Customer', 'Email', 'Event', 'Ticket', 'Qty', 'Total', 'Status', 'Date'],
      ...filtered.map(b => [
        b.id, b.customer_name ?? '', b.customer_email ?? '',
        b.event_title ?? '', b.ticket_type_name ?? '',
        b.quantity, b.total_price, b.status, b.created_at,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'bookings.csv';
    a.click();
  };

  if (error) {
    return (
      <div className="space-y-5">
        <AlertBanner type="error" message={error} onClose={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">{bookings.length} total bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn-icon btn-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 stagger">
        {[
          { label: 'Confirmed', value: totals.confirmed,          cls: 'text-emerald-600' },
          { label: 'Pending',   value: totals.pending,            cls: 'text-amber-600'   },
          { label: 'Cancelled', value: totals.cancelled,          cls: 'text-red-600'     },
          { label: 'Refunded',  value: totals.refunded,           cls: 'text-purple-600'  },
          { label: 'Revenue',   value: formatKES(totals.revenue), cls: 'text-gray-900'    },
        ].map(c => (
          <div key={c.label} className="card-sm text-center overflow-hidden">
            <p className="text-xs text-gray-500 mb-1 truncate">{c.label}</p>
            <p className={`text-sm font-bold leading-tight break-all ${c.cls}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search by customer, event…"
        filters={
          <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="select-field w-auto min-w-[130px]">
            {STATUS_OPTS.map(s => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        }
      />

      <SectionCard title="All Bookings" subtitle={`${filtered.length} results`} noPadding>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={7} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={Ticket} title="No bookings found" />
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Customer</th><th>Event</th><th>Ticket Type</th>
                    <th>Qty</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(b => (
                    <tr key={b.id}>
                      <td className="text-gray-400 text-xs">#{b.id}</td>
                      <td>
                        <p className="font-medium text-sm text-gray-900">{b.customer_name}</p>
                        <p className="text-xs text-gray-500">{b.customer_email}</p>
                      </td>
                      <td className="text-sm text-gray-700 max-w-[180px]">
                        <p className="truncate">{b.event_title}</p>
                      </td>
                      <td className="text-xs text-gray-600">{b.ticket_type_name}</td>
                      <td className="font-semibold text-gray-900">{b.quantity}</td>
                      <td className="font-semibold text-emerald-700 whitespace-nowrap">
                        {formatKES(b.total_price)}
                      </td>
                      <td><StatusBadge status={b.status} /></td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(b.created_at)}
                      </td>
                      <td>
                        <RowMenu
                          onView={() => setDetail(b)}
                          onDelete={() => setConfirm({ booking: b })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(b => (
                <div key={b.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{b.customer_name}</p>
                      <p className="text-xs text-gray-500 truncate">{b.customer_email}</p>
                    </div>
                    <div className="flex-shrink-0 -mr-1 -mt-1">
                      <RowMenu
                        onView={() => setDetail(b)}
                        onDelete={() => setConfirm({ booking: b })}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 font-medium truncate">{b.event_title}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-gray-500">{b.ticket_type_name} · Qty {b.quantity}</span>
                    </div>
                    <span className="font-bold text-emerald-700 text-sm whitespace-nowrap">
                      {formatKES(b.total_price)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{formatDateTime(b.created_at)}</p>
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
          title="Delete Booking"
          message={`Delete booking #${confirm.booking.id} for ${confirm.booking.customer_name}? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {detail && <BookingDetailModal booking={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

const BookingDetailModal: React.FC<{ booking: AdminBooking; onClose: () => void }> = ({ booking, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-panel max-w-lg p-6" onClick={e => e.stopPropagation()}>
      <div className="flex items-start justify-between mb-5">
        <h3 className="text-xl font-bold text-gray-900">Booking #{booking.id}</h3>
        <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
      </div>
      <div className="space-y-4">
        <div className="bg-purple-50 rounded-xl p-4">
          <StatusBadge status={booking.status} />
          <p className="text-2xl font-bold text-purple-800 mt-2">{formatKES(booking.total_price)}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {([
            ['Customer', booking.customer_name],
            ['Email', booking.customer_email],
            ['Event', booking.event_title],
            ['Ticket Type', booking.ticket_type_name],
            ['Quantity', booking.quantity],
            ['Booked On', formatDateTime(booking.created_at)],
            ['Last Updated', formatDateTime(booking.updated_at)],
          ] as [string, string | number][]).map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 pt-5 border-t border-gray-100">
        <button onClick={onClose} className="btn-secondary w-full">Close</button>
      </div>
    </div>
  </div>
);

export default Bookings;