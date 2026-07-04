// src/apps/shared/utils/parseApiError.ts
export function parseApiError(err: any, fallback: string): string {
  const raw = err?.response?.data?.detail;
  if (Array.isArray(raw)) {
    return raw
      .map((e: any) => `${Array.isArray(e?.loc) ? e.loc[e.loc.length - 1] : 'field'}: ${e?.msg ?? 'Invalid value'}`)
      .join('; ');
  }
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && typeof raw.msg === 'string') return raw.msg;
  return fallback;
}