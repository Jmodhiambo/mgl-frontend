// src/apps/admin/components/modals/events/CreateEventModal.tsx
import { useState, useEffect } from 'react';
import { Plus, Upload, User, X, Loader2, AlertCircle } from 'lucide-react';
import { listOrganizers, createEvent } from '@admin/services/adminService';
import { toUTC } from '@shared/utils/toUTC';
import type { AdminEvent, AdminUser, CreateEventForm } from '@admin/types';

const CATEGORIES = ['Music', 'Tech', 'Sports', 'Food', 'Comedy', 'Culture', 'Party', 'Other'];

// ─── Helper ───────────────────────────────────────────────────────────────────

function parseApiError(err: any, fallback: string): string {
  const raw = err?.response?.data?.detail;
  if (Array.isArray(raw)) {
    return raw
      .map((e: any) => {
        const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : 'field';
        return `${field}: ${e.msg}`;
      })
      .join('; ');
  }
  if (typeof raw === 'string') return raw;
  return fallback;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateEventModalProps {
  onClose: () => void;
  onCreated: (event: AdminEvent) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onCreated }) => {
  const [organizers, setOrganizers]        = useState<AdminUser[]>([]);
  const [organizersLoading, setOrgLoading] = useState(true);
  const [apiError, setApiError]            = useState<string | null>(null);

  // Load real organizer list on mount
  useEffect(() => {
    listOrganizers()
      .then(setOrganizers)
      .catch(() => {})
      .finally(() => setOrgLoading(false));
  }, []);

  const [form, setForm] = useState<CreateEventForm>({
    title: '', description: '', venue: '', city: '', country: 'Kenya',
    category: 'Music', start_time: '', end_time: '',
    organizer_id: '', flyer: null,
  });
  const [flyerPreview, setFlyerPreview] = useState('');
  const [errors, setErrors]             = useState<Partial<Record<keyof CreateEventForm, string>>>({});
  const [loading, setLoading]           = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<Record<keyof CreateEventForm, string>> = {};
    if (!form.title.trim())       e.title        = 'Event title is required';
    if (!form.venue.trim())       e.venue        = 'Venue is required';
    if (!form.city.trim())        e.city         = 'City is required';
    if (!form.start_time)         e.start_time   = 'Start time is required';
    if (!form.end_time)           e.end_time     = 'End time is required';
    if (form.organizer_id === '') e.organizer_id = 'Select an organizer';
    if (
      form.start_time &&
      form.end_time &&
      new Date(form.end_time) <= new Date(form.start_time)
    ) {
      e.end_time = 'End time must be after start time';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Flyer upload ───────────────────────────────────────────────────────────
  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(p => ({ ...p, flyer: 'Max 5 MB' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors(p => ({ ...p, flyer: 'Images only' }));
      return;
    }
    setForm(p => ({ ...p, flyer: file }));
    const reader = new FileReader();
    reader.onloadend = () => setFlyerPreview(reader.result as string);
    reader.readAsDataURL(file);
    setErrors(p => ({ ...p, flyer: undefined }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      // Convert datetime-local strings from browser local time → UTC ISO strings.
      // The backend stores in UTC; sending local time without conversion would
      // shift the event time by the user's UTC offset.
      // created_at / updated_at are NOT sent — the database sets them automatically.
      const newEvent = await createEvent({
        title:        form.title,
        description:  form.description,
        venue:        form.venue,
        city:         form.city,
        country:      form.country,
        category:     form.category,
        start_time:   toUTC(form.start_time),
        end_time:     toUTC(form.end_time),
        organizer_id: Number(form.organizer_id),
        flyer:        form.flyer,
      });
      // Backend returns AdminEventOut with flyer_url already set
      onCreated(newEvent);
    } catch (err: any) {
      setApiError(parseApiError(err, 'Failed to create event. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  const inp = (key: keyof CreateEventForm) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Create Event on Behalf of Organizer
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Step 1 of 2 — Event details</p>
          </div>
          <button onClick={onClose} className="btn-icon flex-shrink-0 ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3 mb-5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">1</div>
            <span className="text-xs font-semibold text-purple-700">Event Details</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-xs font-medium text-gray-400">Ticket Types</span>
          </div>
        </div>

        {/* Admin notice */}
        <div className="mb-5 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <User className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Events created here are logged under your admin account. The organizer will see it
            in their dashboard and can edit details before it goes live.
          </p>
        </div>

        {/* API error banner — rendered ABOVE the form fields so it's immediately visible */}
        {apiError && (
          <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">{apiError}</p>
          </div>
        )}

        <div className="space-y-4">

          {/* Organizer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organizer <span className="text-red-500">*</span>
            </label>
            <select
              value={form.organizer_id}
              disabled={organizersLoading}
              onChange={e => setForm(p => ({ ...p, organizer_id: Number(e.target.value) || '' }))}
              className={inp('organizer_id')}
            >
              <option value="">
                {organizersLoading ? 'Loading organizers…' : 'Select organizer…'}
              </option>
              {organizers.map(o => {
                const name =
                  (o as any).name ??
                  `${(o as any).first_name ?? ''} ${(o as any).last_name ?? ''}`.trim();
                return (
                  <option key={o.id} value={o.id}>
                    {name} — {o.email}
                  </option>
                );
              })}
            </select>
            {errors.organizer_id && (
              <p className="mt-1 text-xs text-red-600">{errors.organizer_id}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={form.title} placeholder="e.g. Nairobi Jazz Fest 2026"
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={inp('title')}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description} rows={3}
              placeholder="Tell attendees about this event…"
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
            />
          </div>

          {/* Category + Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className={inp('category')}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text" value={form.country}
                onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                className={inp('country')}
              />
            </div>
          </div>

          {/* Venue + City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.venue} placeholder="e.g. KICC Grounds"
                onChange={e => setForm(p => ({ ...p, venue: e.target.value }))}
                className={inp('venue')}
              />
              {errors.venue && <p className="mt-1 text-xs text-red-600">{errors.venue}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.city} placeholder="Nairobi"
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                className={inp('city')}
              />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local" value={form.start_time}
                onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                className={inp('start_time')}
              />
              {errors.start_time && (
                <p className="mt-1 text-xs text-red-600">{errors.start_time}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local" value={form.end_time}
                onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                className={inp('end_time')}
              />
              {errors.end_time && (
                <p className="mt-1 text-xs text-red-600">{errors.end_time}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            Times are entered in your local timezone and converted to UTC automatically.
          </p>

          {/* Flyer upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Flyer</label>
            {flyerPreview ? (
              <div className="relative">
                <img src={flyerPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setFlyerPreview(''); setForm(p => ({ ...p, flyer: null })); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="create-event-flyer"
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-6 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <div className="p-2.5 bg-gray-100 rounded-full">
                  <Upload className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Click to upload flyer</p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP — max 5 MB</p>
                <input
                  id="create-event-flyer" type="file" accept="image/*"
                  className="hidden" onChange={handleFlyerChange}
                />
              </label>
            )}
            {errors.flyer && <p className="mt-1 text-xs text-red-600">{errors.flyer}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading || organizersLoading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Plus className="w-4 h-4" /> Create &amp; Add Tickets</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;