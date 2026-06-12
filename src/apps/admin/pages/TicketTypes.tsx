// src/apps/admin/pages/TicketTypes.tsx
import { useEffect, useState, useMemo } from 'react';
import { Tag, Download, X } from 'lucide-react';
import {
  FilterBar, SectionCard, Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import { admin_getEventTicketTypes } from '@shared/api/user/ticketTypesApi';
import { formatKES } from '@admin/utils/format';
import { listAllEvents } from '@admin/services/adminService';
import type { AdminTicketType, AdminEvent } from '@admin/types';

const PAGE_SIZE = 15;

const TicketTypes: React.FC = () => {
  const [tickets, setTickets]     = useState<AdminTicketType[]>([]);
  const [events, setEvents]       = useState<AdminEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [eventFilter, setEvent]   = useState('all');
  const [activeFilter, setActive] = useState('all');
  const [page, setPage]           = useState(1);
  const [detail, setDetail]       = useState<AdminTicketType | null>(null);

  useEffect(() => {
    // Load events list first, then load ticket types for each event
    listAllEvents()
      .then(async evts => {
        setEvents(evts);
        // Load ticket types for all events in parallel
        const allTickets = await Promise.all(
          evts.map(e => admin_getEventTicketTypes(e.id).catch(() => []))
        );
        setTickets(allTickets.flat() as AdminTicketType[]);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load ticket types.');
        setLoading(false);
      });
  }, []);

  const eventOptions = useMemo(() =>
    events.map(e => ({ id: e.id, title: e.title })),
    [events],
  );

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const eventTitle = events.find(e => e.id === t.event_id)?.title ?? '';
      if (search && !`${t.name} ${eventTitle}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (eventFilter !== 'all' && String(t.event_id) !== eventFilter) return false;
      if (activeFilter === 'active' && !t.is_active) return false;
      if (activeFilter === 'inactive' && t.is_active) return false;
      return true;
    });
  }, [tickets, events, search, eventFilter, activeFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => ({
    totalSold:    tickets.reduce((s, t) => s + t.quantity_sold, 0),
    totalRevenue: tickets.reduce((s, t) => s + t.price * t.quantity_sold, 0),
    avgFillRate:  tickets.length
      ? Math.round(tickets.reduce((s, t) => s + (t.quantity_sold / t.total_quantity) * 100, 0) / tickets.length)
      : 0,
  }), [tickets]);

  const exportCSV = () => {
    const rows = [
      ['ID', 'Event', 'Name', 'Price', 'Total Qty', 'Sold', 'Available', 'Active'],
      ...filtered.map(t => [
        t.id,
        events.find(e => e.id === t.event_id)?.title ?? t.event_id,
        t.name, t.price, t.total_quantity, t.quantity_sold,
        t.quantity_available, t.is_active,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'ticket-types.csv';
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ticket Types</h1>
          <p className="page-subtitle">{tickets.length} ticket types across {events.length} events</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-3 gap-4 stagger">
        <div className="card-sm text-center overflow-hidden">
          <p className="text-xs text-gray-500 mb-1">Total Sold</p>
          <p className="text-xl font-bold text-purple-700 leading-tight">{totals.totalSold.toLocaleString()}</p>
        </div>
        <div className="card-sm text-center overflow-hidden">
          <p className="text-xs text-gray-500 mb-1">Revenue</p>
          <p className="text-sm font-bold text-emerald-600 leading-tight break-all">{formatKES(totals.totalRevenue)}</p>
        </div>
        <div className="card-sm text-center overflow-hidden">
          <p className="text-xs text-gray-500 mb-1">Avg. Fill</p>
          <p className="text-xl font-bold text-blue-600 leading-tight">{totals.avgFillRate}%</p>
        </div>
      </div>

      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search ticket type or event…"
        filters={
          <>
            <select value={eventFilter} onChange={e => { setEvent(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[180px]">
              <option value="all">All Events</option>
              {eventOptions.map(e => (
                <option key={e.id} value={String(e.id)}>{e.title}</option>
              ))}
            </select>
            <select value={activeFilter} onChange={e => { setActive(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[130px]">
              <option value="all">All Types</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </>
        }
      />

      <SectionCard title="Ticket Types" subtitle={`${filtered.length} results`} noPadding>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={7} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={Tag} title="No ticket types found" />
        ) : (
          <>
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Event</th><th>Price</th>
                    <th>Capacity</th><th>Sold</th><th>Fill Rate</th><th>Status</th><th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(t => {
                    const event = events.find(e => e.id === t.event_id);
                    const fillRate = Math.round((t.quantity_sold / t.total_quantity) * 100);
                    return (
                      <tr key={t.id}>
                        <td className="text-gray-400 text-xs">#{t.id}</td>
                        <td>
                          <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                          {t.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[160px]">{t.description}</p>
                          )}
                        </td>
                        <td className="text-sm text-gray-700 max-w-[180px]">
                          <p className="truncate">{event?.title ?? `Event #${t.event_id}`}</p>
                        </td>
                        <td className="font-semibold text-emerald-700 whitespace-nowrap">{formatKES(t.price)}</td>
                        <td className="text-sm text-gray-700">{t.total_quantity.toLocaleString()}</td>
                        <td className="text-sm font-semibold text-gray-900">{t.quantity_sold.toLocaleString()}</td>
                        <td>
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${fillRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 w-8">{fillRate}%</span>
                          </div>
                        </td>
                        <td>
                          {t.is_active
                            ? <span className="badge-success">Active</span>
                            : <span className="badge-gray">Inactive</span>}
                        </td>
                        <td>
                          <button onClick={() => setDetail(t)}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(t => {
                const event = events.find(e => e.id === t.event_id);
                const fillRate = Math.round((t.quantity_sold / t.total_quantity) * 100);
                return (
                  <div key={t.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {event?.title ?? `Event #${t.event_id}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {t.is_active ? <span className="badge-success">Active</span> : <span className="badge-gray">Inactive</span>}
                        <button onClick={() => setDetail(t)}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap">
                          View →
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-emerald-700 text-sm">{formatKES(t.price)}</span>
                      <span className="text-xs text-gray-500">{t.quantity_sold} / {t.total_quantity} sold</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${fillRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8 flex-shrink-0">{fillRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              page={page}
              totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
              total={filtered.length}
              limit={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </SectionCard>

      {detail && (
        <TicketDetailModal
          ticket={detail}
          eventTitle={events.find(e => e.id === detail.event_id)?.title}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
};

const TicketDetailModal: React.FC<{
  ticket: AdminTicketType;
  eventTitle?: string;
  onClose: () => void;
}> = ({ ticket, eventTitle, onClose }) => {
  const fillRate  = Math.round((ticket.quantity_sold / ticket.total_quantity) * 100);
  const remaining = ticket.quantity_available;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{ticket.name}</h3>
              <p className="text-sm text-gray-500">{eventTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 mb-5 text-center">
          <p className="text-xs text-gray-500 mb-1">Ticket Price</p>
          <p className="text-3xl font-bold text-purple-700">{formatKES(ticket.price)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {([
            ['Ticket Type ID', `#${ticket.id}`],
            ['Event ID', `#${ticket.event_id}`],
            ['Total Capacity', ticket.total_quantity.toLocaleString()],
            ['Tickets Sold', ticket.quantity_sold.toLocaleString()],
            ['Remaining', remaining.toLocaleString()],
            ['Fill Rate', `${fillRate}%`],
            ['Status', ticket.is_active ? 'Active' : 'Inactive'],
            ['Revenue', formatKES(ticket.price * ticket.quantity_sold)],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5">
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
          <p className="text-xs text-gray-400 mt-1">
            {remaining} tickets remaining of {ticket.total_quantity} total
          </p>
        </div>

        <button onClick={onClose} className="btn-secondary w-full">Close</button>
      </div>
    </div>
  );
};

export default TicketTypes;