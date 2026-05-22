// src/apps/admin/components/layout/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, ChevronDown, Calendar, CheckCheck, CheckCircle, AlertCircle, MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  adminName?: string;
}

interface HeaderNotification {
  id: number;
  title: string;
  message: string;
  type: 'event' | 'user' | 'payment' | 'message';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

const HEADER_NOTIFS: HeaderNotification[] = [
  { id: 1, title: 'New event pending',     message: 'Nakuru Cultural Festival needs review.',          type: 'event',   is_read: false, created_at: '2025-04-06T10:00:00Z', action_url: '/events'   },
  { id: 2, title: 'Payment dispute',       message: 'John Mwenda raised a dispute for KES 1,200.',    type: 'payment', is_read: false, created_at: '2025-04-05T08:30:00Z', action_url: '/payments' },
  { id: 3, title: 'New contact message',   message: 'Diana Auma: wrong event date for Nakuru Fest.',  type: 'message', is_read: false, created_at: '2025-04-06T10:00:00Z', action_url: '/messages' },
  { id: 4, title: 'User account flagged',  message: 'David Kimani triggered suspicious activity.',    type: 'user',    is_read: true,  created_at: '2025-04-06T09:00:00Z', action_url: '/users'    },
  { id: 5, title: 'Event approved',        message: 'Nairobi Jazz Festival is now live.',             type: 'event',   is_read: true,  created_at: '2025-03-10T12:00:00Z'                         },
];

const TYPE_ICONS = {
  event:   { icon: Calendar,       color: 'text-violet-600', bg: 'bg-violet-100' },
  user:    { icon: Users,          color: 'text-blue-600',   bg: 'bg-blue-100'   },
  payment: { icon: AlertCircle,    color: 'text-amber-600',  bg: 'bg-amber-100'  },
  message: { icon: MessageSquare,  color: 'text-emerald-600',bg: 'bg-emerald-100'},
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onMenuToggle,
  menuOpen,
  adminName = 'Admin',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<HeaderNotification[]>(HEADER_NOTIFS);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userUrl = import.meta.env.VITE_USER_DOMAIN;
  const unreadCount = notifs.filter(n => !n.is_read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/users?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, is_read: true })));

  const handleNotifClick = (notif: HeaderNotification) => {
    setNotifs(p => p.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    if (notif.action_url) {
      navigate(notif.action_url);
    }
    setNotifOpen(false);
  };

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

      {/* Notifications Bell */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="relative btn-icon"
          aria-label="Notifications"
        >
          <Bell className={`w-5 h-5 transition-colors ${notifOpen ? 'text-purple-600' : ''}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white rounded-full
                             text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
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
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifs.map(notif => {
                const meta = TYPE_ICONS[notif.type];
                const Icon = meta.icon;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors
                      ${!notif.is_read ? 'bg-purple-50/50' : ''}`}
                  >
                    {/* Type icon */}
                    <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>

                    {/* Content */}
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

                    {/* Unread dot */}
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })}
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