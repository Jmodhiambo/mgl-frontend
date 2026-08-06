// src/user/components/modals/events/TicketRow.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Ticket-type selector row with a quantity stepper. Previously duplicated
// verbatim in:
//   - user/pages/EventDetails.tsx        (public event page)
//   - user/pages/BrowseEventDetails.tsx  (authenticated event page)
// Both now import this single component instead.
//
// Trimmed for the booking-panel layout (Aug 2026): this now renders inside
// a narrow sticky sidebar instead of a full-width column, so copy is cut to
// the minimum needed to buy — name, price, stock warning, stepper. The
// "remaining" and "max per booking" lines are gone as standing text; they
// only resurface as a one-line warning once they actually bind (low stock /
// cap reached), same pattern the reference sites (mookh, ticketyetu,
// mtickets) use.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import type { TicketTypeOut } from '@shared/types/Event';

interface TicketRowProps {
  ticket: TicketTypeOut;
  selectedQty: number;
  onChange: (id: number, qty: number) => void;
}

const TicketRow: React.FC<TicketRowProps> = ({ ticket, selectedQty, onChange }) => {
  // Defensive fallback: if quantity_available ever comes back undefined
  // (e.g. a field mismatch, or dummy data mid-cutover), `undefined <= 0`
  // is false, so isSoldOut would silently be false too — that let a
  // dead stepper render (buttons visible, but every action disabled via
  // a NaN comparison, so pressing them did nothing). Coalescing to 0
  // makes "no data" behave the same as "sold out" instead of the same
  // as "unlimited".
  const available  = ticket.quantity_available ?? 0;
  const isLowStock = available <= 10 && available > 0;
  const isSoldOut  = available <= 0;
  // The buyer can never take more than what's in stock, and never more
  // than this ticket type's per-booking cap — whichever is smaller wins.
  const effectiveMax = Math.max(0, Math.min(available, ticket.max_per_booking ?? available));
  const capIsBindingConstraint = ticket.max_per_booking < available;
  const showCapWarning = capIsBindingConstraint && selectedQty >= effectiveMax && effectiveMax > 0;

  return (
    <div
      className={`rounded-lg border-2 px-3.5 py-3 transition-all ${
        selectedQty > 0
          ? 'border-orange-400 bg-orange-50'
          : isSoldOut
          ? 'border-gray-200 bg-gray-50 opacity-60'
          : 'border-gray-200 hover:border-orange-300 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: name + price */}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm truncate mb-0.5">{ticket.name}</h3>
          {ticket.price === 0 ? (
            <span className="text-sm font-bold text-green-600">Free</span>
          ) : (
            <span className="text-sm font-bold text-orange-600">
              KES {ticket.price.toLocaleString()}
            </span>
          )}
          {isLowStock && (
            <span className="ml-2 text-[11px] font-medium text-orange-500">
              {available} left
            </span>
          )}
        </div>

        {/* Right: Sold Out pill takes the exact slot the stepper would
            occupy, rather than a small badge next to the name — same
            pattern the reference sites use, and impossible to miss. */}
        {isSoldOut ? (
          <span className="flex-shrink-0 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg uppercase tracking-wide border border-red-100">
            Sold Out
          </span>
        ) : (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onChange(ticket.id, Math.max(0, selectedQty - 1))}
              disabled={selectedQty === 0}
              className="w-7 h-7 rounded-md border-2 border-orange-400 text-orange-600 font-bold text-sm hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              −
            </button>
            <span className="w-5 text-center font-bold text-gray-800 text-sm">{selectedQty}</span>
            <button
              onClick={() => onChange(ticket.id, Math.min(effectiveMax, selectedQty + 1))}
              disabled={selectedQty >= effectiveMax}
              className="w-7 h-7 rounded-md border-2 border-orange-500 bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Description — single line, only if provided. Truncates rather
          than wraps so a verbose organizer entry can't blow out row height
          in the sidebar. */}
      {ticket.description && !isSoldOut && (
        <p className="text-xs text-gray-400 truncate mt-1">{ticket.description}</p>
      )}

      {showCapWarning && (
        <p className="text-[11px] text-orange-500 font-medium mt-1">
          Only {ticket.max_per_booking} allowed per booking for this ticket type
        </p>
      )}
    </div>
  );
};

export default TicketRow;