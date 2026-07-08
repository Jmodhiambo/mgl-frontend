// src/apps/admin/pages/TicketTypes.tsx
import { useEffect, useState, useMemo } from 'react';
import { Tag, Download, Plus } from 'lucide-react';
import {
  FilterBar, SectionCard, Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import { admin_getEventTicketTypes } from '@shared/api/user/ticketTypesApi';
import { formatKES } from '@admin/utils/format';
import { listAllEvents, deleteTicketType, suspendTicketType, unsuspendTicketType } from '@admin/services/adminService';
import type { AdminTicketType, AdminEvent } from '@admin/types';

import CreateTicketTypesModal, { type SavedTicketType } from '@admin/components/modals/ticketTypes/CreateTicketTypesModal';
import EventPickerModal   from '@admin/components/modals/ticketTypes/EventPickerModal';
import EditTicketTypeModal from '@admin/components/modals/ticketTypes/EditTicketTypeModal';
import TicketDetailModal  from '@admin/components/modals/ticketTypes/TicketDetailModal';
import SuspendTicketTypeModal from '@admin/components/modals/ticketTypes/SuspendTicketTypeModal';
import TicketActionsMenu  from '@admin/components/menus/ticketTypes/TicketActionsMenu';

const PAGE_SIZE = 15;

const TicketTypes: React.FC = () => {
  const [tickets, setTickets]     = useState<AdminTicketType[]>([]);
  const [events, setEvents]       = useState<AdminEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [alert, setAlert]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [search, setSearch]       = useState('');
  const [eventFilter, setEvent]   = useState('all');
  const [activeFilter, setActive] = useState('all');
  const [page, setPage]           = useState(1);

  const [detail, setDetail]               = useState<AdminTicketType | null>(null);
  const [editing, setEditing]             = useState<AdminTicketType | null>(null);
  const [suspending, setSuspending]       = useState<AdminTicketType | null>(null);
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    listAllEvents()
      .then(async evts => {
        setEvents(evts);
        const allTickets = await Promise.all(
          evts.map(e => admin_getEventTicketTypes(e.id).catch(() => [])),
        );
        setTickets(allTickets.flat() as AdminTicketType[]);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load ticket types.'); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const eventOptions = useMemo(() => events.map(e => ({ id: e.id, title: e.title })), [events]);

  const filtered = useMemo(() =>
    tickets.filter(t => {
      const eventTitle = events.find(e => e.id === t.event_id)?.title ?? '';
      if (search && !`${t.name} ${eventTitle}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (eventFilter !== 'all' && String(t.event_id) !== eventFilter) return false;
      if (activeFilter === 'active'   && !t.is_active) return false;
      if (activeFilter === 'inactive' &&  t.is_active) return false;
      return true;
    }),
    [tickets, events, search, eventFilter, activeFilter],
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => ({
    totalSold:    tickets.reduce((s, t) => s + t.quantity_sold, 0),
    totalRevenue: tickets.reduce((s, t) => s + t.price * t.quantity_sold, 0),
    avgFillRate:  tickets.length
      ? Math.round(tickets.reduce((s, t) => s + (t.quantity_sold / t.total_quantity) * 100, 0) / tickets.length)
      : 0,
  }), [tickets]);

  const handleCreateFinished = (_event: AdminEvent, ticketTypes: SavedTicketType[]) => {
    setSelectedEvent(null);
    setAlert({
      type: 'success',
      msg: `${ticketTypes.length} ticket ${ticketTypes.length === 1 ? 'type' : 'types'} added to "${_event.title}".`,
    });
    loadData();
  };

  const handleEditSaved = (updated: AdminTicketType) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (detail?.id === updated.id) setDetail(updated);
    setEditing(null);
    setAlert({ type: 'success', msg: `"${updated.name}" updated successfully.` });
  };

  const handleDelete = async (ticket: AdminTicketType) => {
    try {
      await deleteTicketType(ticket.id);
      setTickets(prev => prev.filter(t => t.id !== ticket.id));
      setAlert({ type: 'success', msg: `"${ticket.name}" deleted successfully.` });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Failed to delete ticket type.';
      // 400 means the backend deactivated it instead of deleting (has existing bookings)
      if (err?.response?.status === 400) {
        setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, is_active: false } : t));
      }
      setAlert({ type: 'error', msg });
    }
  };

  const handleSuspendConfirm = async (reason: string) => {
    if (!suspending) return;
    try {
      const updated = await suspendTicketType(suspending.id, reason);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      if (detail?.id === updated.id) setDetail(updated);
      setAlert({ type: 'success', msg: `"${updated.name}" suspended.` });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Failed to suspend ticket type.';
      setAlert({ type: 'error', msg });
    } finally {
      setSuspending(null);
    }
  };

  const handleUnsuspend = async (ticket: AdminTicketType) => {
    try {
      const updated = await unsuspendTicketType(ticket.id);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      if (detail?.id === updated.id) setDetail(updated);
      setAlert({ type: 'success', msg: `Suspension lifted on "${updated.name}". It's still inactive until reactivated.` });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Failed to lift suspension.';
      setAlert({ type: 'error', msg });
    }
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Event', 'Name', 'Price', 'Total Qty', 'Sold', 'Available', 'Active'],
      ...filtered.map(t => [
        t.id,
        events.find(e => e.id === t.event_id)?.title ?? t.event_id,
        t.name, t.price, t.total_quantity, t.quantity_sold, t.quantity_available, t.is_active,
      ]),
    ];
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'));
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
        <div className="flex items-center gap-2">
          <button onClick={() => setPickerOpen(true)} className="btn-primary btn-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Ticket Type</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

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
          <EmptyState
            icon={Tag}
            title="No ticket types found"
            description={search || eventFilter !== 'all' || activeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create a ticket type to get started'
            }
          />
        ) : (
          <>
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Event</th><th>Price</th>
                    <th>Capacity</th><th>Sold</th><th>Fill Rate</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(t => {
                    const event    = events.find(e => e.id === t.event_id);
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
                          {t.suspended_by_admin_id != null
                            ? <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Suspended</span>
                            : t.is_active
                            ? <span className="badge-success">Active</span>
                            : <span className="badge-gray">Inactive</span>}
                        </td>
                        <td>
                          <TicketActionsMenu
                            ticket={t}
                            onView={() => setDetail(t)}
                            onEdit={() => setEditing(t)}
                            onDelete={() => handleDelete(t)}
                            onSuspend={() => setSuspending(t)}
                            onUnsuspend={() => handleUnsuspend(t)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(t => {
                const event    = events.find(e => e.id === t.event_id);
                const fillRate = Math.round((t.quantity_sold / t.total_quantity) * 100);
                return (
                  <div key={t.id} className="p-4 space-y-2 hover:bg-purple-50/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {event?.title ?? `Event #${t.event_id}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {t.suspended_by_admin_id != null
                          ? <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Suspended</span>
                          : t.is_active
                          ? <span className="badge-success">Active</span>
                          : <span className="badge-gray">Inactive</span>}
                        <TicketActionsMenu
                          ticket={t}
                          onView={() => setDetail(t)}
                          onEdit={() => setEditing(t)}
                          onDelete={() => handleDelete(t)}
                          onSuspend={() => setSuspending(t)}
                          onUnsuspend={() => handleUnsuspend(t)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-emerald-700 text-sm">{formatKES(t.price)}</span>
                      <span className="text-xs text-gray-500">{t.quantity_sold} / {t.total_quantity} sold</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            fillRate >= 90 ? 'bg-red-500' : fillRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
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
          event={events.find(e => e.id === detail.event_id)}
          onClose={() => setDetail(null)}
          onEdit={() => { setEditing(detail); setDetail(null); }}
          onSuspend={() => setSuspending(detail)}
          onUnsuspend={() => handleUnsuspend(detail)}
        />
      )}

      {suspending && (
        <SuspendTicketTypeModal
          ticket={suspending}
          onCancel={() => setSuspending(null)}
          onConfirm={handleSuspendConfirm}
        />
      )}

      {editing && (
        <EditTicketTypeModal
          ticket={editing}
          event={events.find(e => e.id === editing.event_id)}
          onClose={() => setEditing(null)}
          onSaved={handleEditSaved}
        />
      )}

      {pickerOpen && (
        <EventPickerModal
          events={events}
          onSelect={e => { setPickerOpen(false); setSelectedEvent(e); }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {selectedEvent && (
        <CreateTicketTypesModal
          event={selectedEvent}
          mode="standalone"
          onClose={() => setSelectedEvent(null)}
          onFinish={handleCreateFinished}
        />
      )}
    </div>
  );
};

export default TicketTypes;