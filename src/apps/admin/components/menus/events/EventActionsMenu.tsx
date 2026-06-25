// src/apps/admin/components/menus/events/EventActionsMenu.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical, Eye, Tag, CheckCircle, XCircle, Trash2,
  RotateCcw, Calendar, PlayCircle, ChevronRight, Users,
} from 'lucide-react';
import type { AdminEvent } from '@admin/types';
import type { EventLifecycleStatus } from '@admin/types';

interface Props {
  event: AdminEvent;
  onAction: (a: 'approve' | 'reject' | 'delete') => void;
  onStatusChange: (status: EventLifecycleStatus) => void;
  statusUpdating?: boolean;
  onView: () => void;
  onAddTicketTypes: () => void;
  onManageCoOrganizers: () => void;
}

// Every lifecycle status, with the icon + label used wherever it appears as
// a *target* (i.e. "switch to this status"). Order here is the menu order.
const STATUS_TARGETS: { value: EventLifecycleStatus; label: string; icon: React.ReactNode; className: string }[] = [
  { value: 'upcoming',  label: 'Set to Upcoming',  icon: <Calendar className="w-4 h-4" />,    className: 'text-blue-700 hover:bg-blue-50' },
  { value: 'ongoing',   label: 'Set to Ongoing',   icon: <PlayCircle className="w-4 h-4" />,   className: 'text-emerald-700 hover:bg-emerald-50' },
  { value: 'completed', label: 'Mark Completed',   icon: <CheckCircle className="w-4 h-4" />,  className: 'text-gray-700 hover:bg-gray-50' },
  { value: 'cancelled', label: 'Cancel Event',     icon: <XCircle className="w-4 h-4" />,      className: 'text-amber-700 hover:bg-amber-50' },
];

const EventActionsMenu: React.FC<Props> = ({ event, onAction, onStatusChange, statusUpdating, onView, onAddTicketTypes, onManageCoOrganizers }) => {
  const [open, setOpen]             = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuStyle, setStyle]       = useState<React.CSSProperties>({});
  const triggerRef                  = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const menuHeight = 280; // accounts for the status submenu being open
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;
    setStyle(
      openUpward
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right, top: 'auto' }
        : { position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right },
    );
    setOpen(o => !o);
    setStatusOpen(false);
  }, []);

  const closeAll = useCallback(() => {
    setOpen(false);
    setStatusOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', closeAll, true);
    window.addEventListener('resize', closeAll);
    return () => {
      window.removeEventListener('scroll', closeAll, true);
      window.removeEventListener('resize', closeAll);
    };
  }, [open, closeAll]);

  // Reopening a cancelled event is the headline use case — surface it as a
  // one-click top-level action instead of burying it in the submenu.
  const showQuickReopen = event.status === 'cancelled';

  const menu = open && createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={closeAll} />
      <div
        style={{ ...menuStyle, zIndex: 9999 }}
        className="w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up"
      >
        <button
          onClick={() => { onView(); closeAll(); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700"
        >
          <Eye className="w-4 h-4 text-gray-400" /> View Details
        </button>
        <button
          onClick={() => { onAddTicketTypes(); closeAll(); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-700"
        >
          <Tag className="w-4 h-4" /> Add Ticket Types
        </button>
        <button
          onClick={() => { onManageCoOrganizers(); closeAll(); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-blue-50 text-blue-700"
        >
          <Users className="w-4 h-4" /> Co-Organizers
        </button>

        {showQuickReopen && (
          <button
            onClick={() => { onStatusChange('upcoming'); closeAll(); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-blue-50 text-blue-700"
          >
            <RotateCcw className="w-4 h-4" /> Reopen Event
          </button>
        )}

        <div className="divider my-1" />

        {!event.is_approved && (
          <button
            onClick={() => { onAction('approve'); closeAll(); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-emerald-50 text-emerald-700"
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </button>
        )}
        {event.is_approved && (
          <button
            onClick={() => { onAction('reject'); closeAll(); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-amber-50 text-amber-700"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
        )}

        {/* Change Status submenu */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen(o => !o)}
            className="flex items-center justify-between gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700"
          >
            <span className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-gray-400" /> Change Status
            </span>
            <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${statusOpen ? 'rotate-90' : ''}`} />
          </button>
          {statusOpen && (
            <div className="bg-gray-50 border-t border-b border-gray-100">
              {STATUS_TARGETS.filter(s => s.value !== event.status).map(s => (
                <button
                  key={s.value}
                  onClick={() => { onStatusChange(s.value); closeAll(); }}
                  className={`flex items-center gap-2.5 w-full pl-8 pr-4 py-2 text-sm ${s.className}`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="divider my-1" />
        <button
          onClick={() => { onAction('delete'); closeAll(); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </>,
    document.body,
  );

  return (
    <>
      <button ref={triggerRef} onClick={handleOpen} disabled={statusUpdating} className="btn-icon disabled:opacity-50">
        {statusUpdating
          ? <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
          : <MoreVertical className="w-4 h-4" />}
      </button>
      {menu}
    </>
  );
};

export default EventActionsMenu;