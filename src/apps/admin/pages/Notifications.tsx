// src/apps/admin/pages/Notifications.tsx
// ─── API ENDPOINTS USED IN THIS FILE ─────────────────────────────────────────
// GET    /admin/notifications              → load full list on mount
// PATCH  /admin/notifications/:id/read    → markRead()     (Mark read / View →)
// PATCH  /admin/notifications/read-all    → markAllRead()  (Mark all read button)
// DELETE /admin/notifications/:id         → dismiss()      (X button on each card)
// DELETE /admin/notifications/clear-read  → clearRead()    (Clear read button)
//
// Client-side only (no extra API calls):
//   Unread filter  → showUnreadOnly toggle filters the loaded list locally
//   Category filter → category tabs filter the loaded list locally
//
// Badge count for Header / Sidebar:
//   GET /admin/notifications/count/unread → called from AdminLayout (not here)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import {
  Bell, CheckCheck, Trash2, Calendar, Users, CreditCard,
  MessageSquare, ShieldAlert, Info, X, Filter, Check, RefreshCw,
} from 'lucide-react';
import {
  listAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
  clearReadNotifications,
} from '@admin/services/adminService';
import { adminEvents } from '@admin/utils/adminEvents';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifCategory = 'all' | 'event' | 'user' | 'payment' | 'message' | 'system';
type NotifPriority = 'high' | 'medium' | 'low';

interface Notification {
  id: number;
  title: string;
  message: string;
  category: Exclude<NotifCategory, 'all'>;
  priority: NotifPriority;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<Exclude<NotifCategory, 'all'>, { icon: React.ElementType; color: string; bg: string }> = {
  event:   { icon: Calendar,      color: 'text-violet-600',  bg: 'bg-violet-100'  },
  user:    { icon: Users,         color: 'text-blue-600',    bg: 'bg-blue-100'    },
  payment: { icon: CreditCard,    color: 'text-emerald-600', bg: 'bg-emerald-100' },
  message: { icon: MessageSquare, color: 'text-amber-600',   bg: 'bg-amber-100'   },
  system:  { icon: ShieldAlert,   color: 'text-gray-600',    bg: 'bg-gray-100'    },
};

const PRIORITY_META: Record<NotifPriority, { label: string; dot: string }> = {
  high:   { label: 'High',   dot: 'bg-red-500'   },
  medium: { label: 'Medium', dot: 'bg-amber-400' },
  low:    { label: 'Low',    dot: 'bg-gray-300'  },
};

const CATEGORIES: { value: NotifCategory; label: string }[] = [
  { value: 'all',     label: 'All'      },
  { value: 'event',   label: 'Events'   },
  { value: 'user',    label: 'Users'    },
  { value: 'payment', label: 'Payments' },
  { value: 'message', label: 'Messages' },
  { value: 'system',  label: 'System'   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { timeAgo } from '@shared/utils/timeAgo';

// ─── Component ────────────────────────────────────────────────────────────────

const Notifications: React.FC = () => {
  const [notifs,        setNotifs]    = useState<Notification[]>([]);
  const [loading,       setLoading]   = useState(true);
  const [refreshing,    setRefresh]   = useState(false);
  const [error,         setError]     = useState<string | null>(null);
  const [category,      setCategory]  = useState<NotifCategory>('all');
  const [showUnreadOnly, setUnread]   = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefresh(true);
    setError(null);
    try {
      const data: Notification[] = await listAdminNotifications(200);
      setNotifs(data);
    } catch {
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // ── Derived counts ─────────────────────────────────────────────────────────
  const unreadCount = notifs.filter(n => !n.is_read).length;

  const filtered = notifs.filter(n => {
    if (category !== 'all' && n.category !== category) return false;
    if (showUnreadOnly && n.is_read) return false;
    return true;
  });

  // ── Mark one read ──────────────────────────────────────────────────────────
  const markRead = async (id: number) => {
    const prev = notifs;
    setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await markNotificationRead(id);
      adminEvents.emit('badges:refresh');
    } catch {
      setNotifs(prev);
    }
  };

  // ── Mark all read ──────────────────────────────────────────────────────────
  const markAllRead = async () => {
    const prev = notifs;
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead();
      adminEvents.emit('badges:refresh');
    } catch {
      setNotifs(prev);
    }
  };

  // ── Dismiss one ────────────────────────────────────────────────────────────
  const dismiss = async (id: number) => {
    const prev = notifs;
    setNotifs(p => p.filter(n => n.id !== id));
    try {
      await dismissNotification(id);
      adminEvents.emit('badges:refresh');
    } catch {
      setNotifs(prev);
    }
  };

  // ── Clear all read ─────────────────────────────────────────────────────────
  const clearRead = async () => {
    const prev = notifs;
    setNotifs(p => p.filter(n => !n.is_read));
    try {
      await clearReadNotifications();
      // No badge refresh needed — clearing read notifs doesn't change unread count
    } catch {
      setNotifs(prev);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : unreadCount > 0
              ? <><span className="font-semibold text-purple-600">{unreadCount} unread</span> · {notifs.length} total</>
              : `${notifs.length} notifications, all caught up`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
            className="btn-secondary btn-sm flex items-center gap-2 disabled:opacity-60"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="btn-secondary btn-sm flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          {notifs.some(n => n.is_read) && (
            <button
              onClick={clearRead}
              className="btn-secondary btn-sm flex items-center gap-2 text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="w-4 h-4" /> Clear read
            </button>
          )}
        </div>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => loadNotifications()}
            className="text-xs text-red-600 font-semibold hover:underline flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/5" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* ── Category stats strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['event', 'user', 'payment', 'message'] as const).map(cat => {
              const meta  = CATEGORY_META[cat];
              const Icon  = meta.icon;
              const count = notifs.filter(n => n.category === cat && !n.is_read).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
                    ${category === cat
                      ? 'border-purple-300 bg-purple-50 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-purple-200'}`}
                >
                  <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 capitalize">{cat}</p>
                    <p className="text-sm font-bold text-gray-900">
                      {count > 0
                        ? <span className="text-red-600">{count} new</span>
                        : 'All clear'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Filter bar ── */}
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex gap-1.5 flex-wrap flex-1">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${category === c.value
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {c.label}
                  {c.value !== 'all' && (
                    <span className={`ml-1.5 ${category === c.value ? 'opacity-70' : 'opacity-50'}`}>
                      ({notifs.filter(n => n.category === c.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 ml-auto">
              <div
                onClick={() => setUnread(p => !p)}
                className="rounded-full transition-all relative cursor-pointer flex-shrink-0"
                style={{ height: '18px', width: '32px', background: showUnreadOnly ? '#7c3aed' : '#e5e7eb' }}
              >
                <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all
                  ${showUnreadOnly ? 'left-[14px]' : 'left-0.5'}`} />
              </div>
              Unread only
            </label>
          </div>

          {/* ── Notifications list ── */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">No notifications here</p>
              <p className="text-sm text-gray-500">
                {showUnreadOnly ? 'All notifications have been read.' : 'Nothing to show for this filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(notif => {
                const meta  = CATEGORY_META[notif.category];
                const Icon  = meta.icon;
                const pMeta = PRIORITY_META[notif.priority];

                return (
                  <div
                    key={notif.id}
                    className={`group relative bg-white rounded-xl border transition-all hover:bg-purple-100
                      ${!notif.is_read
                        ? 'border-purple-200 shadow-sm shadow-purple-50'
                        : 'border-gray-100'}`}
                  >
                    {/* Unread left bar */}
                    {!notif.is_read && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-purple-500 rounded-r-full" />
                    )}

                    <div className="px-5 py-4 flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon style={{ width: 18, height: 18 }} className={meta.color} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notif.title}
                            </p>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                              ${notif.priority === 'high'   ? 'bg-red-100 text-red-700'   :
                                notif.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                              'bg-gray-100 text-gray-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${pMeta.dot}`} />
                              {pMeta.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {timeAgo(notif.created_at)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>

                        <div className="flex items-center gap-3 mt-2">
                          {notif.action_url && (
                            <a
                              href={notif.action_url}
                              onClick={() => markRead(notif.id)}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                            >
                              View →
                            </a>
                          )}
                          {!notif.is_read && (
                            <button
                              onClick={() => markRead(notif.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                            >
                              <Check className="w-3 h-3" /> Mark read
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dismiss X */}
                      <button
                        onClick={() => dismiss(notif.id)}
                        className="opacity-0 group-hover:opacity-100 btn-icon w-6 h-6 flex-shrink-0 transition-opacity"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Info note ── */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Notifications are retained for 30 days. High-priority alerts are also sent to your registered admin email.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;