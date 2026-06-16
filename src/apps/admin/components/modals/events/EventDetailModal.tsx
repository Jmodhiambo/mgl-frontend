// src/apps/admin/components/modals/events/EventDetailModal.tsx
import { useState, useEffect } from 'react';
import { X, MapPin, Tag, Plus, ImageOff, Users, DollarSign, Loader2 } from 'lucide-react';
import { getTicketTypesByEvent } from '@admin/services/adminService';
import { formatDateTime, formatKES } from '@admin/utils/format';
import type { AdminEvent, AdminTicketType } from '@admin/types';

interface Props {
  event: AdminEvent & { flyer_url?: string };
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onAddTicketTypes: () => void;
}

const EventDetailModal: React.FC<Props> = ({
  event, onClose, onApprove, onReject, onAddTicketTypes,
}) => {
  const [imgError, setImgError]         = useState(false);
  const [ticketTypes, setTicketTypes]   = useState<AdminTicketType[]>([]);
  const [ticketsLoading, setTkLoading]  = useState(true);
  const [ticketsError, setTicketsError] = useState(false);

  const flyerUrl = (event as any).flyer_url as string | undefined;

  useEffect(() => {
    setTkLoading(true);
    setTicketsError(false);
    getTicketTypesByEvent(event.id)
      .then(data => { setTicketTypes(data); setTkLoading(false); })
      .catch(() => { setTicketsError(true); setTkLoading(false); });
  }, [event.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Flyer */}
        <div className="relative w-full h-56 bg-gray-100 flex-shrink-0 rounded-t-2xl overflow-hidden">
          {flyerUrl && !imgError ? (
            <img
              src={flyerUrl}
              alt={`${event.title} flyer`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <ImageOff className="w-10 h-10" />
              <p className="text-sm">No flyer uploaded</p>
            </div>
          )}
          <div className="absolute top-3 left-3">
            {event.is_approved
              ? <span className="badge-success shadow-sm">Approved</span>
              : <span className="badge-warning shadow-sm">Pending Approval</span>}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Title + venue */}
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {event.venue}, {event.city}, {event.country}
            </p>
          </div>

          {event.description && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                {event.description}
              </p>
            </div>
          )}

          {/* Event details grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
            {([
              ['Event ID',       `#${event.id}`],
              ['Category',       event.category],
              ['Status',         event.status],
              ['Organizer',      event.organizer_name ?? 'N/A'],
              ['Start',          formatDateTime(event.start_time)],
              ['End',            formatDateTime(event.end_time)],
              ['Total Bookings', String(event.total_bookings ?? 0)],
              ['Total Revenue',  event.total_revenue ? `KES ${event.total_revenue.toLocaleString()}` : 'N/A'],
              ['Created',        formatDateTime(event.created_at)],
              ['Last Updated',   formatDateTime(event.updated_at)],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Ticket Types section */}
          <div className="border-t border-gray-100 pt-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-500" /> Ticket Types
              </p>
              <button
                onClick={onAddTicketTypes}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {ticketsLoading ? (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading ticket types…</span>
              </div>
            ) : ticketsError ? (
              <p className="text-sm text-red-500 text-center py-4">Failed to load ticket types.</p>
            ) : ticketTypes.length === 0 ? (
              <div className="text-center py-5 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Tag className="w-7 h-7 mx-auto mb-1.5 opacity-40" />
                <p className="text-sm text-gray-500">No ticket types yet</p>
                <button
                  onClick={onAddTicketTypes}
                  className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Add ticket types →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {ticketTypes.map(t => {
                  const fillRate = Math.round((t.quantity_sold / t.total_quantity) * 100);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                          {!t.is_active && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full flex-shrink-0">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${fillRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 w-16 text-right">
                            {t.quantity_sold}/{t.total_quantity} sold
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-emerald-700">{formatKES(t.price)}</p>
                        <p className="text-xs text-gray-400">{fillRate}% full</p>
                      </div>
                    </div>
                  );
                })}

                {/* Summary row */}
                <div className="flex items-center justify-between pt-2 px-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {ticketTypes.reduce((s, t) => s + t.total_quantity, 0).toLocaleString()} total capacity
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {formatKES(ticketTypes.reduce((s, t) => s + t.price * t.quantity_sold, 0))} earned
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 sm:flex-row">
            <button onClick={onClose} className="btn-secondary flex-1 order-last sm:order-first">
              Close
            </button>
            <button
              onClick={onAddTicketTypes}
              className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <Tag className="w-4 h-4" /> Add Ticket Types
            </button>
            {!event.is_approved ? (
              <>
                <button onClick={onReject} className="btn-danger flex-1">Reject</button>
                <button onClick={onApprove} className="btn-primary flex-1">Approve</button>
              </>
            ) : (
              <button onClick={onReject} className="btn-danger flex-1">Revoke Approval</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;