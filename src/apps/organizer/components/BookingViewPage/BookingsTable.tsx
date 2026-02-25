// src/organizer/components/BookingsTable.tsx
import React from 'react';
import { Eye, Mail } from 'lucide-react';

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
}

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
  formatDate
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
                Booking ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
            {bookings.map((booking) => (
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
                  <span className="text-sm font-medium text-gray-800">#{booking.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{booking.customer_name}</div>
                    <div className="text-sm text-gray-500">{booking.customer_email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-800">{booking.ticket_type_name}</span>
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
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onViewBooking(booking)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    {!isBulkMode && (
                      <button 
                        onClick={() => onEmailBooking(booking)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </button>
                    )}
                  </div>
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