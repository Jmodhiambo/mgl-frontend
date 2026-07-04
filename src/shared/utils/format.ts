// src/apps/shared/utils/format.ts

export const formatKES = (amount: number): string =>
  `KES ${amount.toLocaleString('en-KE')}`;


export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });

// Explicit hour12: false — Kenya's 24-hour convention shouldn't be left to
// vary silently by browser/runtime default.
export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false });