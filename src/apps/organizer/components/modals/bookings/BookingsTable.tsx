// src/organizer/components/BookingsTable.tsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Mail, MoreVertical } from 'lucide-react';

interface Booking {
  id: number;
  user_id: number;
  ticket_type_id: number;
  quantity: number;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  event_title?: string;
  ticket_type_name?: string;
}

interface BookingsTableProps {
  bookings: Booking[];
  selectedBookings: number[];
  selectAll: boolean;
  isBulkMode: boolean;
  onToggleSelectAll: () => void;
  onToggleBooking: (bookingId: number) => void;
  onViewBooking: (booking: Booking) => void;
  onEmailBooking: (booking: Booking) => void;
  getStatusBadge: (status: string) => React.JSX.Element;
  formatDate: (date: string) => string;
  /**
   * Current page's offset (0-based), used to compute the "#" column as a
   * running row number — offset + index + 1 — so it always starts at 1 on
   * page 1 regardless of how bookings are sorted. Bookings are sorted
   * newest-first, so the raw booking.id counts DOWN as you scroll (e.g.
   * #13, #12, #11...), which read as confusing/broken even though it's
   * correct. This column no longer reflects the actual database ID — the
   * real booking.id is still shown in the booking details modal.
   */
  offset: number;
  /**
   * When true, renders the event title as small text under the ticket
   * type. Only meaningful on the cross-event "all bookings" view — when
   * scoped to a single event (BookingsView with an eventId param), every
   * row already shares the same event, so showing it would just repeat
   * the same text down the whole table for no benefit.
   */
  showEventTitle?: boolean;
}

// ── Row actions menu ─────────────────────────────────────────────────────────
// Rendered via a portal (not a plain absolutely-positioned <div>) because
// this table lives inside an `overflow-x-auto` wrapper — a normal dropdown
// would get clipped by that container the moment the row isn't near the very
// top of the visible table. Same pattern as CoOrganizers.tsx's RowMenu.

const RowActionsMenu: React.FC<{
  onView: () => void;
  /** undefined in bulk-select mode — email sending is single-booking only,
   * matching the button-based version's previous behaviour. */
  onEmail?: () => void;
}> = ({ onView, onEmail }) => {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Menu height varies: one item (bulk mode, View only) vs two (View + Email).
  const menuHeight = onEmail ? 88 : 48;

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 8 && rect.top > menuHeight;
    setStyle(
      openUpward
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right, top: 'auto' }
        : { position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right },
    );
    setOpen(o => !o);
  };

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) close();
    };
    window.addEventListener('mousedown', onOutside);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('mousedown', onOutside);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={close} />
          <div style={{ ...style, zIndex: 9999 }} className="w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <button
              onClick={() => { close(); onView(); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" /> View Details
            </button>
            {onEmail && (
              <button
                onClick={() => { close(); onEmail(); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
              >
                <Mail className="w-4 h-4" /> Send Email
              </button>
            )}
          </div>
        </>,
        document.body,
      )}
    </>
  );
};

const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  selectedBookings,
  selectAll,
  isBulkMode,
  onToggleSelectAll,
  onToggleBooking,
  onViewBooking,
  onEmailBooking,
  getStatusBadge,
  formatDate,
  offset,
  showEventTitle = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {isBulkMode && (
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              {/* Fixed width — this column used to grow with the event title
                  (added below the ticket type) and push Quantity/Total/
                  Status/Date/Actions off-screen, forcing horizontal scroll.
                  w-48 caps it regardless of content; both lines inside
                  truncate with an ellipsis and show the full text on hover
                  via the title attribute. */}
              <th className="w-48 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ticket Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking, index) => (
              <tr 
                key={booking.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  isBulkMode && selectedBookings.includes(booking.id) ? 'bg-blue-50' : ''
                }`}
              >
                {isBulkMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => onToggleBooking(booking.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-800">{offset + index + 1}</span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{booking.customer_name}</div>
                    <div className="text-sm text-gray-500">{booking.customer_email}</div>
                  </div>
                </td>
                <td className="w-48 px-6 py-4">
                  <span
                    title={booking.ticket_type_name}
                    className="text-sm text-gray-800 truncate block max-w-[160px]"
                  >
                    {booking.ticket_type_name}
                  </span>
                  {showEventTitle && booking.event_title && (
                    <p
                      title={booking.event_title}
                      className="text-xs text-blue-600 truncate max-w-[160px] mt-0.5"
                    >
                      {booking.event_title}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">{booking.quantity}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-green-600">
                    KES {booking.total_price.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatDate(booking.created_at)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RowActionsMenu
                    onView={() => onViewBooking(booking)}
                    onEmail={!isBulkMode ? () => onEmailBooking(booking) : undefined}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTable;