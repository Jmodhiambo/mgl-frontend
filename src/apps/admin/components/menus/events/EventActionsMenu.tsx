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
  onAction: (a: 'approve' | 'reject' | 'delete' | 'confirm_deletion_ready') => void;
  onStatusChange: (status: EventLifecycleStatus) => void;
  statusUpdating?: boolean;
  onView: () => void;
  onAddTicketTypes: () => void;
  onManageCoOrganizers: () => void;
}

// Every lifecycle status, with the icon + label used wherever it appears as
// a *target* (i.e. "switch to this status"). Order here is the menu order.
//
// 'deleted' is included here deliberately, alongside 'cancelled'. This is a
// SOFT delete — same status value the organizer's own PATCH endpoint writes
// when they request removal — and is intentionally separate from the actual
// hard-delete (the "Delete" item further down, which calls DELETE
// /admin/events/{id} and is RESTRICTed server-side if the event has
// orders/bookings).
//
// IMPORTANT: clicking "Mark as Deleted" does not always result in
// status='deleted'. update_event_status_service checks bookings first —
// if the event has any, it silently redirects to 'pending_deletion'
// instead, since plain 'deleted' is meant to mean "no money attached,
// safe to purge." Either outcome is fine from this menu's perspective
// (both queue the event for removal and stay reopenable via "Reopen
// Event"), so the label stays "Mark as Deleted" rather than trying to
// predict which of the two it'll actually become.
const STATUS_TARGETS: { value: EventLifecycleStatus; label: string; icon: React.ReactNode; className: string }[] = [
  { value: 'upcoming',  label: 'Set to Upcoming',  icon: <Calendar className="w-4 h-4" />,    className: 'text-blue-700 hover:bg-blue-50' },
  { value: 'ongoing',   label: 'Set to Ongoing',   icon: <PlayCircle className="w-4 h-4" />,   className: 'text-emerald-700 hover:bg-emerald-50' },
  { value: 'completed', label: 'Mark Completed',   icon: <CheckCircle className="w-4 h-4" />,  className: 'text-gray-700 hover:bg-gray-50' },
  { value: 'cancelled', label: 'Cancel Event',     icon: <XCircle className="w-4 h-4" />,      className: 'text-amber-700 hover:bg-amber-50' },
  { value: 'deleted',   label: 'Mark as Deleted',  icon: <Trash2 className="w-4 h-4" />,       className: 'text-red-700 hover:bg-red-50' },
];

const EventActionsMenu: React.FC<Props> = ({ event, onAction, onStatusChange, statusUpdating, onView, onAddTicketTypes, onManageCoOrganizers }) => {
  const [open, setOpen]             = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuStyle, setStyle]       = useState<React.CSSProperties>({});
  const triggerRef                  = useRef<HTMLButtonElement>(null);
  const menuRef                     = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    if (!triggerRef.current) return;
    const rect             = triggerRef.current.getBoundingClientRect();
    const edgeMargin       = 8;   // breathing room from the viewport edge
    const estimatedHeight  = 280; // rough size with the status submenu open — used only to pick a direction
    const spaceBelow       = window.innerHeight - rect.bottom - edgeMargin;
    const spaceAbove       = rect.top - edgeMargin;
    const openUpward       = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    // Cap the menu to whatever room actually exists in the chosen direction
    // (not a fixed guess) so long content — e.g. the status submenu plus the
    // unresolved-bookings note — scrolls internally instead of being
    // clipped off the top/bottom of the viewport.
    const maxHeight = Math.max(160, openUpward ? spaceAbove : spaceBelow);

    setStyle(
      openUpward
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right, top: 'auto', maxHeight }
        : { position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right, maxHeight },
    );
    setOpen(o => !o);
    setStatusOpen(false);
  }, []);

  const closeAll = useCallback(() => {
    setOpen(false);
    setStatusOpen(false);
  }, []);

  // Closes the menu when the page behind it scrolls (so it doesn't stay
  // pinned to a now-stale position). Registered with capture:true so it
  // sees scroll events from any scrollable ancestor, e.g. a table wrapper —
  // scroll events don't bubble, so capture on window is the only way to
  // catch those.
  //
  // The catch: capture phase also sees the menu's own internal scroll
  // (from the overflow-y-auto content added for long menus), since that
  // fires before the event reaches its target too. Without the guard
  // below, scrolling *inside* the dropdown was indistinguishable from the
  // page scrolling, so the menu closed itself the instant you tried to
  // scroll it. Bail out early whenever the scroll originated from within
  // menuRef.
  const handlePageScroll = useCallback((e: Event) => {
    if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) {
      return;
    }
    closeAll();
  }, [closeAll]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', handlePageScroll, true);
    window.addEventListener('resize', closeAll);
    return () => {
      window.removeEventListener('scroll', handlePageScroll, true);
      window.removeEventListener('resize', closeAll);
    };
  }, [open, handlePageScroll, closeAll]);

  // Reopening applies to any non-terminal "queued for removal" state:
  // cancelled, deleted, or pending_deletion. All three leave the row intact
  // in the DB, so "reopen" (-> upcoming) is equally valid for all three —
  // the admin is choosing to keep the event alive instead of letting it
  // proceed toward removal.
  const showQuickReopen =
    event.status === 'cancelled' ||
    event.status === 'deleted' ||
    event.status === 'pending_deletion';

  // The backend's deletion guard (event_services.update_event_status_service)
  // checks unresolved_bookings_count, NOT total_bookings — total_bookings on
  // this schema is confirmed-only (via a join pre-filtered to
  // status == "confirmed"), so it would miss 'pending' bookings (payment
  // in flight) that should still block deletion, and would also disagree
  // with the EventStats page's own total_bookings, which counts every
  // status including refunded. unresolved_bookings_count is its own
  // explicitly-scoped field specifically to avoid both of those traps —
  // reading it directly here means this menu's gating logic matches
  // exactly what the backend will actually do.
  const hasUnresolvedBookings = (event.unresolved_bookings_count ?? 0) > 0;

  // status === 'deleted': no unresolved bookings, safe to hard-delete right now.
  const isSafeToHardDelete = event.status === 'deleted';

  // status === 'pending_deletion': someone asked for deletion, but the
  // event had unresolved bookings at that time, so it was redirected here
  // instead of going straight to 'deleted'. This is visible to organizers
  // too (unlike 'deleted'), specifically so they can track that refunds
  // are pending.
  const isPendingDeletion = event.status === 'pending_deletion';

  // Once every booking has actually been refunded or cancelled
  // (unresolved_bookings_count drops to 0 — this is a live count, not a
  // snapshot from when pending_deletion was set), the event becomes
  // eligible for the manual admin transition into plain 'deleted'.
  // confirm_event_deletion_ready_service re-checks bookings itself at
  // click-time regardless, so this is just what gates the menu item's
  // visibility — it isn't the source of truth.
  const canConfirmDeletionReady = isPendingDeletion && !hasUnresolvedBookings;

  const menu = open && createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={closeAll} />
      <div
        ref={menuRef}
        style={{ ...menuStyle, zIndex: 9999 }}
        className="w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up overflow-y-auto overscroll-contain"
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

        {/* pending_deletion with unresolved bookings still outstanding:
            nothing actionable here besides waiting on refunds — shown as
            inert context, not a button, so the admin doesn't click
            something that immediately 400s. */}
        {isPendingDeletion && hasUnresolvedBookings && (
          <div className="flex items-start gap-2.5 w-full px-4 py-2.5 text-orange-600">
            <Trash2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-[11px] leading-snug">
              {event.unresolved_bookings_count} booking(s) still need
              refunding before this can be confirmed for deletion.
            </span>
          </div>
        )}

        {/* pending_deletion with zero unresolved bookings remaining: the
            deliberate manual checkpoint — moves status -> 'deleted' via
            confirm_event_deletion_ready_service, which re-verifies
            bookings server-side before writing anything. This is
            intentionally separate from hard-delete itself (further down)
            so "this is safe to purge" and "actually purge it" stay two
            distinct, deliberate admin actions. */}
        {canConfirmDeletionReady && (
          <button
            onClick={() => { onAction('confirm_deletion_ready'); closeAll(); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-emerald-50 text-emerald-700"
          >
            <CheckCircle className="w-4 h-4" /> Confirm Deletion Ready
          </button>
        )}

        <div className="divider my-1" />
        {hasUnresolvedBookings ? (
          // Hard-delete will be RESTRICTed by the backend (orders/bookings
          // FK). Still clickable — clicking opens the confirm dialog, which
          // carries the same "cancel instead" guidance — but greyed and
          // annotated up front so the admin isn't surprised by a 400.
          <button
            onClick={() => { onAction('delete'); closeAll(); }}
            className="flex items-start gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-400"
          >
            <Trash2 className="w-4 h-4 mt-0.5" />
            <span className="text-left">
              <span className="block">Delete</span>
              <span className="block text-[11px] text-gray-400">Has unresolved bookings — will be blocked</span>
            </span>
          </button>
        ) : isSafeToHardDelete ? (
          // Safe to hard-delete: status is already 'deleted' (queued for
          // removal — by the organizer's own request, or by an admin via
          // "Mark as Deleted" above, or via "Confirm Deletion Ready" once
          // refunds cleared) and there's nothing financial attached.
          // Labelled distinctly so the admin recognises this as "finishing
          // a queued removal," not an arbitrary destructive action.
          <button
            onClick={() => { onAction('delete'); closeAll(); }}
            className="flex items-start gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600"
          >
            <Trash2 className="w-4 h-4 mt-0.5" />
            <span className="text-left">
              <span className="block">Confirm Delete</span>
              <span className="block text-[11px] text-red-400">Queued for removal</span>
            </span>
          </button>
        ) : (
          <button
            onClick={() => { onAction('delete'); closeAll(); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        )}
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