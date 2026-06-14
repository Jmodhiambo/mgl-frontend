// src/apps/admin/pages/ActivityFeed.tsx
// Platform-wide admin activity feed — all audit log entries across all admins.
// Filters by admin, action type, target type, and date range with pagination.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Filter, ChevronLeft, ChevronRight,
  User, Calendar, Ticket, DollarSign, MessageSquare,
  CheckCircle, Clock, Loader2, RefreshCw, ShoppingCart,
} from 'lucide-react';
import { SectionCard, EmptyState, AlertBanner } from '@admin/components/ui';
import { listAuditLogs } from '@admin/services/adminService';
import { timeAgo } from '@shared/utils/timeAgo';
import { formatDateTime } from '@admin/utils/format';
import type { AuditLog } from '@admin/types';

const PAGE_SIZE = 20;

// Action values must match backend audit log strings exactly
const ACTION_OPTIONS = [
  { value: '',                          label: 'All Actions'           },
  // User
  { value: 'user_created',              label: 'User Created'          },
  { value: 'activate_user',             label: 'User Activated'        },
  { value: 'deactivate_user',           label: 'User Deactivated'      },
  { value: 'update_user_role',          label: 'Role Updated'          },
  { value: 'verify_user_email',         label: 'Email Verified'        },
  { value: 'unverify_user_email',       label: 'Email Unverified'      },
  { value: 'delete_user',               label: 'User Deleted'          },
  { value: 'update_user_email',         label: 'Email Updated'         },
  { value: 'resend_verification_email', label: 'Verification Resent'   },
  // Event
  { value: 'create_event',              label: 'Event Created'         },
  { value: 'approve_event',             label: 'Event Approved'        },
  { value: 'reject_event',              label: 'Event Rejected'        },
  { value: 'delete_event',              label: 'Event Deleted'         },
  { value: 'update_event_status',       label: 'Event Status Updated'  },
  // Booking
  { value: 'update_booking_status',     label: 'Booking Status Updated'},
  { value: 'update_booking',            label: 'Booking Updated'       },
  { value: 'delete_booking',            label: 'Booking Deleted'       },
  // Order
  { value: 'delete_order',              label: 'Order Deleted'         },
  // Message
  { value: 'message_marked_spam',       label: 'Message Marked Spam'   },
  { value: 'message_closed',            label: 'Message Closed'        },
  { value: 'message_responded',         label: 'Message Responded'     },
  // Other
  { value: 'session_revoked',           label: 'Session Revoked'       },
  { value: 'settings_updated',          label: 'Settings Updated'      },
];

const TARGET_OPTIONS = [
  { value: '',                label: 'All Targets' },
  { value: 'user',            label: 'User'        },
  { value: 'event',           label: 'Event'       },
  { value: 'booking',         label: 'Booking'     },
  { value: 'order',           label: 'Order'       },
  { value: 'payment',         label: 'Payment'     },
  { value: 'message',         label: 'Message'     },
  { value: 'ticket_instance', label: 'Ticket'      },
  { value: 'ticket_type',     label: 'Ticket Type' },
  { value: 'session',         label: 'Session'     },
  { value: 'settings',        label: 'Settings'    },
];

// Icon + colour per target type
const TARGET_ICON: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  user:            { icon: User,          bg: 'bg-purple-100',  color: 'text-purple-600'  },
  event:           { icon: Calendar,      bg: 'bg-blue-100',    color: 'text-blue-600'    },
  booking:         { icon: Ticket,        bg: 'bg-emerald-100', color: 'text-emerald-600' },
  order:           { icon: ShoppingCart,  bg: 'bg-orange-100',  color: 'text-orange-600'  },
  payment:         { icon: DollarSign,    bg: 'bg-amber-100',   color: 'text-amber-600'   },
  message:         { icon: MessageSquare, bg: 'bg-red-100',     color: 'text-red-600'     },
  ticket_instance: { icon: Ticket,        bg: 'bg-teal-100',    color: 'text-teal-600'    },
  ticket_type:     { icon: Ticket,        bg: 'bg-indigo-100',  color: 'text-indigo-600'  },
  session:         { icon: Clock,         bg: 'bg-gray-100',    color: 'text-gray-600'    },
  settings:        { icon: CheckCircle,   bg: 'bg-green-100',   color: 'text-green-600'   },
};

const defaultIcon = { icon: Activity, bg: 'bg-gray-100', color: 'text-gray-500' };

interface Filters {
  action:     string;
  targetType: string;
  dateFrom:   string;
  dateTo:     string;
}

const ActivityFeed: React.FC = () => {
  const navigate = useNavigate();

  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    action: '', targetType: '', dateFrom: '', dateTo: '',
  });
  const [pendingFilters, setPendingFilters] = useState<Filters>(filters);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchLogs = useCallback(async (f: Filters, p: number) => {
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
        offset:      (p - 1) * PAGE_SIZE,
      });
      setLogs(res.items);
      setTotal(res.total);
    } catch {
      setError('Failed to load activity feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(filters, page);
  }, [filters, page, fetchLogs]);

  const handleApplyFilters = () => {
    // Set page first — ensures the effect always fires with page=1
    // alongside the new filters, never with a stale page value.
    setPage(1);
    setFilters(pendingFilters);
  };

  const handleClearFilters = () => {
    const empty: Filters = { action: '', targetType: '', dateFrom: '', dateTo: '' };
    setPendingFilters(empty);
    setPage(1);
    setFilters(empty);
  };

  const hasActiveFilters =
    filters.action || filters.targetType || filters.dateFrom || filters.dateTo;

  const isUnchanged =
    pendingFilters.action     === filters.action     &&
    pendingFilters.targetType === filters.targetType &&
    pendingFilters.dateFrom   === filters.dateFrom   &&
    pendingFilters.dateTo     === filters.dateTo;

  const formatAction = (action: string) =>
    action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Feed</h1>
          <p className="page-subtitle">Platform-wide audit log — every admin action in one place</p>
        </div>
        <button
          onClick={() => fetchLogs(filters, page)}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Filters Panel ── */}
        <div className="lg:col-span-1">
          <SectionCard title="Filters">
            <div className="space-y-4">
              <div>
                <label className="label">Action Type</label>
                <select
                  value={pendingFilters.action}
                  onChange={e => setPendingFilters(p => ({ ...p, action: e.target.value }))}
                  className="select-field"
                >
                  {ACTION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Target Type</label>
                <select
                  value={pendingFilters.targetType}
                  onChange={e => setPendingFilters(p => ({ ...p, targetType: e.target.value }))}
                  className="select-field"
                >
                  {TARGET_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Date Range</label>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">From</p>
                    <input
                      type="date"
                      value={pendingFilters.dateFrom}
                      onChange={e => setPendingFilters(p => ({ ...p, dateFrom: e.target.value }))}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">To</p>
                    <input
                      type="date"
                      value={pendingFilters.dateTo}
                      onChange={e => setPendingFilters(p => ({ ...p, dateTo: e.target.value }))}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleApplyFilters}
                disabled={isUnchanged}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Filter className="w-4 h-4" /> Apply Filters
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="btn-secondary w-full text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </SectionCard>

          {/* Stats */}
          <div className="mt-4 card p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Summary</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total entries</span>
              <span className="text-sm font-bold text-gray-900">{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Showing</span>
              <span className="text-sm font-bold text-gray-900">
                {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Page</span>
              <span className="text-sm font-bold text-gray-900">{page} of {totalPages || 1}</span>
            </div>
          </div>
        </div>

        {/* ── Feed ── */}
        <div className="lg:col-span-3">
          <SectionCard
            title={hasActiveFilters ? 'Filtered Results' : 'All Activity'}
            subtitle={`${total.toLocaleString()} entries`}
            noPadding
          >
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading activity…</span>
              </div>
            ) : logs.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No activity found"
                description="Try adjusting your filters or date range."
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {logs.map(log => {
                  const { icon: Icon, bg, color } = TARGET_ICON[log.target_type] ?? defaultIcon;
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${bg}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatAction(log.action)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              <span
                                className="font-medium text-purple-700 cursor-pointer hover:underline"
                                onClick={() => navigate(`/users/${log.admin_id}`)}
                              >
                                {log.admin_name}
                              </span>
                              {' · '}
                              <span className="capitalize">{log.target_type}</span>
                              {log.target_id ? ` #${log.target_id}` : ''}
                            </p>
                            {log.details && Object.keys(log.details).length > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                {Object.entries(log.details)
                                  .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                                  .join(' · ')}
                              </p>
                            )}
                          </div>

                          {/* Time */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-400">{timeAgo(log.created_at)}</p>
                            <p className="text-xs text-gray-300 mt-0.5">{formatDateTime(log.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary btn-sm flex items-center gap-1.5 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
                          ${p === page
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary btn-sm flex items-center gap-1.5 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;