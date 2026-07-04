// src/apps/organizer/components/forms/EventDateTimeInput.tsx
import React, { useEffect } from 'react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const pad = (n: number) => n.toString().padStart(2, '0');

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

interface Parsed {
  day: number;
  month: number; // 1-12
  year: number;
  hour: number;
  minute: number; // always a multiple of 5
}

const parseValue = (value: string): Parsed => {
  // Expects 'YYYY-MM-DDTHH:MM' local, same shape formData already uses.
  const now = new Date();
  if (!value) {
    return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear(), hour: 0, minute: 0 };
  }
  const [datePart, timePart] = value.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [h, min] = (timePart ?? '00:00').split(':').map(Number);
  // Snap down to the nearest 5-minute option so pre-existing odd-minute
  // values (events created before this picker existed) still resolve to
  // a valid selection instead of matching nothing.
  const snappedMinute = Math.floor((min ?? 0) / 5) * 5;
  return { day: d, month: m, year: y, hour: h ?? 0, minute: snappedMinute };
};

const buildValue = (p: Parsed): string =>
  `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;

interface EventDateTimeInputProps {
  label: string;
  value: string;              // 'YYYY-MM-DDTHH:MM' local
  onChange: (value: string) => void;
  error?: string;
  yearRangeBack?: number;     // years before current year to offer (default 1)
  yearRangeForward?: number;  // years after current year to offer (default 5)
}

const selectCls =
  'px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm';

const EventDateTimeInput: React.FC<EventDateTimeInputProps> = ({
  label, value, onChange, error, yearRangeBack = 1, yearRangeForward = 5,
}) => {
  const parsed = parseValue(value);

  // If the field starts empty, immediately sync a sensible default (today,
  // 00:00) back to the parent so the visible selects and the underlying
  // form state agree from the first render — otherwise the dropdowns would
  // look pre-filled while validation still flags the field as empty.
  useEffect(() => {
    if (!value) onChange(buildValue(parsed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentYear = new Date().getFullYear();
  // Widen the range if the existing value falls outside the default window
  // (e.g. editing a legacy event dated further out) so we never silently
  // clobber its year by excluding it from the option list.
  const minYear = Math.min(currentYear - yearRangeBack, parsed.year);
  const maxYear = Math.max(currentYear + yearRangeForward, parsed.year);
  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);

  const maxDay = daysInMonth(parsed.year, parsed.month);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);        // 0 -> 23, straight list
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);  // 0, 5, 10 ... 55

  const update = (patch: Partial<Parsed>) => {
    const next: Parsed = { ...parsed, ...patch };
    // Re-clamp day if switching to a shorter month/year (e.g. 31st -> Feb).
    next.day = Math.min(next.day, daysInMonth(next.year, next.month));
    onChange(buildValue(next));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {/* Day / Month / Year — Kenyan dd/mm/yyyy order, not US mm/dd/yyyy */}
        <select value={parsed.day} onChange={e => update({ day: Number(e.target.value) })} className={selectCls} aria-label="Day">
          {days.map(d => <option key={d} value={d}>{pad(d)}</option>)}
        </select>
        <select value={parsed.month} onChange={e => update({ month: Number(e.target.value) })} className={selectCls} aria-label="Month">
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={parsed.year} onChange={e => update({ year: Number(e.target.value) })} className={selectCls} aria-label="Year">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {/* Hour / Minute — plain ascending lists, no wraparound at the ends.
            Minutes step by 5 so organizers aren't scrolling through 60 options. */}
        <select value={parsed.hour} onChange={e => update({ hour: Number(e.target.value) })} className={selectCls} aria-label="Hour">
          {hours.map(h => <option key={h} value={h}>{pad(h)}</option>)}
        </select>
        <select value={parsed.minute} onChange={e => update({ minute: Number(e.target.value) })} className={selectCls} aria-label="Minute">
          {minutes.map(m => <option key={m} value={m}>{pad(m)}</option>)}
        </select>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default EventDateTimeInput;