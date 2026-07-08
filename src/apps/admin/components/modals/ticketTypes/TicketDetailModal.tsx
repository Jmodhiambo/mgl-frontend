// src/apps/admin/components/modals/ticketTypes/TicketDetailModal.tsx
import { useState } from 'react';
import { X, Tag, ImageOff, Pencil, Ban, ShieldCheck } from 'lucide-react';
import { formatKES } from '@admin/utils/format';
import type { AdminTicketType, AdminEvent } from '@admin/types';

interface Props {
  ticket: AdminTicketType;
  event?: AdminEvent;
  onClose: () => void;
  onEdit: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
}

const TicketDetailModal: React.FC<Props> = ({ ticket, event, onClose, onEdit, onSuspend, onUnsuspend }) => {
  const fillRate  = Math.round((ticket.quantity_sold / ticket.total_quantity) * 100);
  const remaining = ticket.quantity_available;
  const flyerUrl  = (event as any)?.flyer_url as string | undefined;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Flyer banner */}
        <div className="relative w-full h-40 bg-gray-100 flex-shrink-0 rounded-t-2xl overflow-hidden">
          {flyerUrl && !imgError ? (
            <img
              src={flyerUrl}
              alt={event?.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <ImageOff className="w-8 h-8" />
              <p className="text-xs">No flyer</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{ticket.name}</p>
              <p className="text-white/70 text-xs">{event?.title ?? `Event #${ticket.event_id}`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Price hero */}
          <div className="bg-purple-50 rounded-xl p-4 mb-5 text-center">
            <p className="text-xs text-gray-500 mb-1">Ticket Price</p>
            <p className="text-3xl font-bold text-purple-700">
            {ticket.price === 0 ? 'Free' : formatKES(ticket.price)}
          </p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${
              ticket.suspended_by_admin_id != null
                ? 'bg-red-100 text-red-700'
                : ticket.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {ticket.suspended_by_admin_id != null ? 'Suspended' : ticket.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {ticket.suspended_by_admin_id != null && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-red-700 mb-1">
                Suspended by {ticket.suspended_by_admin_name ?? `admin #${ticket.suspended_by_admin_id}`}
              </p>
              {ticket.suspended_at && (
                <p className="text-xs text-red-500 mb-2">
                  {new Date(ticket.suspended_at).toLocaleString()}
                </p>
              )}
              {ticket.suspension_reason && (
                <p className="text-sm text-red-700 bg-white/60 rounded-lg px-3 py-2">
                  "{ticket.suspension_reason}"
                </p>
              )}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {([
              ['Ticket Type ID', `#${ticket.id}`],
              ['Event ID',       `#${ticket.event_id}`],
              ['Total Capacity', ticket.total_quantity.toLocaleString()],
              ['Tickets Sold',   ticket.quantity_sold.toLocaleString()],
              ['Remaining',      remaining.toLocaleString()],
              ['Fill Rate',      `${fillRate}%`],
              ['Revenue Earned', ticket.price === 0 ? 'Free event' : formatKES(ticket.price * ticket.quantity_sold)],
              ['Max Revenue',    ticket.price === 0 ? 'Free event' : formatKES(ticket.price * ticket.total_quantity)],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {ticket.description && (
            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{ticket.description}</p>
            </div>
          )}

          {/* Fill rate bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Fill Rate</span><span>{fillRate}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${fillRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 mb-4">
              {remaining} tickets remaining of {ticket.total_quantity} total
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-5 border-t border-gray-100">
            <button onClick={onClose} className="btn-secondary flex-1">Close</button>
            {ticket.suspended_by_admin_id != null ? (
              <button
                onClick={onUnsuspend}
                className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" /> Unsuspend
              </button>
            ) : (
              <button
                onClick={onSuspend}
                className="flex-1 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Ban className="w-4 h-4" /> Suspend
              </button>
            )}
            <button
              onClick={onEdit}
              className="btn-primary flex-1 flex items-center justify-center gap-1.5"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;