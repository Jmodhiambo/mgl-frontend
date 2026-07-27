// src/user/components/modals/events/TicketRow.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Ticket-type selector row with a quantity stepper. Previously duplicated
// verbatim in:
//   - user/pages/EventDetails.tsx        (public event page)
//   - user/pages/BrowseEventDetails.tsx  (authenticated event page)
// Both now import this single component instead.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import type { TicketTypeOut } from '@shared/types/Event';

interface TicketRowProps {
  ticket: TicketTypeOut;
  selectedQty: number;
  onChange: (id: number, qty: number) => void;
}

const TicketRow: React.FC<TicketRowProps> = ({ ticket, selectedQty, onChange }) => {
  const available  = ticket.quantity_available;
  const isLowStock = available <= 10 && available > 0;
  const isSoldOut  = available <= 0;
  // The buyer can never take more than what's in stock, and never more
  // than this ticket type's per-booking cap — whichever is smaller wins.
  const effectiveMax = Math.min(available, ticket.max_per_booking);
  const capIsBindingConstraint = ticket.max_per_booking < available;

  return (
    <div
      className={`rounded-xl border-2 p-5 transition-all ${
        selectedQty > 0
          ? 'border-orange-400 bg-orange-50'
          : isSoldOut
          ? 'border-gray-200 bg-gray-50 opacity-60'
          : 'border-gray-200 hover:border-orange-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: name + description + stock */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base">{ticket.name}</h3>
            {isLowStock && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                Only {available} left!
              </span>
            )}
            {isSoldOut && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                Sold Out
              </span>
            )}
          </div>
          {ticket.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-2">{ticket.description}</p>
          )}
          {!isSoldOut && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {available} tickets remaining
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Max {ticket.max_per_booking} per booking
              </p>
            </div>
          )}
        </div>

        {/* Right: price + stepper */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {ticket.price === 0 ? (
            <span className="text-xl font-bold text-green-600">Free</span>
          ) : (
            <span className="text-xl font-bold text-orange-600">
              KES {ticket.price.toLocaleString()}
            </span>
          )}
          {!isSoldOut && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onChange(ticket.id, Math.max(0, selectedQty - 1))}
                  disabled={selectedQty === 0}
                  className="w-8 h-8 rounded-lg border-2 border-orange-400 text-orange-600 font-bold text-sm hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-gray-800">{selectedQty}</span>
                <button
                  onClick={() => onChange(ticket.id, Math.min(effectiveMax, selectedQty + 1))}
                  disabled={selectedQty >= effectiveMax}
                  className="w-8 h-8 rounded-lg border-2 border-orange-500 bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  +
                </button>
              </div>
              {capIsBindingConstraint && selectedQty >= effectiveMax && (
                <span className="text-[11px] text-orange-500 font-medium">Booking limit reached</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketRow;