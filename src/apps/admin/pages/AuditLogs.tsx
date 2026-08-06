// src/apps/admin/pages/AuditLogs.tsx
//
// Two tabs over the same underlying audit_log table:
//   - "My Activity" (default): only the currently authenticated admin's
//     actions, via GET /admin/audit-logs/my. No admin/target filters shown
//     since it's already scoped by admin_id server-side.
//   - "All Activity": every admin's actions, via GET /admin/audit-logs,
//     with server-side action/target/date-range filters.

import { useEffect, useState, useCallback } from 'react';
import { ClipboardList, Download, RefreshCw, AlertCircle, User, Globe } from 'lucide-react';
import { FilterBar, SectionCard, Pagination, TableSkeleton, EmptyState } from '@admin/components/ui';
import { formatDateTime } from '@admin/utils/format';
import { listAuditLogs, getMyActivity } from '@admin/services/adminService';
import { ACTION_OPTIONS, TARGET_OPTIONS, formatAuditAction } from '@admin/constants/auditLog';
import type { AuditLog } from '@admin/types';

const PAGE_SIZE = 15;
const EXPORT_LIMIT = 2000; // safety cap for the CSV export fetch

type TabKey = 'mine' | 'all';

// Colour groupings by convention rather than by exhaustive per-action
// mapping — destructive actions red, creation/positive actions green,
// status-changing actions amber/purple. Anything not listed falls back
// to badge-gray via the `??` below, which is fine — colour is a nice-to-
// have, not load-bearing.
const actionColors: Record<string, string> = {
  delete_user: 'badge-danger', deactivate_user: 'badge-danger', delete_event: 'badge-danger',
  reject_event: 'badge-danger', delete_booking: 'badge-danger', delete_order: 'badge-danger',
  delete_payment: 'badge-danger', delete_ticket_type: 'badge-danger', delete_ticket_instance: 'badge-danger',
  delete_contact_message: 'badge-danger', delete_co_organizer: 'badge-danger',
  manual_payment_rejected: 'badge-danger',

  activate_user: 'badge-success', verify_user_email: 'badge-success', create_event: 'badge-success',
  approve_event: 'badge-success', create_ticket_type: 'badge-success', create_ticket_instance: 'badge-success',
  create_co_organizer: 'badge-success', manual_payment_approved: 'badge-success',
  unsuspend_ticket_type: 'badge-success',

  update_user_role: 'badge-purple', update_platform_settings: 'badge-purple',

  update_event_status: 'badge-warning', update_booking_status: 'badge-warning',
  update_payment_status: 'badge-warning', suspend_ticket_type: 'badge-warning',
  revoke_session: 'badge-warning', revoke_all_other_sessions: 'badge-warning',
};

interface Filters {
  action:     string;
  targetType: string;
  dateFrom:   string;
  dateTo:     string;
}

const emptyFilters: Filters = { action: '', targetType: '', dateFrom: '', dateTo: '' };

const AuditLogs: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('mine');

  // ── "My Activity" tab state ──────────────────────────────────────────────
  const [logsMine, setLogsMine]   = useState<AuditLog[]>([]);
  const [totalMine, setTotalMine] = useState(0);
  const [pageMine, setPageMine]   = useState(1);

  // ── "All Activity" tab state ─────────────────────────────────────────────
  const [logsAll, setLogsAll]     = useState<AuditLog[]>([]);
  const [totalAll, setTotalAll]   = useState(0);
  const [pageAll, setPageAll]     = useState(1);
  const [filters, setFilters]         = useState<Filters>(emptyFilters);
  const [pendingFilters, setPendingFilters] = useState<Filters>(emptyFilters);

  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchMine = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyActivity(PAGE_SIZE, (page - 1) * PAGE_SIZE);
      setLogsMine(res.items);
      setTotalMine(res.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to load your activity.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async (page: number, f: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAuditLogs({
        action:      f.action      || undefined,
        target_type: f.targetType  || undefined,
        // Append times so the backend comparison covers the full day
        from:        f.dateFrom ? `${f.dateFrom}T00:00:00` : undefined,
        to:          f.dateTo   ? `${f.dateTo}T23:59:59`   : undefined,
        limit:       PAGE_SIZE,
        offset:      (page - 1) * PAGE_SIZE,
      });
      setLogsAll(res.items);
      setTotalAll(res.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'mine') fetchMine(pageMine);
    else fetchAll(pageAll, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, pageMine, pageAll, filters]);

  // ── Filters (All Activity tab only) ─────────────────────────────────────
  const handleApplyFilters = () => {
    setPageAll(1);
    setFilters(pendingFilters);
  };

  const handleClearFilters = () => {
    setPendingFilters(emptyFilters);
    setPageAll(1);
    setFilters(emptyFilters);
  };

  const hasActiveFilters =
    filters.action || filters.targetType || filters.dateFrom || filters.dateTo;

  const isFiltersUnchanged =
    pendingFilters.action     === filters.action     &&
    pendingFilters.targetType === filters.targetType &&
    pendingFilters.dateFrom   === filters.dateFrom   &&
    pendingFilters.dateTo     === filters.dateTo;

  // ── CSV export (All Activity tab) ────────────────────────────────────────
  // Fetches its own full filtered batch (up to EXPORT_LIMIT rows) rather
  // than exporting whatever happens to be on the currently visible page —
  // that's the whole point of an export button.
  const exportCSV = async () => {
    setExporting(true);
    try {
      const res = await listAuditLogs({
        action:      filters.action      || undefined,
        target_type: filters.targetType  || undefined,
        from:        filters.dateFrom ? `${filters.dateFrom}T00:00:00` : undefined,
        to:          filters.dateTo   ? `${filters.dateTo}T23:59:59`   : undefined,
        limit:       EXPORT_LIMIT,
        offset:      0,
      });
      const rows = [
        ['ID', 'Admin', 'Action', 'Target Type', 'Target ID', 'Details', 'Date'],
        ...res.items.map(l => [
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
    } catch {
      setError('Failed to export audit logs.');
    } finally {
      setExporting(false);
    }
  };

  // ── Active tab's derived view state ──────────────────────────────────────
  const logs    = tab === 'mine' ? logsMine  : logsAll;
  const total   = tab === 'mine' ? totalMine : totalAll;
  const page    = tab === 'mine' ? pageMine  : pageAll;
  const setPage = tab === 'mine' ? setPageMine : setPageAll;
  const refresh = () => (tab === 'mine' ? fetchMine(pageMine) : fetchAll(pageAll, filters));

  // Sequential row number
  const rowNumber = (index: number) => (page - 1) * PAGE_SIZE + index + 1;

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
            onClick={refresh}
            disabled={loading}
            className="btn-secondary btn-sm flex items-center gap-2 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {tab === 'all' && (
            <button
              onClick={exportCSV}
              disabled={exporting || loading}
              className="btn-secondary btn-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{exporting ? 'Exporting…' : 'Export'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        <button
          onClick={() => setTab('mine')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors
            ${tab === 'mine'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <User className="w-4 h-4" /> My Activity
        </button>
        <button
          onClick={() => setTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors
            ${tab === 'all'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Globe className="w-4 h-4" /> All Activity
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="text-sm text-red-600 font-medium hover:text-red-700 flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters — All Activity tab only. My Activity is implicitly scoped
          to admin_id server-side, so an admin filter would be redundant
          and a target-type-only filter isn't worth the UI real estate. */}
      {tab === 'all' && (
        <FilterBar
          search=""
          onSearchChange={() => {}}
          hideSearch
          filters={
            <>
              <select
                value={pendingFilters.action}
                onChange={e => setPendingFilters(p => ({ ...p, action: e.target.value }))}
                className="select-field w-auto min-w-[170px]"
              >
                {ACTION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                value={pendingFilters.targetType}
                onChange={e => setPendingFilters(p => ({ ...p, targetType: e.target.value }))}
                className="select-field w-auto min-w-[150px]"
              >
                {TARGET_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">From</p>
                <input
                  type="date"
                  value={pendingFilters.dateFrom}
                  onChange={e => setPendingFilters(p => ({ ...p, dateFrom: e.target.value }))}
                  className="input-field text-sm w-auto"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">To</p>
                <input
                  type="date"
                  value={pendingFilters.dateTo}
                  onChange={e => setPendingFilters(p => ({ ...p, dateTo: e.target.value }))}
                  className="input-field text-sm w-auto"
                />
              </div>
              <button
                onClick={handleApplyFilters}
                disabled={isFiltersUnchanged}
                className="btn-primary btn-sm self-end disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply
              </button>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="btn-secondary btn-sm self-end">
                  Clear
                </button>
              )}
            </>
          }
        />
      )}

      {/* Table */}
      <SectionCard
        title={tab === 'mine' ? 'My Activity' : (hasActiveFilters ? 'Filtered Results' : 'All Activity')}
        subtitle={loading ? 'Loading…' : `${total.toLocaleString()} entries`}
        noPadding
      >
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={tab === 'mine' ? 5 : 6} /></div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No audit logs found"
            description={tab === 'all' && hasActiveFilters ? 'Try adjusting your filters.' : undefined}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    {tab === 'all' && <th>Admin</th>}
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={log.id}>
                      <td className="text-gray-400 text-xs" title={`Log ID: ${log.id}`}>
                        {rowNumber(idx)}
                      </td>
                      {tab === 'all' && (
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full purple-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {log.admin_name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{log.admin_name}</span>
                          </div>
                        </td>
                      )}
                      <td>
                        <span className={actionColors[log.action] ?? 'badge-gray'}>
                          {formatAuditAction(log.action)}
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
                                <span className="font-medium text-gray-500">{k.replace(/_/g, ' ')}:</span>{' '}
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
              {logs.map((log, idx) => (
                <div key={log.id} className="p-4 space-y-2 hover:bg-purple-50/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    {tab === 'all' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full purple-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {log.admin_name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{log.admin_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400" title={`Log ID: ${log.id}`}>
                        #{rowNumber(idx)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{formatDateTime(log.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={actionColors[log.action] ?? 'badge-gray'}>
                      {formatAuditAction(log.action)}
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
                      {Object.entries(log.details).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
              total={total}
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