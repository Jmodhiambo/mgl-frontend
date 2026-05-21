// src/apps/admin/components/layout/Sidebar.tsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Ticket, CreditCard,
  MessageSquare, BarChart3, FileText, Settings, Shield,
  ClipboardList, ChevronRight, Zap, UserCog, LogOut,
  Bell, Tag, X,
} from 'lucide-react';

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

interface SidebarProps {
  onLogout?: () => void;
  onClose?: () => void;
  pendingApprovals?: number;
  openMessages?: number;
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
    ],
  },
  {
    label: 'Management',
    items: [
      { path: '/users',     label: 'Users',        icon: Users },
      { path: '/events',    label: 'Events',       icon: Calendar },
      { path: '/bookings',  label: 'Bookings',     icon: Ticket },
      { path: '/payments',  label: 'Payments',     icon: CreditCard },
      { path: '/ticket-types', label: 'Ticket Types', icon: Tag },
    ],
  },
  {
    label: 'Communication',
    items: [
      { path: '/messages',  label: 'Messages',     icon: MessageSquare },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/analytics', label: 'Analytics',    icon: BarChart3 },
      { path: '/reports',   label: 'Reports',      icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/audit-logs', label: 'Audit Logs',  icon: ClipboardList },
      { path: '/settings',   label: 'Settings',    icon: Settings },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ onLogout, onClose, pendingApprovals = 0, openMessages = 0 }) => {
  const location = useLocation();
  const userUrl = import.meta.env.VITE_USER_DOMAIN;

  // Inject dynamic badges
  const withBadges = navSections.map(section => ({
    ...section,
    items: section.items.map(item => {
      if (item.path === '/events' && pendingApprovals > 0)
        return { ...item, badge: pendingApprovals };
      if (item.path === '/messages' && openMessages > 0)
        return { ...item, badge: openMessages };
      return item;
    }),
  }));

  return (
    <aside className="sidebar flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl purple-gradient flex items-center justify-center flex-shrink-0 shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm leading-tight">MGLTickets</p>
          <p className="text-purple-400 text-xs font-medium">Admin Console</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3">
        {withBadges.map((section) => (
          <div key={section.label}>
            <p className="nav-section-label">{section.label}</p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`nav-item mb-0.5 ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                      ${isActive ? 'bg-white/25 text-white' : 'bg-purple-600 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom strip ── */}
      <div className="px-3 py-3 border-t border-white/8 space-y-0.5">
        {/* Browse Events — back to user app */}
        <a
          href={userUrl}
          rel="noopener noreferrer"
          className="nav-item nav-item-inactive w-full text-left text-purple-300 hover:bg-purple-500/15 hover:text-purple-200"
        >
          <Calendar className="w-4 h-4" />
          <span className="flex-1">Browse Events</span>
        </a>
        <div className="border-t border-white/8 my-1.5" />
        {/* Quick actions */}
        <button className="nav-item nav-item-inactive w-full text-left">
          <Bell className="w-4 h-4" />
          <span className="flex-1">Notifications</span>
          <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">3</span>
        </button>
        <button className="nav-item nav-item-inactive w-full text-left">
          <UserCog className="w-4 h-4" />
          <span className="flex-1">My Profile</span>
        </button>
        <button
          onClick={onLogout}
          className="nav-item w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        {/* Version */}
        <div className="flex items-center gap-2 px-3 pt-3">
          <Zap className="w-3 h-3 text-purple-500" />
          <span className="text-xs text-gray-600">v1.0.0 · Admin Panel</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;