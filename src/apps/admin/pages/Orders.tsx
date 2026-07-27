// src/apps/admin/pages/Orders.tsx
//
// Replaces Bookings.tsx and Payments.tsx.
// Each row is an Order (one checkout = one payment, merged in since the
// relationship is 1:1). Expand a row to see its ticket-type line items
// (the former "Booking" rows).
//
// Manual M-Pesa resolution (Layer 2 of the stuck-payment fix):
//   - Orders whose payment has manual_review_status === 'pending' show a
//     "Needs Review" badge — the user reported an M-Pesa code and it's
//     awaiting a decision.
//   - Any pending mpesa order can be resolved via the kebab menu's "Resolve
//     M-Pesa Code" action, whether or not a code was reported — an admin
//     who spots the payment on the till statement themselves can type the
//     code in directly and approve in one step.
//   - The global "Resolve M-Pesa Code" button next to Export CSV opens the
//     same modal without a pre-selected order, with a searchable list of
//     eligible (pending, mpesa) orders to pick from first.
import { useEffect, useState, useMemo, useRef, Fragment } from 'react';
import {
  ShoppingBag, Download, ChevronDown, ChevronRight, Eye, Trash2, X,
  MoreVertical, KeyRound, Search, Loader2, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import {
  admin_listAllOrders, admin_deleteOrder, admin_resolveMpesaPayment,
} from '@admin/services/ordersApi';
import { formatDateTime, formatKES } from '@admin/utils/format';
import type { AdminOrder } from '@admin/types';

const STATUS_OPTS = ['all', 'pending', 'confirmed', 'cancelled'];
const METHOD_OPTS = ['all', 'mpesa', 'card'];
const PAGE_SIZE = 10;

const methodLabel: Record<string, string> = {
  mpesa: 'M-Pesa',
  card: 'Card',
};

const methodColor: Record<string, string> = {
  mpesa: 'badge-success',
  card: 'badge-info',
};

// An order is eligible for manual resolution if it's an unpaid mpesa order —
// resolving it is exactly what's needed whether or not a code was reported.
const isResolvable = (o: AdminOrder) =>
  o.payment_id != null && o.payment_method === 'mpesa' && o.status === 'pending';

const needsReview = (o: AdminOrder) => o.manual_review_status === 'pending';

/* ── Kebab menu ── */
const RowMenu: React.FC<{
  onView: () => void;
  onDelete: () => void;
  onResolve?: () => void;
}> = ({ onView, onDelete, onResolve }) => {
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
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-gray-100 bg-white shadow-lg py-1">
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onView(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50"
          >
            <Eye className="w-4 h-4 text-gray-400" /> View Details
          </button>
          {onResolve && (
            <button
              onClick={e => { e.stopPropagation(); setOpen(false); onResolve(); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50"
            >
              <KeyRound className="w-4 h-4 text-amber-500" /> Resolve M-Pesa Code
            </button>
          )}
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

/* ── Resolve M-Pesa Code modal ──────────────────────────────────────────────
   Two entry points converge here:
     1. Row action → order is pre-selected.
     2. Global button → order starts unselected; admin searches/picks first.
*/
const ResolveMpesaModal: React.FC<{
  orders: AdminOrder[];               // all eligible (pending, mpesa) orders, for the search step
  initialOrder: AdminOrder | null;    // pre-selected when opened from a row
  onClose: () => void;
  onResolved: () => void;
}> = ({ orders, initialOrder, onClose, onResolved }) => {
  const [selected, setSelected] = useState<AdminOrder | null>(initialOrder);
  const [search, setSearch]     = useState('');
  const [code, setCode]         = useState(initialOrder?.user_reported_mpesa_code ?? '');
  const [loading, setLoading]   = useState<'approve' | 'reject' | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const searchResults = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(o =>
      `${o.customer_name} ${o.customer_email} ${o.id} ${o.event_title}`.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const pickOrder = (o: AdminOrder) => {
    setSelected(o);
    setCode(o.user_reported_mpesa_code ?? '');
    setError(null);
  };

  const handleApprove = async () => {
    if (!selected?.payment_id) return;
    if (!code.trim()) { setError('Enter the M-Pesa code to approve.'); return; }
    setLoading('approve');
    setError(null);
    try {
      await admin_resolveMpesaPayment(selected.payment_id, {
        approve: true,
        mpesa_code: code.trim().toUpperCase(),
      });
      onResolved();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Could not approve this payment. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selected?.payment_id) return;
    setLoading('reject');
    setError(null);
    try {
      await admin_resolveMpesaPayment(selected.payment_id, { approve: false });
      onResolved();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Could not reject this report. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Resolve M-Pesa Code</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {!selected ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by customer, order #, or event…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No pending M-Pesa orders match that search.
                  </p>
                ) : searchResults.map(o => (
                  <button
                    key={o.id}
                    onClick={() => pickOrder(o)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        #{o.id} · {o.customer_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{o.event_title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {needsReview(o) && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                          Reported
                        </span>
                      )}
                      <span className="text-sm font-semibold text-emerald-700">{formatKES(o.total_price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
              >
                ← Choose a different order
              </button>

              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-gray-900">Order #{selected.id} · {selected.customer_name}</p>
                <p className="text-xs text-gray-500">{selected.customer_email}</p>
                <p className="text-xs text-gray-500">{selected.event_title}</p>
                <p className="text-sm font-bold text-emerald-700 pt-1">{formatKES(selected.total_price)}</p>
              </div>

              {needsReview(selected) && (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p>
                    The customer reported this code themselves. Verify it against the actual
                    M-Pesa statement before approving — this list isn't pre-verified.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  M-Pesa Confirmation Code
                </label>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="QGH7XXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm uppercase tracking-wide focus:outline-none focus:border-purple-400 font-mono"
                />
                {!needsReview(selected) && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    No report on file for this order — enter the code from the M-Pesa statement directly.
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {selected && (
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-end gap-3">
            {needsReview(selected) && (
              <button
                onClick={handleReject}
                disabled={loading !== null}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject Report
              </button>
            )}
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve &amp; Confirm Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Orders: React.FC = () => {
  const [orders, setOrders]       = useState<AdminOrder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [methodFilter, setMethod] = useState('all');
  const [page, setPage]           = useState(1);
  const [expanded, setExpanded]   = useState<Set<number>>(new Set());
  const [confirm, setConfirm]     = useState<{ order: AdminOrder } | null>(null);
  const [actionLoading, setAL]    = useState(false);
  const [alert, setAlert]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [resolveModal, setResolveModal] = useState<{ order: AdminOrder | null } | null>(null);

  const loadOrders = () => {
    setLoading(true);
    admin_listAllOrders()
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => { setError('Failed to load orders.'); setLoading(false); });
  };

  useEffect(() => { loadOrders(); }, []);

  const resolvableOrders = useMemo(() => orders.filter(isResolvable), [orders]);
  const pendingReviewCount = useMemo(() => orders.filter(needsReview).length, [orders]);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const str = `${o.customer_name} ${o.customer_email} ${o.event_title} ${o.id} ${o.mpesa_ref ?? ''}`.toLowerCase();
      if (search && !str.includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (methodFilter !== 'all' && o.payment_method !== methodFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter, methodFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => ({
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    pending:   orders.filter(o => o.status === 'pending').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue:   orders.filter(o => o.status === 'confirmed').reduce((s, o) => s + o.total_price, 0),
  }), [orders]);

  const toggleExpand = (orderId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!confirm) return;
    setAL(true);
    try {
      await admin_deleteOrder(confirm.order.id);
      setOrders(prev => prev.filter(o => o.id !== confirm.order.id));
      setAlert({ type: 'success', msg: 'Order deleted successfully.' });
    } catch {
      setAlert({
        type: 'error',
        msg: 'Failed to delete order. Confirmed orders with issued tickets cannot be deleted — cancel them instead.',
      });
    } finally {
      setAL(false);
      setConfirm(null);
    }
  };

  const handleResolved = () => {
    setResolveModal(null);
    setAlert({ type: 'success', msg: 'Payment confirmed — order updated and tickets issued.' });
    loadOrders();
  };

  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Customer', 'Email', 'Event', 'Total', 'Status', 'Method', 'M-Pesa Ref', 'Date', 'Line Items'],
      ...filtered.map(o => [
        o.id, o.customer_name, o.customer_email, o.event_title, o.total_price, o.status,
        o.payment_method ?? '', o.mpesa_ref ?? '', o.created_at,
        o.bookings.map(b => `${b.ticket_type_name} x${b.quantity}`).join('; '),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'orders.csv';
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
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setResolveModal({ order: null })}
            className="btn-secondary btn-sm flex items-center gap-2 relative"
          >
            <KeyRound className="w-4 h-4" /> <span className="hidden sm:inline">Resolve M-Pesa Code</span>
            {pendingReviewCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingReviewCount}
              </span>
            )}
          </button>
          <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {[
          { label: 'Confirmed', value: totals.confirmed,          cls: 'text-emerald-600' },
          { label: 'Pending',   value: totals.pending,            cls: 'text-amber-600'   },
          { label: 'Cancelled', value: totals.cancelled,          cls: 'text-red-600'     },
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
        placeholder="Search by customer, event, M-Pesa ref…"
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
            <select value={methodFilter} onChange={e => { setMethod(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[130px]">
              {METHOD_OPTS.map(m => (
                <option key={m} value={m}>
                  {m === 'all' ? 'All Methods' : methodLabel[m] ?? m}
                </option>
              ))}
            </select>
          </>
        }
      />

      <SectionCard title="All Orders" subtitle={`${filtered.length} results`} noPadding>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={8} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders found" />
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th></th><th>#</th><th>Customer</th><th>Event</th>
                    <th>Items</th><th>Total</th><th>Status</th>
                    <th>Method</th><th>M-Pesa Ref</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(o => (
                    <Fragment key={o.id}>
                      <tr className="cursor-pointer hover:bg-purple-50/50" onClick={() => toggleExpand(o.id)}>
                        <td className="w-8">
                          {expanded.has(o.id)
                            ? <ChevronDown className="w-4 h-4 text-gray-400" />
                            : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </td>
                        <td className="text-gray-400 text-xs">#{o.id}</td>
                        <td>
                          <p className="font-medium text-sm text-gray-900">{o.customer_name}</p>
                          <p className="text-xs text-gray-500">{o.customer_email}</p>
                        </td>
                        <td className="text-sm text-gray-700 max-w-[180px]">
                          <p className="truncate">{o.event_title}</p>
                        </td>
                        <td className="text-xs text-gray-600">
                          {o.bookings.length} type{o.bookings.length !== 1 ? 's' : ''} ·{' '}
                          {o.bookings.reduce((s, b) => s + b.quantity, 0)} ticket{o.bookings.reduce((s, b) => s + b.quantity, 0) !== 1 ? 's' : ''}
                        </td>
                        <td className="font-semibold text-emerald-700 whitespace-nowrap">
                          {formatKES(o.total_price)}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusBadge status={o.status} />
                            {needsReview(o) && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                                Needs Review
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {o.payment_method
                            ? <span className={methodColor[o.payment_method] ?? 'badge-gray'}>{methodLabel[o.payment_method] ?? o.payment_method}</span>
                            : <span className="badge-gray">—</span>}
                        </td>
                        <td className="text-xs text-gray-500 font-mono">{o.mpesa_ref ?? '—'}</td>
                        <td className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(o.created_at)}</td>
                        <td>
                          <RowMenu
                            onView={() => toggleExpand(o.id)}
                            onDelete={() => setConfirm({ order: o })}
                            onResolve={isResolvable(o) ? () => setResolveModal({ order: o }) : undefined}
                          />
                        </td>
                      </tr>
                      {expanded.has(o.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={11} className="p-0">
                            <div className="px-10 py-3">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-gray-500">
                                    <th className="text-left font-medium pb-1">Ticket Type</th>
                                    <th className="text-left font-medium pb-1">Qty</th>
                                    <th className="text-left font-medium pb-1">Line Total</th>
                                    <th className="text-left font-medium pb-1">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {o.bookings.map(b => (
                                    <tr key={b.id}>
                                      <td className="py-1 text-gray-800">{b.ticket_type_name}</td>
                                      <td className="py-1 text-gray-700">{b.quantity}</td>
                                      <td className="py-1 font-medium text-emerald-700">{formatKES(b.total_price)}</td>
                                      <td className="py-1"><StatusBadge status={b.status} /></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(o => {
                const totalQty = o.bookings.reduce((s, b) => s + b.quantity, 0);
                return (
                  <div
                    key={o.id}
                    onClick={() => toggleExpand(o.id)}
                    className="p-4 space-y-2 cursor-pointer hover:bg-purple-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex items-start gap-2 flex-1">
                        {expanded.has(o.id)
                          ? <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{o.customer_name}</p>
                          <p className="text-xs text-gray-500 truncate">{o.customer_email}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 -mr-1 -mt-1">
                        <RowMenu
                          onView={() => toggleExpand(o.id)}
                          onDelete={() => setConfirm({ order: o })}
                          onResolve={isResolvable(o) ? () => setResolveModal({ order: o }) : undefined}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 font-medium truncate pl-6">{o.event_title}</p>

                    <div className="flex items-center justify-between gap-2 pl-6">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <StatusBadge status={o.status} />
                        {needsReview(o) && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                            Needs Review
                          </span>
                        )}
                        {o.payment_method && (
                          <span className={methodColor[o.payment_method] ?? 'badge-gray'}>
                            {methodLabel[o.payment_method] ?? o.payment_method}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {o.bookings.length} type{o.bookings.length !== 1 ? 's' : ''} · {totalQty} ticket{totalQty !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700 text-sm whitespace-nowrap flex-shrink-0">
                        {formatKES(o.total_price)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pl-6">
                      {o.mpesa_ref ? (
                        <p className="text-xs text-gray-500 font-mono truncate min-w-0">Ref: {o.mpesa_ref}</p>
                      ) : <span />}
                      <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{formatDateTime(o.created_at)}</p>
                    </div>

                    {expanded.has(o.id) && (
                      <div className="pt-2 border-t border-gray-100 space-y-1 pl-6" onClick={e => e.stopPropagation()}>
                        {o.bookings.map(b => (
                          <div key={b.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-gray-700 truncate min-w-0">{b.ticket_type_name} × {b.quantity}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <StatusBadge status={b.status} />
                              <span className="font-medium text-emerald-700">{formatKES(b.total_price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

      {confirm && (
        <ConfirmDialog
          title="Delete Order"
          message={`Delete order #${confirm.order.id} for ${confirm.order.customer_name}? This cannot be undone. Confirmed orders with issued tickets cannot be deleted — cancel them instead.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {resolveModal && (
        <ResolveMpesaModal
          orders={resolvableOrders}
          initialOrder={resolveModal.order}
          onClose={() => setResolveModal(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
};

export default Orders;