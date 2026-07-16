// src/shared/api/user/paymentService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Payment API calls — user and admin scopes.
// Organizer payment access is intentionally absent (see payments_organizer.py).
//
// M-Pesa flow:
//   1. createOrder({ event_id, items })         → OrderOut (status: pending, total_price computed server-side)
//   2. initiateMpesaPayment({ order_id, phone_number })
//                                               → { payment_id, checkout_request_id, message }
//   3. User enters PIN on phone
//   4. Daraja POSTs to /payments/mpesa/callback (handled server-side)
//      → confirms order + all its bookings, issues ticket instances for every line item
//   5. pollPaymentStatus(payment_id)            → PaymentOut (poll until status != 'pending')
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PaymentOut {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  method: string;
  status: string;            // pending | completed | failed | refunded
  mpesa_phone: string | null;
  mpesa_checkout_request_id: string | null;
  mpesa_ref: string | null;  // MpesaReceiptNumber — only present after success callback
  callback_payload: string | null;
  created_at: string;
  updated_at: string;
}

export interface MpesaStkPushRequest {
  order_id: number;           // pays for ALL line items (ticket types) under this order
  phone_number: string;      // format: 2547XXXXXXXX or 07XXXXXXXX — backend normalises
}

export interface MpesaStkPushResponse {
  payment_id: number;
  checkout_request_id: string | null;
  message: string;
}

// ── User ──────────────────────────────────────────────────────────────────────

export const initiateMpesaPayment = async (
  data: MpesaStkPushRequest,
): Promise<MpesaStkPushResponse> => {
  return (await api.post('/payments/mpesa/stk-push', data)).data;
};

export const getPaymentById = async (
  paymentId: number,
): Promise<PaymentOut> => {
  return (await api.get(`/users/me/payments/${paymentId}`)).data;
};

export const getPaymentsByOrder = async (
  orderId: number,
): Promise<PaymentOut[]> => {
  return (
    await api.get(`/users/me/orders/${orderId}/payments`)
  ).data;
};

/**
 * Poll payment status after STK push.
 * Call this on an interval (e.g. every 3s) until status !== 'pending'.
 * Max ~30s before showing a timeout message to the user.
 *
 * Usage:
 *   const result = await pollPaymentStatus(paymentId, {
 *     onPending: () => setMessage('Waiting for M-PESA confirmation...'),
 *     onComplete: (p) => navigate('/my-tickets'),
 *     onFailed: (p) => setError('Payment failed. Please try again.'),
 *   });
 */
export const pollPaymentStatus = (
  paymentId: number,
  callbacks: {
    onPending?: () => void;
    onComplete: (payment: PaymentOut) => void;
    onFailed: (payment: PaymentOut) => void;
    onTimeout?: () => void;
    intervalMs?: number;
    maxAttempts?: number;
  },
): (() => void) => {
  const {
    onPending,
    onComplete,
    onFailed,
    onTimeout,
    intervalMs = 3000,
    maxAttempts = 10,
  } = callbacks;

  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    try {
      const payment = await getPaymentById(paymentId);

      if (payment.status === 'pending') {
        onPending?.();
      } else if (payment.status === 'completed') {
        clearInterval(interval);
        onComplete(payment);
      } else {
        // failed | refunded | any other terminal state
        clearInterval(interval);
        onFailed(payment);
      }
    } catch {
      // Network error — keep trying until maxAttempts
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
      onTimeout?.();
    }
  }, intervalMs);

  // Return a cancel function so callers can stop polling on unmount
  return () => clearInterval(interval);
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const admin_listAllPayments = async (): Promise<PaymentOut[]> => {
  return (await api.get('/admin/payments')).data;
};

export const admin_countPayments = async (): Promise<number> => {
  return (await api.get('/admin/payments/count')).data;
};

export const admin_getLatestPayments = async (
  limit = 10,
): Promise<PaymentOut[]> => {
  return (await api.get(`/admin/payments/latest?latest=${limit}`)).data;
};

export const admin_updatePaymentStatus = async (
  paymentId: number,
  status: string,
): Promise<PaymentOut> => {
  return (
    await api.patch(`/admin/payments/${paymentId}/status`, null, {
      params: { status },
    })
  ).data;
};

export const admin_deletePayment = async (
  paymentId: number,
): Promise<void> => {
  await api.delete(`/admin/payments/${paymentId}`);
};

export const admin_getPaymentsCreatedAfter = async (
  dateTime: string,
): Promise<PaymentOut[]> => {
  return (
    await api.get(`/admin/payments/created_after/${dateTime}`)
  ).data;
};

export const admin_getPaymentsUpdatedAfter = async (
  dateTime: string,
): Promise<PaymentOut[]> => {
  return (
    await api.get(`/admin/payments/updated_after/${dateTime}`)
  ).data;
};