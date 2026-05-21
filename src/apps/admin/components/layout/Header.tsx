// src/apps/admin/components/layout/Header.tsx
import { useState } from 'react';
import { Search, Bell, Menu, X, ChevronDown, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  adminName?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onMenuToggle,
  menuOpen,
  adminName = 'Admin',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const userUrl = import.meta.env.VITE_USER_DOMAIN;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/users?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden btn-icon"
      >
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

      {/* Browse Events — back to user app */}
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

      {/* Notifications */}
      <button className="relative btn-icon">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
      </button>

      {/* Admin avatar */}
      <div className="flex items-center gap-2.5 cursor-pointer group">
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