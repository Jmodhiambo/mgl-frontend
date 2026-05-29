// src/apps/admin/components/layout/Header.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Bell, Menu, X, ChevronDown,
  Calendar, CheckCheck, AlertCircle, MessageSquare, Users, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  listAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} from '@admin/services/adminService';
import { adminEvents } from '@admin/utils/adminEvents';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  adminName?: string;
  /** Live unread count passed down from AdminLayout */
  unreadNotifications?: number;
  /** Called when admin marks all read so layout can zero the badge */
  onNotificationsRead?: () => void;
}

interface HeaderNotification {
  id: number;
  title: string;
  message: string;
  type: 'event' | 'user' | 'payment' | 'message' | 'system';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICONS = {
  event:   { icon: Calendar,      color: 'text-violet-600',  bg: 'bg-violet-100'  },
  user:    { icon: Users,         color: 'text-blue-600',    bg: 'bg-blue-100'    },
  payment: { icon: AlertCircle,   color: 'text-amber-600',   bg: 'bg-amber-100'   },
  message: { icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  system:  { icon: AlertCircle,   color: 'text-gray-600',    bg: 'bg-gray-100'    },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Header: React.FC<HeaderProps> = ({
  title,
  onMenuToggle,
  menuOpen,
  adminName = 'Admin',
  unreadNotifications = 0,
  onNotificationsRead,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs,      setNotifs]      = useState<HeaderNotification[]>([]);
  const [notifLoading, setNL]         = useState(false);
  const notifRef  = useRef<HTMLDivElement>(null);
  const navigate  = useNavigate();
  const userUrl   = import.meta.env.VITE_USER_DOMAIN;

  // Unread count driven by prop from layout (source of truth),
  // but we also track local read state for instant UI feedback
  const localUnread = notifs.filter(n => !n.is_read).length;
  const badgeCount  = notifOpen ? localUnread : unreadNotifications;

  // ── Fetch notifications when dropdown opens ──────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setNL(true);
    try {
      const data = await listAdminNotifications(20);
      setNotifs(data);
    } catch {
      // silently degrade — keep stale list if any
    } finally {
      setNL(false);
    }
  }, []);

  useEffect(() => {
    if (notifOpen && notifs.length === 0) fetchNotifications();
  }, [notifOpen, notifs.length, fetchNotifications]);

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/users?search=${encodeURIComponent(searchQuery)}`);
  };

  // ── Mark one read ────────────────────────────────────────────────────────
  const handleNotifClick = async (notif: HeaderNotification) => {
    setNotifOpen(false);
    if (!notif.is_read) {
      // Optimistic update
      setNotifs(p => p.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      try {
        await markNotificationRead(notif.id);
        // Refresh all badges so sidebar message count stays in sync
        adminEvents.emit('badges:refresh');
      } catch {
        // Revert on failure
        setNotifs(p => p.map(n => n.id === notif.id ? { ...n, is_read: false } : n));
      }
    }
    if (notif.action_url) navigate(notif.action_url);
  };

  // ── Mark all read ────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
    onNotificationsRead?.();
    try {
      await markAllNotificationsRead();
      adminEvents.emit('badges:refresh');
    } catch {
      fetchNotifications();
    }
  };

  // ── Dismiss one ─────────────────────────────────────────────────────────
  const handleDismiss = async (e: React.MouseEvent, notifId: number) => {
    e.stopPropagation();
    setNotifs(p => p.filter(n => n.id !== notifId));
    try {
      await dismissNotification(notifId);
    } catch {
      fetchNotifications();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-30">

      {/* Mobile menu toggle */}
      <button onClick={onMenuToggle} className="lg:hidden btn-icon">
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users, events, bookings…"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                       focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                       transition-all placeholder-gray-400"
          />
        </div>
      </form>

      <div className="flex-1" />

      {/* Browse Events */}
      <a
        href={userUrl}
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50
                   text-purple-700 text-sm font-medium hover:bg-purple-100 hover:border-purple-300 transition-all"
        title="Browse Events"
      >
        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Browse Events</span>
      </a>

      {/* ── Notifications Bell ── */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="relative btn-icon"
          aria-label="Notifications"
        >
          <Bell className={`w-5 h-5 transition-colors ${notifOpen ? 'text-purple-600' : ''}`} />
          {badgeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white
                             rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {notifOpen && (
          <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up z-50">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                {localUnread > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    {localUnread} new
                  </span>
                )}
              </div>
              {localUnread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Loading…</span>
                </div>
              ) : notifs.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No notifications yet.</p>
              ) : (
                notifs.map(notif => {
                  const meta = TYPE_ICONS[notif.type] ?? TYPE_ICONS.system;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50
                        transition-colors group ${!notif.is_read ? 'bg-purple-50/50' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-snug ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap">
                            {timeAgo(notif.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                        )}
                        <button
                          onClick={e => handleDismiss(e, notif.id)}
                          title="Dismiss"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5
                                     text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { navigate('/notifications'); setNotifOpen(false); }}
                className="w-full text-xs text-center text-purple-600 hover:text-purple-700 font-semibold py-1 transition-colors"
              >
                View all notifications →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin avatar */}
      <div
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2.5 cursor-pointer group"
        title="My Profile"
      >
        <div className="w-8 h-8 rounded-full purple-gradient flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {adminName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{adminName}</p>
          <p className="text-xs text-purple-600 font-medium">Administrator</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>

    </header>
  );
};

export default Header;