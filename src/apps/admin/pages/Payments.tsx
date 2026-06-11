// src/apps/admin/pages/Payments.tsx
import { useEffect, useState, useMemo } from 'react';
import { CreditCard, Download } from 'lucide-react';
import {
  FilterBar, StatusBadge, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import { admin_listAllPayments } from '@shared/api/user/paymentsApi';
import { formatDateTime, formatKES } from '@admin/utils/dummyData';
import type { AdminPayment } from '@admin/types';

const STATUS_OPTS = ['all', 'pending', 'completed', 'failed', 'refunded'];
const METHOD_OPTS = ['all', 'mpesa', 'card'];
const PAGE_SIZE = 10;

const Payments: React.FC = () => {
  const [payments, setPayments]   = useState<AdminPayment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [methodFilter, setMethod] = useState('all');
  const [page, setPage]           = useState(1);

  useEffect(() => {
    admin_listAllPayments()
      .then(data => { setPayments(data as AdminPayment[]); setLoading(false); })
      .catch(() => { setError('Failed to load payments.'); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const str = `${p.user_name ?? ''} ${p.method} ${p.id}`.toLowerCase();
      if (search && !str.includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (methodFilter !== 'all' && p.method !== methodFilter) return false;
      return true;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => ({
    total:     payments.reduce((s, p) => s + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    refunded:  payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0),
    pending:   payments.filter(p => p.status === 'pending').length,
  }), [payments]);

  const exportCSV = () => {
    const rows = [
      ['ID', 'User', 'Amount', 'Method', 'Status', 'M-Pesa Ref', 'Booking ID', 'Date'],
      ...filtered.map(p => [
        p.id, p.user_name ?? '', p.amount, p.method,
        p.status, p.mpesa_ref ?? '', p.booking_id, p.created_at,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'payments.csv';
    a.click();
  };

  const methodLabel: Record<string, string> = {
    mpesa: 'M-Pesa',
    card: 'Card',
  };

  const methodColor: Record<string, string> = {
    mpesa: 'badge-success',
    card:  'badge-info',
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
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">{payments.length} transactions</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[
          { label: 'Total Processed', value: formatKES(totals.total),     cls: 'text-gray-900'    },
          { label: 'Completed',       value: formatKES(totals.completed), cls: 'text-emerald-600' },
          { label: 'Refunded',        value: formatKES(totals.refunded),  cls: 'text-purple-600'  },
          { label: 'Pending',         value: totals.pending + ' txns',    cls: 'text-amber-600'   },
        ].map(c => (
          <div key={c.label} className="card-sm text-center overflow-hidden">
            <p className="text-xs text-gray-500 mb-1 truncate">{c.label}</p>
            <p className={`text-sm font-bold leading-tight break-all ${c.cls}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search by user or payment ID…"
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

      <SectionCard title="Payment Transactions" subtitle={`${filtered.length} results`} noPadding>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={6} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments found" />
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Customer</th><th>Amount</th>
                    <th>Method</th><th>Status</th><th>M-Pesa Ref</th>
                    <th>Booking #</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => (
                    <tr key={p.id}>
                      <td className="text-gray-400 text-xs">#{p.id}</td>
                      <td className="font-medium text-sm text-gray-900">{p.user_name}</td>
                      <td className="font-bold text-emerald-700 whitespace-nowrap">{formatKES(p.amount)}</td>
                      <td>
                        <span className={methodColor[p.method] ?? 'badge-gray'}>
                          {methodLabel[p.method] ?? p.method}
                        </span>
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="text-xs text-gray-500 font-mono">{p.mpesa_ref ?? '—'}</td>
                      <td className="text-xs text-gray-500">#{p.booking_id}</td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(p => (
                <div key={p.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900">{p.user_name}</p>
                    <span className="font-bold text-emerald-700 text-sm">{formatKES(p.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={p.status} />
                    <span className={methodColor[p.method] ?? 'badge-gray'}>
                      {methodLabel[p.method] ?? p.method}
                    </span>
                    <span className="text-xs text-gray-500">Booking #{p.booking_id}</span>
                  </div>
                  {p.mpesa_ref && (
                    <p className="text-xs text-gray-500 font-mono">Ref: {p.mpesa_ref}</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDateTime(p.created_at)}</p>
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
    </div>
  );
};

export default Payments;