// src/apps/admin/pages/AuditLogs.tsx
// ─── NOTE: New endpoint needed ────────────────────────────────────────────────
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/audit-logs
//     Returns list of AuditLog objects (id, admin_id, admin_name, action,
//     target_type, target_id, details, created_at)
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/audit-logs?admin_id=&action=&target_type=&from=&to=

import { useEffect, useState, useMemo } from 'react';
import { ClipboardList, Download } from 'lucide-react';
import { FilterBar, SectionCard, Pagination, TableSkeleton, EmptyState } from '@admin/components/ui';
import { dummyAuditLogs, formatDateTime } from '@admin/utils/dummyData';
import type { AuditLog } from '@admin/types';

const ACTION_OPTS = [
  'all',
  'user_deactivated', 'user_role_changed', 'user_verified',
  'event_approved', 'event_rejected',
  'booking_refunded',
  'message_marked_spam',
];

const TARGET_OPTS = ['all', 'user', 'event', 'booking', 'payment', 'message'];
const PAGE_SIZE = 15;

const actionColors: Record<string, string> = {
  user_deactivated:    'badge-danger',
  user_role_changed:   'badge-purple',
  user_verified:       'badge-success',
  event_approved:      'badge-success',
  event_rejected:      'badge-danger',
  booking_refunded:    'badge-warning',
  message_marked_spam: 'badge-danger',
};

const actionLabel = (action: string) =>
  action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const AuditLogs: React.FC = () => {
  const [logs, setLogs]             = useState<AuditLog[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [actionFilter, setAction]   = useState('all');
  const [targetFilter, setTarget]   = useState('all');
  const [page, setPage]             = useState(1);

  useEffect(() => {
    // TODO: replace with real API call
    // const data = await api.get('/admin/audit-logs');
    setTimeout(() => { setLogs(dummyAuditLogs); setLoading(false); }, 400);
  }, []);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const str = `${l.admin_name} ${l.action} ${l.target_type} ${l.target_id}`.toLowerCase();
      if (search && !str.includes(search.toLowerCase())) return false;
      if (actionFilter !== 'all' && l.action !== actionFilter) return false;
      if (targetFilter !== 'all' && l.target_type !== targetFilter) return false;
      return true;
    });
  }, [logs, search, actionFilter, targetFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const rows = [
      ['ID','Admin','Action','Target Type','Target ID','Details','Date'],
      ...filtered.map(l => [
        l.id, l.admin_name, l.action, l.target_type,
        l.target_id, JSON.stringify(l.details), l.created_at,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'audit-logs.csv'; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">All admin actions are recorded here for accountability</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {[
          { label: 'Total Actions', value: logs.length },
          { label: 'User Actions',  value: logs.filter(l => l.target_type === 'user').length },
          { label: 'Event Actions', value: logs.filter(l => l.target_type === 'event').length },
          { label: 'Today',         value: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length },
        ].map(c => (
          <div key={c.label} className="card-sm text-center">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl font-bold text-purple-700">{c.value}</p>
          </div>
        ))}
      </div>

      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search by admin, action, target…"
        filters={
          <>
            <select value={actionFilter}
              onChange={e => { setAction(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[160px]">
              {ACTION_OPTS.map(a => (
                <option key={a} value={a}>{a === 'all' ? 'All Actions' : actionLabel(a)}</option>
              ))}
            </select>
            <select value={targetFilter}
              onChange={e => { setTarget(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[130px]">
              {TARGET_OPTS.map(t => (
                <option key={t} value={t}>{t === 'all' ? 'All Targets' : t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
          </>
        }
      />

      <SectionCard title="Audit Log" subtitle={`${filtered.length} entries`} noPadding>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={6} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No audit logs found" />
        ) : (
          <>
            <div className="table-wrapper rounded-none border-0">
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
                          <span className="text-xs text-gray-500">#{log.target_id}</span>
                        </div>
                      </td>
                      <td>
                        {Object.keys(log.details).length > 0 ? (
                          <div className="max-w-[200px]">
                            {Object.entries(log.details).map(([k, v]) => (
                              <span key={k} className="text-xs text-gray-600">
                                <span className="font-medium text-gray-500">{k}:</span>{' '}
                                {String(v)}
                                {' '}
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