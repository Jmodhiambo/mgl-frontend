// src/apps/admin/components/modals/ticketTypes/EventPickerModal.tsx
import { useState, useMemo } from 'react';
import { X, Search, Calendar, Tag } from 'lucide-react';
import type { AdminEvent } from '@admin/types';

interface Props {
  events: AdminEvent[];
  onSelect: (event: AdminEvent) => void;
  onClose: () => void;
}

const EventPickerModal: React.FC<Props> = ({ events, onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    events.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.organizer_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase()),
    ),
    [events, search],
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Select an Event</h3>
            <p className="text-sm text-gray-500 mt-0.5">Choose which event to add ticket types to</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events…"
            className="input-field pl-9 w-full"
            autoFocus
          />
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No events match your search</p>
            </div>
          ) : (
            filtered.map(event => (
              <button
                key={event.id}
                onClick={() => onSelect(event)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
              >
                {(event as any).flyer_url ? (
                  <img
                    src={(event as any).flyer_url}
                    alt={event.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-purple-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {event.organizer_name ?? 'Unknown organizer'} · {event.city}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  event.is_approved
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {event.is_approved ? 'Approved' : 'Pending'}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary w-full">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EventPickerModal;