// src/apps/organizer/components/modals/bookings/OrdersTable.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Ticket } from 'lucide-react';
import { formatKES } from '@shared/utils/format';
import type { OrganizerOrderOut, OrganizerOrderBookingLine } from '@shared/api/organizer/orgOrderApi';

// Kept local to this file rather than shared via a getStatusBadge prop —
// OrderRow's badges have always used their own inline styling (slightly
// different padding than BookingsTable's shared getStatusBadge), both for
// the row-level badge and the more compact one on expanded line items.
// Preserved as-is during extraction rather than unified, to avoid an
// unintended visual change alongside a refactor.
const statusStyle: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

interface OrdersTableProps {
  orders: OrganizerOrderOut[];
  /** Current page's offset (0-based) — used for the "#" running row number,
   * same convention as BookingsTable's offset prop. */
  offset: number;
  formatDate: (date: string) => string;
}

const OrderRow: React.FC<{ order: OrganizerOrderOut; rowNumber: number; formatDate: (d: string) => string }> = ({
  order,
  rowNumber,
  formatDate,
}) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <td className="px-4 py-4 w-8">
          {expanded
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </td>
        <td className="px-4 py-4 text-sm text-gray-500">{rowNumber}</td>
        <td className="px-4 py-4 text-sm font-medium text-gray-800">#{order.id}</td>
        <td className="px-4 py-4">
          <p className="text-sm font-medium text-gray-800">{order.customer_name}</p>
          <p className="text-xs text-gray-500">{order.customer_email}</p>
        </td>
        <td className="px-4 py-4 max-w-[220px]">
          <button
            onClick={e => { e.stopPropagation(); navigate(`/events/${order.event_slug}`); }}
            title={order.event_title}
            className="text-sm text-blue-600 hover:underline font-medium truncate block max-w-full text-left"
          >
            {order.event_title}
          </button>
        </td>
        <td className="px-4 py-4 text-sm text-gray-600">{order.bookings.length} type{order.bookings.length !== 1 ? 's' : ''}</td>
        <td className="px-4 py-4">
          <p className="text-sm font-bold text-gray-800">{formatKES(order.total_price)}</p>
          <p className="text-xs text-green-600">Net: {formatKES(order.organizer_net)}</p>
        </td>
        <td className="px-4 py-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </td>
        <td className="px-4 py-4 text-xs text-gray-500">{formatDate(order.created_at)}</td>
      </tr>

      {/* Expanded booking line items */}
      {expanded && (
        <tr className="bg-blue-50">
          <td colSpan={9} className="px-8 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Booking line items
            </p>
            <div className="space-y-2">
              {order.bookings.map((b: OrganizerOrderBookingLine) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <Ticket className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{b.ticket_type_name}</p>
                      <p className="text-xs text-gray-500">{b.quantity} × ticket</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[b.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                    <span className="text-sm font-bold text-gray-800">{formatKES(b.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Commission breakdown for this order */}
            <div className="mt-3 flex items-center gap-6 text-xs text-gray-500 border-t border-blue-100 pt-3">
              <span>Commission: {order.commission_rate}%</span>
              <span>Platform cut: <span className="text-red-500 font-medium">{formatKES(order.platform_cut)}</span></span>
              <span>Your net: <span className="text-green-600 font-medium">{formatKES(order.organizer_net)}</span></span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, offset, formatDate }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-8 px-4 py-4" />
              {['#', 'Order ID', 'Customer', 'Event', 'Items', 'Total', 'Status', 'Date'].map(h => (
                <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order, index) => (
              <OrderRow
                key={order.id}
                order={order}
                rowNumber={offset + index + 1}
                formatDate={formatDate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;