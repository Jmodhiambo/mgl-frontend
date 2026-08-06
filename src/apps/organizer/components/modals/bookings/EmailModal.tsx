// src/apps/organizer/components/BookingViewPage/EmailModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { XCircle, Send, Info, Eye } from 'lucide-react';
import type { EmailTemplate, EmailTemplateExtraField } from '@organizer/utils/emailTemplates';
import { previewOrganizerEmail } from '@shared/api/organizer/orgEmailsApi';

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
  recipientCount: number;
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
  'organizer.reminder':     'Starts you off with a pre-event reminder — edit freely before sending.',
  'organizer.update':       'Starts you off with a general update. Fill in the update details below, then edit as you like.',
  'organizer.thank_you':    'Starts you off with a post-event thank you — edit freely before sending.',
  'organizer.cancellation': 'Starts you off with a cancellation notice. Fill in the reason below, then edit as you like.',
  'organizer.venue_change': 'Starts you off with a venue-change notice. Fill in the old and new venue below, then edit as you like.',
  'organizer.time_change':  'Starts you off with a time-change notice. Fill in the old and new date/time below, then edit as you like.',
};

const EmailModal: React.FC<EmailModalProps> = ({
  selectedBookings,
  recipientCount,
  emailData,
  emailTemplates,
  sendingEmail,
  onClose,
  onTemplateChange,
  onEmailDataChange,
  onSend,
}) => {
  const isBulk     = recipientCount > 1;
  const activeTpl  = emailTemplates.find(t => t.id === emailData.template);
  const extraFields: EmailTemplateExtraField[] = activeTpl?.extraFields ?? [];
  const hint       = TEMPLATE_HINTS[emailData.template];

  // Backend expects 'reminder' not 'organizer.reminder'
  const templateUsed = emailData.template.replace('organizer.', '') || 'custom';
  const referenceBooking = selectedBookings[0];

  const handleExtraChange = (key: string, value: string) => {
    onEmailDataChange({ extraValues: { ...emailData.extraValues, [key]: value } });
  };

  const canSend =
    !sendingEmail &&
    !!emailData.subject &&
    !!emailData.message &&
    extraFields.every(f => !!emailData.extraValues[f.key]);

  // ── Live preview ──────────────────────────────────────────────────────────
  // Renders through the exact same branded-wrapper + token-substitution path
  // the real send uses, so this is never a lookalike — it's what will
  // actually reach the reference recipient, word for word.

  const [previewHtml,    setPreviewHtml]    = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError,   setPreviewError]   = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!referenceBooking || !emailData.subject || !emailData.message) {
      setPreviewHtml('');
      setPreviewError(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const result = await previewOrganizerEmail({
          booking_id: referenceBooking.id,
          template_used: templateUsed,
          subject: emailData.subject,
          body: emailData.message,
          extra_variables: Object.keys(emailData.extraValues).length
            ? emailData.extraValues
            : undefined,
        });
        setPreviewHtml(result.html);
      } catch {
        setPreviewError('Preview unavailable right now — your message is unaffected.');
      } finally {
        setPreviewLoading(false);
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [
    referenceBooking?.id,
    templateUsed,
    emailData.subject,
    emailData.message,
    emailData.extraValues,
  ]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {isBulk ? 'Send Bulk Email' : 'Send Email'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isBulk
                ? `Sending to ${recipientCount} recipients`
                : `To: ${selectedBookings[0]?.customer_name} (${selectedBookings[0]?.customer_email})`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* ── Left: editable form ── */}
          <div className="space-y-4">

            {/* Template selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start From Template</label>
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

            {/* Subject — freely editable for every template */}
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

            {/* Message body — freely editable for every template */}
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
              <p className="text-xs text-gray-400 mt-1">
                {'{{customer_name}}, {{order_id}}, {{ticket_type}}'} and similar tokens are
                replaced with each recipient's own details when sent.
              </p>
            </div>
          </div>

          {/* ── Right: live preview ── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-gray-700">
              <Eye className="w-4 h-4" /> Live Preview
              {previewLoading && <span className="text-xs text-gray-400 ml-2">Updating…</span>}
            </div>
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 min-h-[420px]">
              {previewError ? (
                <div className="p-4 text-sm text-red-600">{previewError}</div>
              ) : previewHtml ? (
                <iframe
                  title="Email preview"
                  srcDoc={previewHtml}
                  sandbox=""
                  className="w-full h-full min-h-[420px] bg-white"
                />
              ) : (
                <div className="p-4 text-sm text-gray-400">
                  Fill in the subject and message to see exactly what attendees will receive.
                </div>
              )}
            </div>
            {referenceBooking && (
              <p className="text-xs text-gray-400 mt-2">
                Shown with {referenceBooking.customer_name ?? 'the first recipient'}'s details
                {isBulk ? ' — each attendee receives their own name, order number, and ticket info.' : '.'}
              </p>
            )}
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
                Send Email{isBulk ? ` to ${recipientCount}` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;