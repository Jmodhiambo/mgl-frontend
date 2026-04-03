// src/apps/organizer/components/BookingViewPage/EmailModal.tsx
import React from 'react';
import { XCircle, Send, Info } from 'lucide-react';
import type { EmailTemplate, EmailTemplateExtraField } from '@organizer/pages/BookingsView';

interface Booking {
  id: number;
  customer_name?: string;
  customer_email?: string;
  event_title?: string;
  ticket_type_name?: string;
  quantity: number;
  total_price?: number;
}

interface EmailModalProps {
  selectedBookings: Booking[];
  emailData: {
    template: string;
    subject: string;
    message: string;
    extraValues: Record<string, string>;
  };
  emailTemplates: EmailTemplate[];
  sendingEmail: boolean;
  onClose: () => void;
  onTemplateChange: (templateId: string) => void;
  onEmailDataChange: (data: Partial<EmailModalProps['emailData']>) => void;
  onSend: () => void;
}

/** User-friendly hints — no backend references */
const TEMPLATE_HINTS: Record<string, string> = {
  'organizer.reminder':     'Sends attendees a pre-event reminder with venue and time details.',
  'organizer.update':       'Broadcasts a general update to attendees. Fill in the update details below.',
  'organizer.thank_you':    'Sends a post-event thank you message to attendees.',
  'organizer.cancellation': 'Notifies attendees the event has been cancelled. Fill in the reason below.',
  'organizer.venue_change': 'Notifies attendees the venue has changed. Fill in the old and new venue below.',
  'organizer.time_change':  'Notifies attendees the event time has changed. Fill in the old and new date/time below.',
};

const EmailModal: React.FC<EmailModalProps> = ({
  selectedBookings,
  emailData,
  emailTemplates,
  sendingEmail,
  onClose,
  onTemplateChange,
  onEmailDataChange,
  onSend,
}) => {
  const isBulk     = selectedBookings.length > 1;
  const activeTpl  = emailTemplates.find(t => t.id === emailData.template);
  const extraFields: EmailTemplateExtraField[] = activeTpl?.extraFields ?? [];
  const hint       = TEMPLATE_HINTS[emailData.template];

  const handleExtraChange = (key: string, value: string) => {
    onEmailDataChange({ extraValues: { ...emailData.extraValues, [key]: value } });
  };

  const canSend =
    !sendingEmail &&
    !!emailData.subject &&
    !!emailData.message &&
    extraFields.every(f => !!emailData.extraValues[f.key]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {isBulk ? 'Send Bulk Email' : 'Send Email'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isBulk
                ? `Sending to ${selectedBookings.length} recipients`
                : `To: ${selectedBookings[0]?.customer_name} (${selectedBookings[0]?.customer_email})`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">

          {/* Template selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
            <select
              value={emailData.template}
              onChange={e => onTemplateChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {emailTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {hint && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-gray-500">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
                {hint}
              </p>
            )}
          </div>

          {/* Extra fields (template-specific) */}
          {extraFields.length > 0 && (
            <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                Fill in before sending
              </p>
              {extraFields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={emailData.extraValues[field.key] ?? ''}
                      onChange={e => handleExtraChange(field.key, e.target.value)}
                      rows={3}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={emailData.extraValues[field.key] ?? ''}
                      onChange={e => handleExtraChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={e => onEmailDataChange({ subject: e.target.value })}
              placeholder="Enter email subject"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Message *</label>
              <span className="text-xs text-gray-400">{emailData.message.length} characters</span>
            </div>
            <textarea
              value={emailData.message}
              onChange={e => onEmailDataChange({ message: e.target.value })}
              rows={12}
              placeholder="Enter your message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">{emailData.message.length} characters</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={!canSend}
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
                Send Email{isBulk ? ` to ${selectedBookings.length}` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;