// src/apps/admin/pages/Notifications.tsx
// ─── API ENDPOINTS USED IN THIS FILE ─────────────────────────────────────────
// GET    /admin/notifications              → useEffect on mount (loads full list)
// PATCH  /admin/notifications/:id/read    → markRead()    (Mark read / View → click)
// PATCH  /admin/notifications/read-all    → markAllRead() (Mark all read button)
// DELETE /admin/notifications/:id         → dismiss()     (X button on each card)
// DELETE /admin/notifications/clear-read  → clearRead()   (Clear read button)
//
// ─── ENDPOINTS AVAILABLE BUT HANDLED CLIENT-SIDE HERE ────────────────────────
// GET /admin/notifications/unread        → not called; unread filtering is done
//                                          locally via the showUnreadOnly toggle
// GET /admin/notifications/category/:cat → not called; category filtering is done
//                                          locally via the category tab buttons
//
// ─── ENDPOINT USED OUTSIDE THIS FILE ─────────────────────────────────────────
// GET /admin/notifications/count/unread  → called from Header.tsx to drive the
//                                          unread badge count in the top nav bar
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  Bell, CheckCheck, Trash2, Calendar, Users, CreditCard,
  MessageSquare, ShieldAlert, Info, X, Filter, Check,
} from 'lucide-react';
// import api from '@shared/api/axiosConfig';

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

// ─── Dummy data (remove once API is live) ────────────────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1,  title: 'New event pending approval',       message: 'Nakuru Cultural Festival submitted by Karen Wambui needs review.',           category: 'event',   priority: 'high',   is_read: false, created_at: '2025-04-06T10:00:00Z', action_url: '/events' },
  { id: 2,  title: 'Payment dispute opened',           message: 'John Mwenda raised a dispute for KES 1,200 — Transaction #QH123456.',        category: 'payment', priority: 'high',   is_read: false, created_at: '2025-04-05T08:30:00Z', action_url: '/payments' },
  { id: 3,  title: 'New contact message',              message: 'Diana Auma reported a wrong event date for Nakuru Cultural Festival.',         category: 'message', priority: 'high',   is_read: false, created_at: '2025-04-06T10:00:00Z', action_url: '/messages' },
  { id: 4,  title: 'User account flagged',             message: "David Kimani's account triggered suspicious activity detection.",             category: 'user',    priority: 'high',   is_read: false, created_at: '2025-04-06T09:00:00Z', action_url: '/users' },
  { id: 5,  title: 'Event approved successfully',      message: 'Nairobi Jazz Festival (ID #1) has been approved and is now live.',            category: 'event',   priority: 'medium', is_read: true,  created_at: '2025-03-10T12:00:00Z' },
  { id: 6,  title: 'New organizer registration',       message: 'Karen Wambui has completed their organizer profile setup.',                    category: 'user',    priority: 'medium', is_read: true,  created_at: '2025-03-27T09:30:00Z', action_url: '/users' },
  { id: 7,  title: 'Weekly revenue milestone',         message: 'Revenue crossed KES 400,000 this month — 6% above target.',                  category: 'payment', priority: 'medium', is_read: true,  created_at: '2025-03-01T08:00:00Z' },
  { id: 8,  title: 'Session cleanup completed',        message: '42 stale sessions older than 24h were purged from the database.',             category: 'system',  priority: 'low',    is_read: true,  created_at: '2025-04-04T03:00:00Z' },
  { id: 9,  title: 'Event sold out',                   message: 'Mombasa Beach Party Early Bird tickets (300/300) are fully sold out.',        category: 'event',   priority: 'low',    is_read: true,  created_at: '2025-03-15T14:00:00Z', action_url: '/events' },
  { id: 10, title: 'New bulk user registrations',      message: '234 new users joined this week — highest weekly growth in 3 months.',         category: 'user',    priority: 'low',    is_read: true,  created_at: '2025-04-01T09:00:00Z' },
  { id: 11, title: 'Spam message auto-flagged',        message: 'System auto-marked MSG-005 as spam based on content filters.',               category: 'system',  priority: 'low',    is_read: true,  created_at: '2025-04-05T12:05:00Z' },
  { id: 12, title: 'Refund processed',                 message: 'Refund of KES 6,000 to Carol Njoroge for Tech Summit VIP tickets completed.', category: 'payment', priority: 'medium', is_read: true,  created_at: '2025-04-01T09:05:00Z', action_url: '/payments' },
];
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<Exclude<NotifCategory, 'all'>, { icon: React.ElementType; color: string; bg: string }> = {
  event:   { icon: Calendar,      color: 'text-violet-600', bg: 'bg-violet-100' },
  user:    { icon: Users,         color: 'text-blue-600',   bg: 'bg-blue-100'   },
  payment: { icon: CreditCard,    color: 'text-emerald-600',bg: 'bg-emerald-100'},
  message: { icon: MessageSquare, color: 'text-amber-600',  bg: 'bg-amber-100'  },
  system:  { icon: ShieldAlert,   color: 'text-gray-600',   bg: 'bg-gray-100'   },
};

const PRIORITY_META: Record<NotifPriority, { label: string; dot: string }> = {
  high:   { label: 'High',   dot: 'bg-red-500'    },
  medium: { label: 'Medium', dot: 'bg-amber-400'  },
  low:    { label: 'Low',    dot: 'bg-gray-300'   },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CATEGORIES: { value: NotifCategory; label: string }[] = [
  { value: 'all',     label: 'All'      },
  { value: 'event',   label: 'Events'   },
  { value: 'user',    label: 'Users'    },
  { value: 'payment', label: 'Payments' },
  { value: 'message', label: 'Messages' },
  { value: 'system',  label: 'System'   },
];

const Notifications: React.FC = () => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<NotifCategory>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // ── LIVE API (uncomment when backend is ready) ──
        // GET /admin/notifications  → loads the full list; unread/category
        // filtering is then handled client-side from this single response.
        // const data: Notification[] = (await api.get('/admin/notifications')).data;
        // setNotifs(data);

        // ── Dummy data (remove when API is live) ──
        await new Promise(r => setTimeout(r, 300));
        setNotifs(MOCK_NOTIFICATIONS);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const unreadCount = notifs.filter(n => !n.is_read).length;

  const filtered = notifs.filter(n => {
    if (category !== 'all' && n.category !== category) return false;
    if (showUnreadOnly && n.is_read) return false;
    return true;
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  const markRead = async (id: number) => {
    // PATCH /admin/notifications/:id/read
    // Called by: "Mark read" button on each card, and the "View →" link click.
    // await api.patch(`/admin/notifications/${id}/read`);
    setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    // PATCH /admin/notifications/read-all
    // Called by: "Mark all read" button in the page header (only shown when
    // unreadCount > 0).
    // await api.patch('/admin/notifications/read-all');
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
  };

  const dismiss = async (id: number) => {
    // DELETE /admin/notifications/:id
    // Called by: the X button that appears on hover on each notification card.
    // await api.delete(`/admin/notifications/${id}`);
    setNotifs(p => p.filter(n => n.id !== id));
  };

  const clearRead = async () => {
    // DELETE /admin/notifications/clear-read
    // Called by: the "Clear read" button in the page header (only shown when
    // there is at least one read notification in the list).
    // await api.delete('/admin/notifications/clear-read');
    setNotifs(p => p.filter(n => !n.is_read));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
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
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="btn-secondary btn-sm flex items-center gap-2">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          {notifs.filter(n => n.is_read).length > 0 && (
            <button onClick={clearRead}
              className="btn-secondary btn-sm flex items-center gap-2 text-red-600 hover:bg-red-50 hover:border-red-200">
              <Trash2 className="w-4 h-4" /> Clear read
            </button>
          )}
        </div>
      </div>

      {/* Loading skeleton */}
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
          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['event', 'user', 'payment', 'message'] as const).map(cat => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const count = notifs.filter(n => n.category === cat && !n.is_read).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
                    ${category === cat ? 'border-purple-300 bg-purple-50 shadow-sm' : 'border-gray-100 bg-white hover:border-purple-200'}`}
                >
                  <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 capitalize">{cat}</p>
                    <p className="text-sm font-bold text-gray-900">
                      {count > 0 ? <span className="text-red-600">{count} new</span> : 'All clear'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filter bar */}
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
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 ml-auto">
              <div
                onClick={() => setShowUnreadOnly(p => !p)}
                className="rounded-full transition-all relative cursor-pointer flex-shrink-0"
                style={{ height: '18px', width: '32px', background: showUnreadOnly ? '#7c3aed' : '#e5e7eb' }}
              >
                <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all
                  ${showUnreadOnly ? 'left-[14px]' : 'left-0.5'}`} />
              </div>
              Unread only
            </label>
          </div>

          {/* Notifications list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">No notifications here</p>
              <p className="text-sm text-gray-400">
                {showUnreadOnly ? 'All notifications have been read.' : 'Nothing to show for this filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(notif => {
                const meta = CATEGORY_META[notif.category];
                const Icon = meta.icon;
                const pMeta = PRIORITY_META[notif.priority];

                return (
                  <div
                    key={notif.id}
                    className={`group relative bg-white rounded-xl border transition-all
                      ${!notif.is_read
                        ? 'border-purple-200 shadow-sm shadow-purple-50'
                        : 'border-gray-100 opacity-75 hover:opacity-100'}`}
                  >
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
                              ${notif.priority === 'high' ? 'bg-red-100 text-red-700' :
                                notif.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${pMeta.dot}`} />
                              {pMeta.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                            {timeAgo(notif.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>

                        <div className="flex items-center gap-3 mt-2">
                          {notif.action_url && (
                            <a href={notif.action_url}
                              onClick={() => markRead(notif.id)}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                              View →
                            </a>
                          )}
                          {!notif.is_read && (
                            <button onClick={() => markRead(notif.id)}
                              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                              <Check className="w-3 h-3" /> Mark read
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => dismiss(notif.id)}
                        className="opacity-0 group-hover:opacity-100 btn-icon w-6 h-6 flex-shrink-0 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info note */}
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