// src/apps/admin/pages/TicketTypes.tsx
import { useEffect, useState, useMemo } from 'react';
import { Tag, Download, X } from 'lucide-react';
import {
  FilterBar, SectionCard, Pagination, TableSkeleton, EmptyState,
} from '@admin/components/ui';
import { dummyTicketTypes, dummyEvents, formatKES } from '@admin/utils/dummyData';
import type { AdminTicketType } from '@admin/types';

// ─── NOTE: These API calls exist in the backend ───────────────────────────────
// GET  /admin/ticket-types/:id            → tt_services.get_ticket_type_by_id_service
// GET  /admin/events/:event_id/ticket-types → tt_services.list_ticket_types_by_event_id_service
// POST /admin/ticket-types               → tt_services.create_ticket_type_service
// PUT  /admin/ticket-types/:id           → tt_services.update_ticket_type_service
// DELETE /admin/ticket-types/:id         → tt_services.delete_ticket_type_service

const PAGE_SIZE = 15;

const TicketTypes: React.FC = () => {
  const [tickets, setTickets]     = useState<AdminTicketType[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [eventFilter, setEvent]   = useState('all');
  const [activeFilter, setActive] = useState('all');
  const [page, setPage]           = useState(1);
  const [detail, setDetail]       = useState<AdminTicketType | null>(null);

  useEffect(() => {
    // TODO: replace with real API call
    // const data = await listAdminTicketTypes();
    setTimeout(() => { setTickets(dummyTicketTypes); setLoading(false); }, 400);
  }, []);

  const eventOptions = useMemo(() => {
    const ids = [...new Set(tickets.map(t => t.event_id))];
    return ids.map(id => ({ id, title: dummyEvents.find(e => e.id === id)?.title ?? `Event #${id}` }));
  }, [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const eventTitle = dummyEvents.find(e => e.id === t.event_id)?.title ?? '';
      if (search && !`${t.name} ${eventTitle}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (eventFilter !== 'all' && String(t.event_id) !== eventFilter) return false;
      if (activeFilter === 'active' && !t.is_active) return false;
      if (activeFilter === 'inactive' && t.is_active) return false;
      return true;
    });
  }, [tickets, search, eventFilter, activeFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => ({
    totalSold: tickets.reduce((s, t) => s + t.quantity_sold, 0),
    totalRevenue: tickets.reduce((s, t) => s + t.price * t.quantity_sold, 0),
    avgFillRate: tickets.length
      ? Math.round(tickets.reduce((s, t) => s + (t.quantity_sold / t.quantity) * 100, 0) / tickets.length)
      : 0,
  }), [tickets]);

  const exportCSV = () => {
    const rows = [
      ['ID','Event','Name','Price','Qty','Sold','Remaining','Active'],
      ...filtered.map(t => [
        t.id,
        dummyEvents.find(e => e.id === t.event_id)?.title ?? t.event_id,
        t.name, t.price, t.quantity, t.quantity_sold,
        t.quantity - t.quantity_sold, t.is_active,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href='data:text/csv,'+encodeURIComponent(csv); a.download='ticket-types.csv'; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ticket Types</h1>
          <p className="page-subtitle">{tickets.length} ticket types across {dummyEvents.length} events</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 stagger">
        <div className="card-sm text-center">
          <p className="text-xs text-gray-500 mb-1">Total Tickets Sold</p>
          <p className="text-2xl font-bold text-purple-700">{totals.totalSold.toLocaleString()}</p>
        </div>
        <div className="card-sm text-center">
          <p className="text-xs text-gray-500 mb-1">Revenue Generated</p>
          <p className="text-2xl font-bold text-emerald-600">{formatKES(totals.totalRevenue)}</p>
        </div>
        <div className="card-sm text-center">
          <p className="text-xs text-gray-500 mb-1">Avg. Fill Rate</p>
          <p className="text-2xl font-bold text-blue-600">{totals.avgFillRate}%</p>
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
            <div className="table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Event</th>
                    <th>Price</th>
                    <th>Capacity</th>
                    <th>Sold</th>
                    <th>Fill Rate</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(t => {
                    const event = dummyEvents.find(e => e.id === t.event_id);
                    const fillRate = Math.round((t.quantity_sold / t.quantity) * 100);
                    const remaining = t.quantity - t.quantity_sold;
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
                        <td className="font-semibold text-emerald-700 whitespace-nowrap">
                          {formatKES(t.price)}
                        </td>
                        <td className="text-sm text-gray-700">{t.quantity.toLocaleString()}</td>
                        <td className="text-sm font-semibold text-gray-900">{t.quantity_sold.toLocaleString()}</td>
                        <td>
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all
                                  ${fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
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
                          <button
                            onClick={() => setDetail(t)}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} total={filtered.length} limit={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </SectionCard>

      {detail && (
        <TicketDetailModal
          ticket={detail}
          eventTitle={dummyEvents.find(e => e.id === detail.event_id)?.title}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
};

// ─── Ticket Detail Modal ──────────────────────────────────────────────────────
const TicketDetailModal: React.FC<{
  ticket: AdminTicketType;
  eventTitle?: string;
  onClose: () => void;
}> = ({ ticket, eventTitle, onClose }) => {
  const fillRate = Math.round((ticket.quantity_sold / ticket.quantity) * 100);
  const remaining = ticket.quantity - ticket.quantity_sold;

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

        {/* Price highlight */}
        <div className="bg-purple-50 rounded-xl p-4 mb-5 text-center">
          <p className="text-xs text-gray-500 mb-1">Ticket Price</p>
          <p className="text-3xl font-bold text-purple-700">{formatKES(ticket.price)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            ['Ticket Type ID', `#${ticket.id}`],
            ['Event ID', `#${ticket.event_id}`],
            ['Total Capacity', ticket.quantity.toLocaleString()],
            ['Tickets Sold', ticket.quantity_sold.toLocaleString()],
            ['Remaining', remaining.toLocaleString()],
            ['Fill Rate', `${fillRate}%`],
            ['Status', ticket.is_active ? 'Active' : 'Inactive'],
            ['Revenue', formatKES(ticket.price * ticket.quantity_sold)],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Fill rate bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Fill Rate</span><span>{fillRate}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700
                ${fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${fillRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {remaining} tickets remaining of {ticket.quantity} total
          </p>
        </div>

        <button onClick={onClose} className="btn-secondary w-full">Close</button>
      </div>
    </div>
  );
};

export default TicketTypes;