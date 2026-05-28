// src/shared/utils/timeAgo.ts

/**
 * Converts a backend datetime string to a human-readable relative time.
 *
 * The backend (BaseModelEAT) serialises datetimes as fully offset-aware
 * ISO 8601 strings, e.g. "2026-05-27T04:21:17.728112+03:00".
 * Plain Date.parse handles these correctly in all modern browsers, so no
 * normalisation is needed for that format.
 *
 * We also handle the fallback case of naive strings with no offset
 * (e.g. "2026-05-27T01:21:17.728112") by appending 'Z' so they are
 * interpreted as UTC rather than local time.
 *
 * Offset detection looks for the pattern ±HH:MM or Z after the seconds
 * component — i.e. after the first 'T' in the string — to avoid false
 * matches on the date part (which contains '-' separators).
 */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';

  const s = iso.trim();

  // Find the time component (everything after the first 'T')
  const tIdx = s.indexOf('T');
  const timePart = tIdx !== -1 ? s.slice(tIdx) : s;

  // Check whether the time part already carries a timezone offset
  const hasOffset = /[Z]|[+-]\d{2}:\d{2}$/.test(timePart);

  const normalised = hasOffset ? s : `${s}Z`;

  const ms = Date.parse(normalised);
  if (isNaN(ms)) return '—';

  const diff = Date.now() - ms;
  if (diff < 0) return 'just now';

  const mins = Math.floor(diff / 60_000);
  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  if (days < 30)   return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
}