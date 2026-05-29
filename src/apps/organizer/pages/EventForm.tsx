// src/apps/organizer/pages/EventForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Upload, X, Save, ArrowLeft } from 'lucide-react';
import {
  createEvent,
  updateEvent,
  getEventDetails,
} from '@organizer/services/eventService';

const CATEGORIES = ['Music', 'Tech', 'Sports', 'Food', 'Comedy', 'Culture', 'Party', 'Other'];

interface EventFormData {
  title: string;
  description: string;
  venue: string;
  city: string;
  country: string;
  category: string;
  start_time: string;
  end_time: string;
  flyer: File | null;
}

interface EventFormProps {
  mode?: 'create' | 'edit';
}

const EventForm: React.FC<EventFormProps> = ({ mode = 'create' }) => {
  const navigate   = useNavigate();
  const { id: eventId } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<EventFormData>({
    title: '', description: '', venue: '', city: '',
    country: 'Kenya', category: 'Music',
    start_time: '', end_time: '', flyer: null,
  });
  const [flyerPreview, setFlyerPreview] = useState('');
  const [loading, setLoading]           = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [apiError, setApiError]         = useState<string | null>(null);

  // ── Load existing event data in edit mode ─────────────────────────────────
  useEffect(() => {
    if (mode === 'edit' && eventId) {
      setLoadingEvent(true);
      getEventDetails(Number(eventId))
        .then(({ event }) => {
          // datetime-local input expects 'YYYY-MM-DDTHH:MM' format
          const toLocal = (iso: string) => iso.slice(0, 16);
          setFormData({
            title:       event.title,
            description: event.description ?? '',
            venue:       event.venue,
            city:        event.city,
            country:     event.country,
            category:    event.category,
            start_time:  toLocal(event.start_time),
            end_time:    toLocal(event.end_time),
            flyer:       null,
          });
          setFlyerPreview(event.flyer_url);
        })
        .catch(() => setApiError('Failed to load event data. Please try again.'))
        .finally(() => setLoadingEvent(false));
    }
  }, [eventId, mode]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.title.trim())    e.title      = 'Event title is required';
    if (!formData.venue.trim())    e.venue      = 'Venue is required';
    if (!formData.city.trim())     e.city       = 'City is required';
    if (!formData.start_time)      e.start_time = 'Start time is required';
    if (!formData.end_time)        e.end_time   = 'End time is required';
    if (
      formData.start_time &&
      formData.end_time &&
      new Date(formData.end_time) <= new Date(formData.start_time)
    ) {
      e.end_time = 'End time must be after start time';
    }
    if (mode === 'create' && !formData.flyer && !flyerPreview) {
      e.flyer = 'Event flyer is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Flyer upload ──────────────────────────────────────────────────────────
  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(p => ({ ...p, flyer: 'File size must be less than 5MB' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors(p => ({ ...p, flyer: 'Please upload an image file' }));
      return;
    }
    setFormData(p => ({ ...p, flyer: file }));
    const reader = new FileReader();
    reader.onloadend = () => setFlyerPreview(reader.result as string);
    reader.readAsDataURL(file);
    setErrors(p => ({ ...p, flyer: '' }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      if (mode === 'create') {
        await createEvent({
          title:       formData.title,
          description: formData.description,
          venue:       formData.venue,
          city:        formData.city,
          country:     formData.country,
          category:    formData.category,
          start_time:  new Date(formData.start_time).toISOString(),
          end_time:    new Date(formData.end_time).toISOString(),
          flyer:       formData.flyer,
        });
      } else {
        await updateEvent(Number(eventId), {
          title:       formData.title,
          description: formData.description,
          venue:       formData.venue,
          city:        formData.city,
          country:     formData.country,
          category:    formData.category,
          start_time:  new Date(formData.start_time).toISOString(),
          end_time:    new Date(formData.end_time).toISOString(),
        });
      }
      navigate('/events');
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Failed to submit form. Please try again.';
      setApiError(detail);
    } finally {
      setLoading(false);
    }
  };

  const inp = (key: string) =>
    `w-full px-4 py-3 border ${
      errors[key] ? 'border-red-500' : 'border-gray-300'
    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`;

  // ── Loading state (edit mode) ─────────────────────────────────────────────
  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading event data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Back to Events
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create'
              ? 'Fill in the details below to create your event'
              : 'Update your event information'}
          </p>
        </div>

        {/* API error banner */}
        {apiError && (
          <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        <div className="space-y-6">

          {/* Title */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
            <input
              type="text" value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Summer Music Festival 2025"
              className={inp('title')}
            />
            {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description} rows={5}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell people about your event…"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="mt-2 text-sm text-gray-500">{formData.description.length} / 1000 characters</p>
          </div>

          {/* Category + Country */}
          <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                className={inp('category')}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
              <input
                type="text" value={formData.country}
                onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                className={inp('country')}
              />
            </div>
          </div>

          {/* Venue + City */}
          <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Venue *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text" value={formData.venue}
                  onChange={e => setFormData(p => ({ ...p, venue: e.target.value }))}
                  placeholder="e.g., Kasarani Stadium"
                  className={`${inp('venue')} pl-10`}
                />
              </div>
              {errors.venue && <p className="mt-2 text-sm text-red-600">{errors.venue}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
              <input
                type="text" value={formData.city}
                onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                placeholder="e.g., Nairobi"
                className={inp('city')}
              />
              {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date & Time *</label>
                <input
                  type="datetime-local" value={formData.start_time}
                  onChange={e => setFormData(p => ({ ...p, start_time: e.target.value }))}
                  className={inp('start_time')}
                />
                {errors.start_time && <p className="mt-2 text-sm text-red-600">{errors.start_time}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date & Time *</label>
                <input
                  type="datetime-local" value={formData.end_time}
                  onChange={e => setFormData(p => ({ ...p, end_time: e.target.value }))}
                  className={inp('end_time')}
                />
                {errors.end_time && <p className="mt-2 text-sm text-red-600">{errors.end_time}</p>}
              </div>
            </div>
          </div>

          {/* Flyer */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Flyer {mode === 'create' && '*'}
            </label>
            {flyerPreview ? (
              <div className="relative">
                <img src={flyerPreview} alt="Flyer preview" className="w-full h-64 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setFlyerPreview(''); setFormData(p => ({ ...p, flyer: null })); }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  {mode === 'edit' && !formData.flyer && 'Current flyer. Upload a new image to replace it.'}
                  {formData.flyer && 'New flyer selected. Click the X to remove.'}
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input type="file" id="flyer" accept="image/*" onChange={handleFlyerChange} className="hidden" />
                <label htmlFor="flyer" className="cursor-pointer flex flex-col items-center">
                  <div className="p-4 bg-blue-100 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">Click to upload event flyer</p>
                  <p className="text-sm text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                </label>
              </div>
            )}
            {errors.flyer && <p className="mt-2 text-sm text-red-600">{errors.flyer}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                if (confirm('Any unsaved changes will be lost.')) navigate('/events');
              }}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <><Save className="w-5 h-5 mr-2" />{mode === 'create' ? 'Create Event' : 'Save Changes'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;