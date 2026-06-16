// src/apps/admin/components/menus/events/EventActionsMenu.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Tag, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import type { AdminEvent } from '@admin/types';

interface Props {
  event: AdminEvent;
  onAction: (a: 'approve' | 'reject' | 'delete') => void;
  onView: () => void;
  onAddTicketTypes: () => void;
}

const EventActionsMenu: React.FC<Props> = ({ event, onAction, onView, onAddTicketTypes }) => {
  const [open, setOpen]       = useState(false);
  const [menuStyle, setStyle] = useState<React.CSSProperties>({});
  const triggerRef            = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const menuHeight = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;
    setStyle(
      openUpward
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right, top: 'auto' }
        : { position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right },
    );
    setOpen(o => !o);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const menu = open && createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
      <div
        style={{ ...menuStyle, zIndex: 9999 }}
        className="w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up"
      >
        <button
          onClick={() => { onView(); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700"
        >
          <Eye className="w-4 h-4 text-gray-400" /> View Details
        </button>
        <button
          onClick={() => { onAddTicketTypes(); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-700"
        >
          <Tag className="w-4 h-4" /> Add Ticket Types
        </button>
        {!event.is_approved && (
          <button
            onClick={() => { onAction('approve'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-emerald-50 text-emerald-700"
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </button>
        )}
        {event.is_approved && (
          <button
            onClick={() => { onAction('reject'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-amber-50 text-amber-700"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
        )}
        <div className="divider my-1" />
        <button
          onClick={() => { onAction('delete'); setOpen(false); }}
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
      <button ref={triggerRef} onClick={handleOpen} className="btn-icon">
        <MoreVertical className="w-4 h-4" />
      </button>
      {menu}
    </>
  );
};

export default EventActionsMenu;