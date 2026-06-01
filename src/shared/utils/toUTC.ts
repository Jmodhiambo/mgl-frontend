// ─── UTC conversion helper ────────────────────────────────────────────────────
// datetime-local inputs give "2025-07-15T14:00" in the user's local timezone.
// The backend stores and expects UTC ISO strings.

export const toUTC = (localDateTimeStr: string): string =>
  new Date(localDateTimeStr).toISOString();