// src/apps/organizer/utils/emailTemplates.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared between BookingsView.tsx (single-recipient email) and
// BulkEmailPage.tsx (bulk email) — one set of starting-draft templates and
// token-substitution helpers so the two pages can't drift out of sync with
// each other the way BookingsView and the backend once did.
// ─────────────────────────────────────────────────────────────────────────────

import { formatDate } from '@shared/utils/format';

export interface EmailTemplateExtraField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  extraFields?: EmailTemplateExtraField[];
}

// Minimal shape bookingReplacements needs — both BookingsView's Booking
// interface and BulkEmailPage's booking rows satisfy this structurally.
export interface BookingLike {
  id: number;
  order_id?: number;
  customer_name?: string;
  event_title?: string;
  ticket_type_name?: string;
  quantity: number;
  total_price: number;
  venue?: string;
  event_date?: string;
}

// ── Email templates ────────────────────────────────────────────────────────────
// These subject/body strings are STARTING DRAFTS ONLY — purely client-side
// prefill text to save organizers from a blank textbox. They are not
// authoritative and are not rendered by the backend. Once a template is
// selected, subject and message are fully editable, and whatever the
// organizer ends up with is exactly what gets sent — the backend renders it
// through the same branded wrapper the live preview in EmailModal uses, so
// there's no separate "real" copy living on the server that could drift
// from what's shown here.

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'organizer.reminder',
    name: 'Event Reminder',
    subject: 'Reminder: {{event_title}} is Coming Up!',
    body: `Dear {{customer_name}},
 
This is a friendly reminder that {{event_title}} is coming up soon!
 
Event Details:
- Venue: {{venue}}
- Date & Time: {{event_date}}
- Ticket Type: {{ticket_type}}
- Quantity: {{quantity}} ticket(s)
- Order: #{{order_id}}
 
Please arrive 30 minutes before the event starts and bring a valid ID.
 
We look forward to seeing you!
 
Best regards,
{{organizer_name}}`,
  },
  {
    id: 'organizer.update',
    name: 'Event Update',
    subject: 'Important Update: {{event_title}}',
    body: `Dear {{customer_name}},
 
We have an important update regarding {{event_title}}.
 
{{update_message}}
 
Your Booking:
- Ticket Type: {{ticket_type}}
- Quantity: {{quantity}} ticket(s)
- Order: #{{order_id}}
 
If you have any questions, please contact us immediately.
 
Best regards,
{{organizer_name}}`,
    extraFields: [
      { key: 'update_message', label: 'Update Details', placeholder: 'Describe what has changed...', type: 'textarea' },
    ],
  },
  {
    id: 'organizer.thank_you',
    name: 'Thank You',
    subject: 'Thank You for Attending {{event_title}}!',
    body: `Dear {{customer_name}},
 
Thank you so much for attending {{event_title}}! We hope you had a wonderful experience.
 
We'd love to hear your feedback — what did you enjoy most, and what could we improve?
 
We look forward to seeing you at our future events!
 
Warm regards,
{{organizer_name}}`,
  },
  {
    id: 'organizer.cancellation',
    name: 'Event Cancellation',
    subject: 'Important: {{event_title}} Has Been Cancelled',
    body: `Dear {{customer_name}},
 
We regret to inform you that {{event_title}} has been cancelled.
 
Reason: {{cancellation_reason}}
 
Your Booking:
- Ticket Type: {{ticket_type}}
- Quantity: {{quantity}} ticket(s)
- Amount Paid: KES {{total_price}}
- Order: #{{order_id}}
 
A full refund will be processed within 5–7 business days to your original payment method.
 
We sincerely apologise for any inconvenience caused.
 
Best regards,
{{organizer_name}}`,
    extraFields: [
      { key: 'cancellation_reason', label: 'Reason for Cancellation', placeholder: 'Explain why the event is being cancelled...', type: 'textarea' },
    ],
  },
  {
    id: 'organizer.venue_change',
    name: 'Venue Change',
    subject: 'Venue Change: {{event_title}}',
    body: `Dear {{customer_name}},
 
Important notice: The venue for {{event_title}} has been changed.
 
Previous Venue: {{old_venue}}
New Venue: {{new_venue}}
 
Date & Time: {{event_date}} (UNCHANGED)
Ticket Type: {{ticket_type}}
Quantity: {{quantity}} ticket(s)
Order: #{{order_id}}
 
Your booking is still valid for the new venue.
 
Best regards,
{{organizer_name}}`,
    extraFields: [
      { key: 'old_venue', label: 'Previous Venue', placeholder: 'e.g. Uhuru Gardens', type: 'text' },
      { key: 'new_venue', label: 'New Venue',      placeholder: 'e.g. KICC Grounds',  type: 'text' },
    ],
  },
  {
    id: 'organizer.time_change',
    name: 'Time Change',
    subject: 'Time Change: {{event_title}}',
    body: `Dear {{customer_name}},
 
Important notice: The date/time for {{event_title}} has been changed.
 
Previous Date/Time: {{old_date_time}}
New Date/Time: {{new_date_time}}
 
Venue: {{venue}} (UNCHANGED)
Ticket Type: {{ticket_type}}
Quantity: {{quantity}} ticket(s)
Order: #{{order_id}}
 
Best regards,
{{organizer_name}}`,
    extraFields: [
      { key: 'old_date_time', label: 'Previous Date & Time', placeholder: 'e.g. July 15, 2025 at 7:00 PM', type: 'text' },
      { key: 'new_date_time', label: 'New Date & Time',      placeholder: 'e.g. July 22, 2025 at 7:00 PM', type: 'text' },
    ],
  },
  { id: 'custom', name: 'Custom Message', subject: '', body: '' },
];

export const bookingReplacements = (ref: BookingLike | null, orgName: string): Record<string, string> => ({
  customer_name:  ref?.customer_name        ?? '',
  event_title:    ref?.event_title          ?? '',
  ticket_type:    ref?.ticket_type_name     ?? '',
  quantity:       ref?.quantity?.toString() ?? '',
  order_id:       ref?.order_id?.toString() ?? ref?.id?.toString() ?? '',
  total_price:    ref?.total_price?.toLocaleString() ?? '',
  venue:          ref?.venue                ?? '',
  event_date:     ref?.event_date ? formatDate(ref.event_date) : '',
  organizer_name: orgName,
});

export const fillTokens = (text: string, rep: Record<string, string>): string =>
  text.replace(/\{\{(\w+)\}\}/g, (m, k) => k in rep ? rep[k] : m);