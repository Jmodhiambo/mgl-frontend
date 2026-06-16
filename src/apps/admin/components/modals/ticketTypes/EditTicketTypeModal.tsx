// src/apps/admin/components/modals/ticketTypes/EditTicketTypeModal.tsx
import { useState } from 'react';
import { X, Pencil, DollarSign, Users, Loader2, AlertCircle, ImageOff } from 'lucide-react';
import { updateTicketType } from '@admin/services/adminService';
import { formatKES } from '@admin/utils/format';
import type { AdminTicketType, AdminEvent } from '@admin/types';

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

interface EditForm {
  name: string;
  description: string;
  price: string;
  total_quantity: string;
  is_active: boolean;
}

interface EditErrors {
  name?: string;
  price?: string;
  total_quantity?: string;
}

interface Props {
  ticket: AdminTicketType;
  event?: AdminEvent;
  onClose: () => void;
  onSaved: (updated: AdminTicketType) => void;
}

const EditTicketTypeModal: React.FC<Props> = ({ ticket, event, onClose, onSaved }) => {
  const [form, setForm] = useState<EditForm>({
    name:           ticket.name,
    description:    ticket.description ?? '',
    price:          String(ticket.price),
    total_quantity: String(ticket.total_quantity),
    is_active:      ticket.is_active,
  });
  const [errors, setErrors]       = useState<EditErrors>({});
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  const validate = (): boolean => {
    const e: EditErrors = {};
    if (!form.name.trim())                           e.name = 'Name is required';
    if (!form.price || parseFloat(form.price) <= 0) e.price = 'Price must be > 0';
    const qty = parseInt(form.total_quantity);
    if (!form.total_quantity || qty <= 0)            e.total_quantity = 'Quantity must be > 0';
    if (qty < ticket.quantity_sold)
      e.total_quantity = `Cannot be less than ${ticket.quantity_sold} already sold`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError('');
    try {
      const updated = await updateTicketType(ticket.id, {
        name:           form.name.trim(),
        description:    form.description.trim() || undefined,
        price:          parseFloat(form.price),
        total_quantity: parseInt(form.total_quantity),
        is_active:      form.is_active,
      });
      onSaved(updated);
    } catch (err: any) {
      setSaveError(parseApiError(err, 'Failed to update ticket type. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const inp = (key: keyof EditErrors) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  const flyerUrl = (event as any)?.flyer_url as string | undefined;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-lg p-6" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Pencil className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit Ticket Type</h3>
              <p className="text-sm text-gray-500">#{ticket.id} · {ticket.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon flex-shrink-0 ml-3">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event recap with flyer */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl mb-5">
          {flyerUrl ? (
            <img
              src={flyerUrl}
              alt={event?.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <ImageOff className="w-5 h-5 text-purple-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {event?.title ?? `Event #${ticket.event_id}`}
            </p>
            {event && (
              <p className="text-xs text-gray-500">{event.venue}, {event.city}</p>
            )}
          </div>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            event?.is_approved
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {event?.is_approved ? 'Approved' : 'Pending'}
          </span>
        </div>

        {/* Sold warning */}
        {ticket.quantity_sold > 0 && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">{ticket.quantity_sold} tickets already sold.</span>{' '}
              Total quantity cannot be reduced below this number.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }}
              placeholder="e.g. VIP Pass, General Admission"
              className={inp('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              rows={2}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What's included with this ticket? (optional)"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Price (KES) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number" min="0" value={form.price}
                  onChange={e => { setForm(p => ({ ...p, price: e.target.value })); setErrors(p => ({ ...p, price: undefined })); }}
                  placeholder="1500"
                  className={`${inp('price')} pl-9`}
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Total Quantity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number" min={ticket.quantity_sold || 1} value={form.total_quantity}
                  onChange={e => { setForm(p => ({ ...p, total_quantity: e.target.value })); setErrors(p => ({ ...p, total_quantity: undefined })); }}
                  placeholder="100"
                  className={`${inp('total_quantity')} pl-9`}
                />
              </div>
              {errors.total_quantity && <p className="mt-1 text-xs text-red-600">{errors.total_quantity}</p>}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">Active</p>
              <p className="text-xs text-gray-500">Inactive types are hidden from buyers</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                form.is_active ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.is_active ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Current stats summary */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Sold',      value: ticket.quantity_sold.toLocaleString(),      cls: 'text-gray-900' },
            { label: 'Available', value: ticket.quantity_available.toLocaleString(), cls: 'text-emerald-700' },
            { label: 'Revenue',   value: formatKES(ticket.price * ticket.quantity_sold), cls: 'text-purple-700' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
              <p className={`text-sm font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Save error */}
        {saveError && (
          <div className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-xs">{saveError}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Pencil className="w-4 h-4" /> Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTicketTypeModal;