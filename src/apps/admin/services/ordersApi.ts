// src/apps/admin/services/ordersApi.ts
// Replaces admin_listAllBookings + admin_listAllPayments (Bookings.tsx and
// Payments.tsx are both superseded by Orders.tsx).

import api from '@shared/api/axiosConfig';
import type { AdminOrder } from '@admin/types';

// ── Admin: Orders ──────────────────────────────────────────────────────────

export const admin_listAllOrders = async (): Promise<AdminOrder[]> => {
  return (await api.get('/admin/orders')).data;
};

export const admin_deleteOrder = async (orderId: number): Promise<void> => {
  await api.delete(`/admin/orders/${orderId}`);
};

// ── Admin: manual M-Pesa payment resolution ──────────────────────────────────
//
// Works two ways, both via the same endpoint:
//   - A user already reported a code (order.manual_review_status === 'pending')
//     → approve without retyping the code, or reject to dismiss the report.
//   - Nobody reported anything, but the admin spotted the payment on the
//     M-Pesa till statement themselves → supply mpesaCode directly.
//
// Underlying route lives on the payment, keyed by paymentId (already present
// on every AdminOrder row via order.payment_id).

export interface ResolveMpesaPaymentRequest {
  approve: boolean;
  mpesa_code?: string;
  admin_notes?: string;
}

export const admin_resolveMpesaPayment = async (
  paymentId: number,
  data: ResolveMpesaPaymentRequest,
): Promise<void> => {
  await api.patch(`/admin/payments/${paymentId}/manual-review`, data);
};

// ── Admin: reconciliation sweep (Layer 1) ────────────────────────────────────
// Manually trigger the same Daraja STK-status check the checkout flow uses
// on timeout, across every payment stuck pending. No scheduler wired up yet
// — this is the manual trigger in the meantime.

export interface ReconcileStuckPaymentsResponse {
  checked: number;
  resolved_completed: number;
  resolved_failed: number;
  still_pending: number;
}

export const admin_reconcileStuckPayments = async (
  olderThanMinutes = 5,
): Promise<ReconcileStuckPaymentsResponse> => {
  return (
    await api.post('/admin/payments/reconcile-stuck', null, {
      params: { older_than_minutes: olderThanMinutes },
    })
  ).data;
};