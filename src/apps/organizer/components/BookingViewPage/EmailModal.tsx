// src/apps/organizer/components/BookingViewPage/EmailModal.tsx
import React from 'react';
import { XCircle, Send, CheckCircle } from 'lucide-react';

interface Booking {
  id: number;
  customer_name?: string;
  customer_email?: string;
  event_title?: string;
  ticket_type_name?: string;
  quantity: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface EmailModalProps {
  selectedBookings: Booking[];
  emailData: {
    template: string;
    subject: string;
    message: string;
  };
  emailTemplates: EmailTemplate[];
  sendingEmail: boolean;
  onClose: () => void;
  onTemplateChange: (templateId: string) => void;
  onEmailDataChange: (data: { subject: string; message: string }) => void;
  onSend: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({
  selectedBookings,
  emailData,
  emailTemplates,
  sendingEmail,
  onClose,
  onTemplateChange,
  onEmailDataChange,
  onSend
}) => {
  const isBulk = selectedBookings.length > 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {isBulk ? 'Send Bulk Email' : 'Send Email'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isBulk 
                ? `Sending to ${selectedBookings.length} recipients`
                : `To: ${selectedBookings[0]?.customer_name} (${selectedBookings[0]?.customer_email})`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Show recipient list for bulk */}
        {isBulk && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Recipients ({selectedBookings.length}):
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedBookings.map(booking => (
                <div key={booking.id} className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="truncate">
                    {booking.customer_name} ({booking.customer_email})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Template
            </label>
            <select
              value={emailData.template}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {emailTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => onEmailDataChange({ ...emailData, subject: e.target.value })}
              placeholder="Enter email subject"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={emailData.message}
              onChange={(e) => onEmailDataChange({ ...emailData, message: e.target.value })}
              rows={12}
              placeholder="Enter your message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {emailData.message.length} characters
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={sendingEmail || !emailData.subject || !emailData.message}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingEmail ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email {isBulk && `to ${selectedBookings.length}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;