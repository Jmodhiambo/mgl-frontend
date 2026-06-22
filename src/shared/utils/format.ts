// src/apps/admin/utils/format.ts
// ─── Formatting utilities ─────────────────────────────────────────────────────

export const formatKES = (amount: number): string =>
  `KES ${amount.toLocaleString('en-KE')}`;

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });