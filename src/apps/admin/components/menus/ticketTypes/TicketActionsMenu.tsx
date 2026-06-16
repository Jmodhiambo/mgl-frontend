// src/apps/admin/components/menus/ticketTypes/TicketActionsMenu.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Pencil } from 'lucide-react';
import type { AdminTicketType } from '@admin/types';

interface Props {
  ticket: AdminTicketType;
  onView: () => void;
  onEdit: () => void;
}

const TicketActionsMenu: React.FC<Props> = ({ ticket, onView, onEdit }) => {
  const [open, setOpen]       = useState(false);
  const [menuStyle, setStyle] = useState<React.CSSProperties>({});
  const triggerRef            = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const menuHeight = 100;
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
        className="w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up"
      >
        <button
          onClick={() => { onView(); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700"
        >
          <Eye className="w-4 h-4 text-gray-400" /> View Details
        </button>
        <button
          onClick={() => { onEdit(); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-700"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
      </div>
    </>,
    document.body,
  );

  return (
    <>
      <button ref={triggerRef} onClick={handleOpen} className="btn-icon" title="Actions">
        <MoreVertical className="w-4 h-4" />
      </button>
      {menu}
    </>
  );
};

export default TicketActionsMenu;