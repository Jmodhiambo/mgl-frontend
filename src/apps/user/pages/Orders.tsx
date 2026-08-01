// src/apps/user/pages/Orders.tsx
// ─────────────────────────────────────────────────────────────────────────────
//
// Full list of the user's orders — Dashboard only shows the 5 most recent
// via buildRecentBookings(). This is what "View All" on that section should
// link to, not My Tickets: an order and its tickets are different things —
// a pending/failed order has no tickets to show yet, but it's still an
// order the user needs to see and act on (hence linking through to
// OrderDetail.tsx per row, where Retry Payment / Report M-Pesa Code live).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Search, ShoppingBag, Calendar, AlertCircle, CheckCircle, X,
} from 'lucide-react';
import { fetchUserOrdersEnriched } from '@user/services/dashboardService';
import type { UserOrderEnriched } from '@user/services/dashboardService';
import { formatDate } from '@shared/utils/format';

const STATUS_OPTS = ['all', 'pending', 'confirmed', 'cancelled'];

const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAGE_SIZE = 10;

const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders]   = useState<UserOrderEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('all');
  const [page, setPage]       = useState(1);
  const [deletedMessage, setDeletedMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'My Orders – MGLTickets';
    fetchUserOrdersEnriched()
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => { setError('Failed to load your orders.'); setLoading(false); });
  }, []);

  // Deletion confirmation, passed via navigate() state from OrderDetail's
  // delete flow. Read once, then immediately clear it from history state
  // so refreshing this page (or hitting Back into it) doesn't re-show a
  // stale "order deleted" banner for an order that's long gone.
  useEffect(() => {
    const state = location.state as { deletedOrderId?: number; deletedEventTitle?: string } | null;
    if (state?.deletedOrderId) {
      setDeletedMessage(
        state.deletedEventTitle
          ? `Order #${state.deletedOrderId} for "${state.deletedEventTitle}" was deleted.`
          : `Order #${state.deletedOrderId} was deleted.`
      );
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (status !== 'all' && o.status !== status) return false;
      if (search && !`${o.event_title} ${o.id}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [orders, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-orange-600 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
        </div>

        {deletedMessage && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 flex-1">{deletedMessage}</p>
            <button
              onClick={() => setDeletedMessage(null)}
              className="text-emerald-400 hover:text-emerald-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by event or order #…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white"
            />
          </div>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm bg-white focus:outline-none focus:border-orange-400"
          >
            {STATUS_OPTS.map(s => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No orders found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paginated.map(o => {
                const totalQty = o.bookings.reduce((s, b) => s + b.quantity, 0);
                return (
                  <button
                    key={o.id}
                    onClick={() => navigate(`/orders/${o.id}`)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-orange-50/50 transition-colors text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">{o.event_title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 flex-shrink-0" /> {formatDate(o.created_at)} · Order #{o.id}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {totalQty} ticket{totalQty !== 1 ? 's' : ''}
                        {o.payment_method ? ` · ${o.payment_method === 'mpesa' ? 'M-Pesa' : o.payment_method}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusStyles[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                      <span className="font-bold text-sm text-gray-900">
                        KES {o.total_price.toLocaleString()}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersListPage;