// src/apps/organizer/components/BookingViewPage/BookingDetailsModal.tsx
import React from 'react';
import { XCircle, Mail } from 'lucide-react';

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

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onSendEmail: () => void;
  getStatusBadge: (status: string) => React.JSX.Element;
  formatDate: (date: string) => string;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  onSendEmail,
  getStatusBadge,
  formatDate
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Booking Details</h3>
            <p className="text-sm text-gray-500 mt-1">Booking ID: #{booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Status</span>
            {getStatusBadge(booking.status)}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Name</p>
              <p className="text-sm font-medium text-gray-800">{booking.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-sm font-medium text-gray-800">{booking.customer_email}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Event & Ticket Details</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Event</p>
              <p className="text-sm font-medium text-gray-800">{booking.event_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ticket Type</p>
              <p className="text-sm font-medium text-gray-800">{booking.ticket_type_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quantity</p>
                <p className="text-sm font-medium text-gray-800">{booking.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Price</p>
                <p className="text-sm font-bold text-green-600">
                  KES {booking.total_price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Booking Timeline</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Booked On</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(booking.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Updated</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(booking.updated_at)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onSendEmail}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;