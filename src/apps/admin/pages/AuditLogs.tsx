// src/apps/admin/pages/AuditLogs.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ClipboardList, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { FilterBar, SectionCard, Pagination, TableSkeleton, EmptyState } from '@admin/components/ui';
import { formatDateTime } from '@admin/utils/format';
import { listAuditLogs } from '@admin/services/adminService';
import type { AuditLog } from '@admin/types';

const ACTION_OPTS = [
  'all',
  'user_deactivated', 'user_activated', 'user_role_changed', 'user_verified',
  'user_deleted', 'user_created',
  'event_approved', 'event_rejected', 'event_deleted', 'create_event',
  'update_event_status',
  'booking_refunded', 'booking_deleted',
  'message_marked_spam', 'message_closed', 'message_responded',
  'session_revoked', 'settings_updated',
];

const TARGET_OPTS = ['all', 'user', 'event', 'booking', 'payment', 'message'];
const PAGE_SIZE = 15;

const actionColors: Record<string, string> = {
  user_deactivated:    'badge-danger',
  user_activated:      'badge-success',
  user_role_changed:   'badge-purple',
  user_verified:       'badge-success',
  user_deleted:        'badge-danger',
  user_created:        'badge-success',
  event_approved:      'badge-success',
  event_rejected:      'badge-danger',
  event_deleted:       'badge-danger',
  create_event:        'badge-purple',
  update_event_status: 'badge-warning',
  booking_refunded:    'badge-warning',
  booking_deleted:     'badge-danger',
  message_marked_spam: 'badge-danger',
  message_closed:      'badge-gray',
  message_responded:   'badge-success',
  session_revoked:     'badge-warning',
  settings_updated:    'badge-purple',
};

const actionLabel = (action: string) =>
  action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const AuditLogs: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [logs, setLogs]             = useState<AuditLog[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Filters (all applied client-side on the fetched page for instant UI,
  // but the heavy-lifting date/action/target filters are sent to the API)
  const [search, setSearch]         = useState('');
  const [actionFilter, setAction]   = useState('all');
  const [targetFilter, setTarget]   = useState('all');
  const [page, setPage]             = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAuditLogs({
        action:      actionFilter !== 'all' ? actionFilter      : undefined,
        target_type: targetFilter !== 'all' ? targetFilter      : undefined,
        limit:       500,   // fetch a large page; client filters narrow it down
        offset:      0,
      });
      setLogs(result.items);
      setTotal(result.total);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? err?.message ?? 'Failed to load audit logs.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, targetFilter]);

  // Re-fetch whenever server-side filters change
  useEffect(() => {
    setPage(1);
    fetchLogs();
  }, [fetchLogs]);

  // ── Client-side search filter (applied on top of the API results) ──────────
  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(l => {
      const str = `${l.admin_name} ${l.action} ${l.target_type} ${l.target_id ?? ''}`.toLowerCase();
      return str.includes(q);
    });
  }, [logs, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── CSV export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['ID', 'Admin', 'Action', 'Target Type', 'Target ID', 'Details', 'Date'],
      ...filtered.map(l => [
        l.id,
        l.admin_name,
        l.action,
        l.target_type,
        l.target_id ?? '',
        JSON.stringify(l.details ?? {}),
        l.created_at,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ── Stats derived from the full fetched set ────────────────────────────────
  const stats = useMemo(() => ({
    total:   total,
    users:   logs.filter(l => l.target_type === 'user').length,
    events:  logs.filter(l => l.target_type === 'event').length,
    today:   logs.filter(l =>
      new Date(l.created_at).toDateString() === new Date().toDateString()
    ).length,
  }), [logs, total]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">All admin actions are recorded here for accountability</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="btn-secondary btn-sm flex items-center gap-2 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            disabled={loading || filtered.length === 0}
            className="btn-secondary btn-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchLogs}
            className="text-sm text-red-600 font-medium hover:text-red-700 flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {[
          { label: 'Total Actions', value: loading ? '…' : stats.total  },
          { label: 'User Actions',  value: loading ? '…' : stats.users  },
          { label: 'Event Actions', value: loading ? '…' : stats.events },
          { label: 'Today',         value: loading ? '…' : stats.today  },
        ].map(c => (
          <div key={c.label} className="card-sm text-center overflow-hidden">
            <p className="text-xs text-gray-500 mb-1 truncate">{c.label}</p>
            <p className="text-xl font-bold text-purple-700 leading-tight">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search by admin, action, target…"
        filters={
          <>
            <select
              value={actionFilter}
              onChange={e => { setAction(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[160px]"
            >
              {ACTION_OPTS.map(a => (
                <option key={a} value={a}>
                  {a === 'all' ? 'All Actions' : actionLabel(a)}
                </option>
              ))}
            </select>
            <select
              value={targetFilter}
              onChange={e => { setTarget(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[130px]"
            >
              {TARGET_OPTS.map(t => (
                <option key={t} value={t}>
                  {t === 'all' ? 'All Targets' : t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </>
        }
      />

      {/* Table */}
      <SectionCard
        title="Audit Log"
        subtitle={loading ? 'Loading…' : `${filtered.length} entries`}
        noPadding
      >
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={6} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No audit logs found" />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(log => (
                    <tr key={log.id}>
                      <td className="text-gray-400 text-xs">{log.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full purple-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {log.admin_name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{log.admin_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={actionColors[log.action] ?? 'badge-gray'}>
                          {actionLabel(log.action)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="badge-gray capitalize">{log.target_type}</span>
                          {log.target_id != null && (
                            <span className="text-xs text-gray-500">#{log.target_id}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="max-w-[220px] space-y-0.5">
                            {Object.entries(log.details).map(([k, v]) => (
                              <span key={k} className="block text-xs text-gray-600 truncate">
                                <span className="font-medium text-gray-500">{k}:</span>{' '}
                                {String(v)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(log => (
                <div key={log.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full purple-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {log.admin_name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{log.admin_name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDateTime(log.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={actionColors[log.action] ?? 'badge-gray'}>
                      {actionLabel(log.action)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="badge-gray capitalize">{log.target_type}</span>
                      {log.target_id != null && (
                        <span className="text-xs text-gray-500">#{log.target_id}</span>
                      )}
                    </div>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <p className="text-xs text-gray-500">
                      {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
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

export default AuditLogs;