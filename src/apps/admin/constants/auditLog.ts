// src/apps/admin/constants/auditLog.ts
//
// Single source of truth for audit-log action/target filter options.
// Reconciled directly against every log_admin_action_service(action=...,
// target_type=...) call site across the admin backend routers, as of this
// file's creation. Do NOT hand-maintain a second copy of this list
// anywhere in the frontend — both the "My Activity" and "All Activity"
// tabs on AuditLogs.tsx import from here.
//
// If you add a new audit action in a backend router, add it here in the
// same change. See app/services/audit_log_services.py for the write-side
// contract (log_admin_action_service).

export interface AuditFilterOption {
  value: string;
  label: string;
}

export const ACTION_OPTIONS: AuditFilterOption[] = [
  { value: '', label: 'All Actions' },

  // user — user_admin.py
  { value: 'update_user_email',                  label: 'Email Updated' },
  { value: 'delete_user',                        label: 'User Deleted' },
  { value: 'activate_user',                      label: 'User Activated' },
  { value: 'deactivate_user',                    label: 'User Deactivated' },
  { value: 'verify_user_email',                  label: 'Email Verified' },
  { value: 'unverify_user_email',                label: 'Email Unverified' },
  { value: 'resend_verification_email',          label: 'Verification Resent' },
  { value: 'update_user_role',                   label: 'Role Updated' },

  // event — event_admin.py
  { value: 'create_event',                       label: 'Event Created' },
  { value: 'approve_event',                      label: 'Event Approved' },
  { value: 'reject_event',                       label: 'Event Rejected' },
  { value: 'update_event_status',                label: 'Event Status Updated' },
  { value: 'confirm_event_deletion_ready',       label: 'Event Deletion Confirmed' },
  { value: 'delete_event',                       label: 'Event Deleted' },

  // booking — booking_admin.py
  { value: 'update_booking',                     label: 'Booking Updated' },
  { value: 'update_booking_status',              label: 'Booking Status Updated' },
  { value: 'delete_booking',                     label: 'Booking Deleted' },

  // order — order_admin.py
  { value: 'delete_order',                       label: 'Order Deleted' },

  // payment — payment_admin.py
  { value: 'update_payment_status',              label: 'Payment Status Updated' },
  { value: 'delete_payment',                     label: 'Payment Deleted' },
  { value: 'manual_payment_approved',            label: 'Manual Payment Approved' },
  { value: 'manual_payment_rejected',            label: 'Manual Payment Rejected' },

  // ticket_type — ticket_type_admin.py
  { value: 'create_ticket_type',                 label: 'Ticket Type Created' },
  { value: 'update_ticket_type',                 label: 'Ticket Type Updated' },
  { value: 'suspend_ticket_type',                label: 'Ticket Type Suspended' },
  { value: 'unsuspend_ticket_type',              label: 'Ticket Type Unsuspended' },
  { value: 'delete_ticket_type',                 label: 'Ticket Type Deleted' },

  // ticket_instance — ticket_instance_admin.py
  { value: 'create_ticket_instance',             label: 'Ticket Instance Created' },
  { value: 'update_ticket_instance',             label: 'Ticket Instance Updated' },
  { value: 'delete_ticket_instance',             label: 'Ticket Instance Deleted' },

  // contact_message — contact_messages_admin.py
  { value: 'update_contact_message',             label: 'Message Updated' },
  { value: 'contact_message_status_updated',     label: 'Message Status Updated' },
  { value: 'delete_contact_message',             label: 'Message Deleted' },

  // co_organizer — co_organizer_admin.py
  { value: 'create_co_organizer',                label: 'Co-organizer Added' },
  { value: 'update_create_co_organizer_status',  label: 'Co-organizer Privilege Updated' },
  { value: 'delete_co_organizer',                label: 'Co-organizer Removed' },

  // notification — notification_admin.py
  { value: 'mark_notification_read',             label: 'Notification Marked Read' },
  { value: 'mark_all_notifications_read',        label: 'All Notifications Marked Read' },
  { value: 'dismiss_notification',               label: 'Notification Dismissed' },
  { value: 'clear_read_notifications',           label: 'Read Notifications Cleared' },
  { value: 'cleanup_expired_notifications',      label: 'Expired Notifications Cleaned' },

  // platform_settings / notification_prefs — settings_admin.py
  { value: 'update_platform_settings',           label: 'Platform Settings Updated' },
  { value: 'update_notification_prefs',          label: 'Notification Prefs Updated' },

  // session — session_admin.py, auth_admin.py
  { value: 'revoke_session',                     label: 'Session Revoked' },
  { value: 'revoke_all_other_sessions',          label: 'All Other Sessions Revoked' },
  { value: 'manual_cleanup_sessions',            label: 'Sessions Cleaned Up' },
];

export const TARGET_OPTIONS: AuditFilterOption[] = [
  { value: '',                    label: 'All Targets' },
  { value: 'user',                label: 'User' },
  { value: 'event',               label: 'Event' },
  { value: 'booking',             label: 'Booking' },
  { value: 'order',               label: 'Order' },
  { value: 'payment',             label: 'Payment' },
  { value: 'ticket_type',         label: 'Ticket Type' },
  { value: 'ticket_instance',     label: 'Ticket Instance' },
  { value: 'contact_message',     label: 'Contact Message' },
  { value: 'co_organizer',        label: 'Co-organizer' },
  { value: 'notification',        label: 'Notification' },
  { value: 'platform_settings',   label: 'Platform Settings' },
  { value: 'notification_prefs',  label: 'Notification Prefs' },
  { value: 'session',             label: 'Session' },
];

/**
 * Turns an action key into a display label. Falls back to a generic
 * snake_case -> Title Case conversion for any action not yet added to
 * ACTION_OPTIONS above, so unknown/older values still render readably
 * instead of being hidden or throwing.
 */
export const formatAuditAction = (action: string): string => {
  const known = ACTION_OPTIONS.find(o => o.value === action);
  if (known) return known.label;
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};