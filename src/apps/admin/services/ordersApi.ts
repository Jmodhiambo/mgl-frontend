// Addition to the shared API layer — same location as admin_listAllBookings
// and admin_listAllPayments (per the project's @shared/api/user/* convention,
// this likely belongs in a new @shared/api/user/ordersApi.ts, or alongside
// the existing admin_listAllBookings in bookingsApi.ts — either is fine,
// just keep admin_* functions together with the other admin_* booking/payment
// functions they replace).

import api from '@shared/api/axiosConfig';
import type { AdminOrder } from '@admin/types';

// ── Admin: Orders (replaces admin_listAllBookings + admin_listAllPayments) ───

export const admin_listAllOrders = async (): Promise<AdminOrder[]> => {
  return (await api.get('/admin/orders')).data;
};

export const admin_deleteOrder = async (orderId: number): Promise<void> => {
  await api.delete(`/admin/orders/${orderId}`);
};