// src/shared/api/organizer/orgEmailsApi.ts
// API functions for organizer email operations.

import api from '@shared/api/axiosConfig';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SendEmailRequest {
  booking_ids: number[];
  template_used: string;
  subject?: string;
  custom_message?: string;
  extra_variables?: Record<string, string>;
}

export interface SendEmailResponse {
  total_recipients: number;
  queued: number;
  failed: number;
  email_id?: number;
  message: string;
}

export interface OrganizerEmailRecipientOut {
  id: number;
  email_id: number;
  booking_id: number;
  recipient_name: string;
  recipient_email: string;
  status: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizerEmailOut {
  id: number;
  organizer_id: number;
  event_id?: number;
  recipient_type: string;
  recipient_count: number;
  subject: string;
  message: string;
  template_used: string;
  status: string;
  sent_at?: string;
  failed_count: number;
  success_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailDetailWithRecipients extends OrganizerEmailOut {
  booking_ids?: number[];
  recipient_emails?: string[];
  recipients: OrganizerEmailRecipientOut[];
}

export interface EmailHistoryResponse {
  total: number;
  limit: number;
  offset: number;
  emails: OrganizerEmailOut[];
}

export interface EmailStatsResponse {
  total_sent: number;
  total_recipients: number;
  success_rate: number;
  emails_this_month: number;
  recipients_this_month: number;
  by_template: Record<string, number>;
  by_status: Record<string, number>;
}

// ── Send ──────────────────────────────────────────────────────────────────────

export const sendOrganizerEmail = async (
  data: SendEmailRequest,
): Promise<SendEmailResponse> => {
  return (await api.post('/organizers/me/emails/send', data)).data;
};

// ── History ───────────────────────────────────────────────────────────────────

export const getOrganizerEmailHistory = async (params?: {
  event_id?: number;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<EmailHistoryResponse> => {
  return (await api.get('/organizers/me/emails', { params })).data;
};

export const getOrganizerEmailDetails = async (
  emailId: number,
): Promise<EmailDetailWithRecipients> => {
  return (await api.get(`/organizers/me/emails/${emailId}`)).data;
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export const getOrganizerEmailStats = async (): Promise<EmailStatsResponse> => {
  return (await api.get('/organizers/me/emails/stats')).data;
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteOrganizerEmail = async (emailId: number): Promise<void> => {
  await api.delete(`/organizers/me/emails/${emailId}`);
};