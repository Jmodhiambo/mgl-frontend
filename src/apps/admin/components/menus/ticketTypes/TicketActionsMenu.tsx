// src/apps/admin/components/menus/ticketTypes/TicketActionsMenu.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Pencil, Trash2, AlertTriangle, Ban, ShieldCheck } from 'lucide-react';
import type { AdminTicketType } from '@admin/types';

interface Props {
  ticket: AdminTicketType;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
}

const TicketActionsMenu: React.FC<Props> = ({ ticket, onView, onEdit, onDelete, onSuspend, onUnsuspend }) => {
  const [open, setOpen]                 = useState(false);
  const [confirmingDelete, setConfirmingDelete]       = useState(false);
  const [confirmingUnsuspend, setConfirmingUnsuspend] = useState(false);
  const [menuStyle, setStyle]           = useState<React.CSSProperties>({});
  const triggerRef                      = useRef<HTMLButtonElement>(null);

  const isSuspended = ticket.suspended_by_admin_id != null;

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
          onClick={() => { onEdit(); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-700"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <div className="border-t border-gray-100 my-1" />
        {isSuspended ? (
          <button
            onClick={() => { setOpen(false); setConfirmingUnsuspend(true); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-emerald-50 text-emerald-700"
          >
            <ShieldCheck className="w-4 h-4" /> Unsuspend
          </button>
        ) : (
          <button
            onClick={() => { setOpen(false); onSuspend(); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-amber-50 text-amber-700"
          >
            <Ban className="w-4 h-4" /> Suspend
          </button>
        )}
        <div className="border-t border-gray-100 my-1" />
        <button
          onClick={() => { setOpen(false); setConfirmingDelete(true); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </>,
    document.body,
  );

  const confirmDeleteModal = confirmingDelete && createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-slide-up">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Ticket Type</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-800">"{ticket.name}"</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setConfirmingDelete(false)} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => { onDelete(); setConfirmingDelete(false); }}
            className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );

  const confirmUnsuspendModal = confirmingUnsuspend && createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-slide-up">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Lift Suspension?</h3>
            <p className="text-sm text-gray-500">
              This only removes the suspension flag on{' '}
              <span className="font-semibold text-gray-800">"{ticket.name}"</span>. It stays
              inactive — the organizer (or you) will still need to reactivate it separately.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setConfirmingUnsuspend(false)} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => { onUnsuspend(); setConfirmingUnsuspend(false); }}
            className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            Lift Suspension
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );

  return (
    <>
      <button ref={triggerRef} onClick={handleOpen} className="btn-icon" title="Actions">
        <MoreVertical className="w-4 h-4" />
      </button>
      {menu}
      {confirmDeleteModal}
      {confirmUnsuspendModal}
    </>
  );
};

export default TicketActionsMenu;