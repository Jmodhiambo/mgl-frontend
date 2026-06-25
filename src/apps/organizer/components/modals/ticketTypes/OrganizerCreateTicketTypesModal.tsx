// src/apps/organizer/components/modals/ticketTypes/OrganizerCreateTicketTypesModal.tsx
import { useState } from 'react';
import {
  Ticket, Plus, Trash2, Save, X, DollarSign, Users,
  CheckCircle, AlertCircle, ChevronDown, Tag, Loader2,
} from 'lucide-react';
import { createTicketType } from '@organizer/services/ticketTypeService';
import type { OrganizerEventOut } from '@shared/types/Event';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketTypeInput {
  name: string;
  description: string;
  price: string;
  quantity_available: string;
}

export interface SavedTicketType extends TicketTypeInput {
  _id: string; // local key only — never sent to API
}

interface FieldErrors {
  name?: string;
  price?: string;
  quantity_available?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const emptyForm = (): TicketTypeInput => ({
  name: '', description: '', price: '', quantity_available: '',
});

const validateTicket = (t: TicketTypeInput): FieldErrors => {
  const e: FieldErrors = {};
  if (!t.name.trim()) e.name = 'Name is required';

  const price = parseFloat(t.price);
  if (t.price.trim() === '' || isNaN(price) || price < 0)
    e.price = 'Price must be 0 or greater';

  if (!t.quantity_available || parseInt(t.quantity_available) <= 0)
    e.quantity_available = 'Quantity must be > 0';
  return e;
};

// ─── Ticket Type Row ──────────────────────────────────────────────────────────

const TicketTypeRow: React.FC<{
  index: number;
  ticket: SavedTicketType;
  isEditing: boolean;
  onSave: (id: string, data: TicketTypeInput) => void;
  onRemove: (id: string) => void;
  onEditToggle: (id: string) => void;
}> = ({ index, ticket, isEditing, onSave, onRemove, onEditToggle }) => {
  const [form, setForm]     = useState<TicketTypeInput>({ ...ticket });
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSave = () => {
    const e = validateTicket(form);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave(ticket._id, form);
    setErrors({});
  };

  const inp = (key: keyof FieldErrors) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  // ── Collapsed (saved) view ─────────────────────────────────────────────────
  if (!isEditing) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl group hover:border-blue-200 hover:shadow-sm transition-all">
        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 text-sm truncate">{ticket.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              parseFloat(ticket.price) === 0
                ? 'bg-blue-50 text-blue-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {parseFloat(ticket.price) === 0 ? 'Free' : `KES ${parseFloat(ticket.price).toLocaleString()}`}
            </span>
          </div>
          {ticket.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{ticket.description}</p>
          )}
          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Users className="w-3 h-3" />
            {parseInt(ticket.quantity_available).toLocaleString()} available
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditToggle(ticket._id)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Edit"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(ticket._id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      </div>
    );
  }

  // ── Expanded (editing) view ────────────────────────────────────────────────
  return (
    <div className="border-2 border-blue-300 rounded-xl bg-blue-50/30 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-blue-700 flex items-center gap-1.5">
          <Tag className="w-4 h-4" /> Ticket Type {index + 1}
        </span>
        <button
          onClick={() => onRemove(ticket._id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text" value={form.name}
          placeholder="e.g. VIP Pass, General Admission, Early Bird"
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className={inp('name')}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description} rows={2}
          placeholder="What's included with this ticket? (optional)"
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Price (KES) <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal"> (Enter 0 for free tickets)</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number" min="0" value={form.price} placeholder="1500"
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              className={`${inp('price')} pl-9`}
            />
          </div>
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number" min="1" value={form.quantity_available} placeholder="100"
              onChange={e => setForm(p => ({ ...p, quantity_available: e.target.value }))}
              className={`${inp('quantity_available')} pl-9`}
            />
          </div>
          {errors.quantity_available && (
            <p className="mt-1 text-xs text-red-600">{errors.quantity_available}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={() => onEditToggle(ticket._id)}
          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
        >
          <CheckCircle className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface OrganizerCreateTicketTypesModalProps {
  event: OrganizerEventOut;
  onClose: () => void;
  onFinish: (event: OrganizerEventOut, ticketTypes: SavedTicketType[]) => void;
  onSkip: (event: OrganizerEventOut) => void;
}

const OrganizerCreateTicketTypesModal: React.FC<OrganizerCreateTicketTypesModalProps> = ({
  event, onClose, onFinish, onSkip,
}) => {
  const [tickets, setTickets]     = useState<SavedTicketType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleAdd = () => {
    const newTicket: SavedTicketType = { ...emptyForm(), _id: uid() };
    setTickets(p => [...p, newTicket]);
    setEditingId(newTicket._id);
  };

  const handleSave = (id: string, data: TicketTypeInput) => {
    setTickets(p => p.map(t => t._id === id ? { ...data, _id: id } : t));
    setEditingId(null);
  };

  const handleRemove = (id: string) => {
    setTickets(p => p.filter(t => t._id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleEditToggle = (id: string) => {
    setEditingId(prev => prev === id ? null : id);
  };

  const allSaved = tickets.every(t => editingId !== t._id);

  const handleFinish = async () => {
    if (!allSaved) {
      setSaveError('Please save all open ticket types before finishing.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      for (const t of tickets) {
        await createTicketType(event.id, {
          name: t.name,
          description: t.description,
          price: parseFloat(t.price),
          quantity_available: parseInt(t.quantity_available),
        });
      }
      onFinish(event, tickets);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Failed to save ticket types. Please try again.';
      setSaveError(detail);
    } finally {
      setSaving(false);
    }
  };

  const totalCapacity = tickets.reduce(
    (s, t) => s + (parseInt(t.quantity_available) || 0), 0,
  );
  const totalRevenuePotential = tickets.reduce(
    (s, t) => s + (parseFloat(t.price) || 0) * (parseInt(t.quantity_available) || 0), 0,
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Add Ticket Types</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Step 2 of 2 — Ticket types for{' '}
                <span className="font-medium text-gray-700">{event.title}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0 ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3 mb-5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-emerald-600">Event Details</span>
            </div>
            <div className="flex-1 h-px bg-blue-300 mx-1" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</div>
              <span className="text-xs font-semibold text-blue-700">Ticket Types</span>
            </div>
          </div>

          {/* Event recap */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl mb-5">
            {event.flyer_url ? (
              <img
                src={event.flyer_url}
                alt={event.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Ticket className="w-5 h-5 text-blue-500" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{event.title}</p>
              <p className="text-xs text-gray-500">{event.venue}, {event.city}</p>
            </div>
            <span className="ml-auto text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium flex-shrink-0 whitespace-nowrap">
              Pending Approval
            </span>
          </div>

          {/* Summary stats */}
          {tickets.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-700">{tickets.length}</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Ticket {tickets.length === 1 ? 'Type' : 'Types'}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-indigo-700">{totalCapacity.toLocaleString()}</p>
                <p className="text-xs text-indigo-600 mt-0.5">Total Capacity</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-700">
                  {totalRevenuePotential >= 1_000_000
                    ? `${(totalRevenuePotential / 1_000_000).toFixed(1)}M`
                    : totalRevenuePotential >= 1_000
                      ? `${(totalRevenuePotential / 1_000).toFixed(0)}K`
                      : totalRevenuePotential.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">Max Revenue (KES)</p>
              </div>
            </div>
          )}

          {/* Ticket types list */}
          <div className="space-y-3 mb-4">
            {tickets.map((ticket, i) => (
              <TicketTypeRow
                key={ticket._id}
                index={i}
                ticket={ticket}
                isEditing={editingId === ticket._id}
                onSave={handleSave}
                onRemove={handleRemove}
                onEditToggle={handleEditToggle}
              />
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={editingId !== null}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {tickets.length === 0 ? 'Add your first ticket type' : 'Add another ticket type'}
          </button>

          {/* Empty state hint */}
          {tickets.length === 0 && (
            <div className="mt-4 flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                You can skip this step and add ticket types later from the Event Details page.
                Ticket types are required before your event can accept bookings.
              </p>
            </div>
          )}

          {/* Save error */}
          {saveError && (
            <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs">{saveError}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={() => onSkip(event)}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Skip for Now
            </button>
            <button
              onClick={handleFinish}
              disabled={saving || tickets.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              title={tickets.length === 0 ? 'Add at least one ticket type or skip' : undefined}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save {tickets.length > 0
                    ? `${tickets.length} Ticket ${tickets.length === 1 ? 'Type' : 'Types'}`
                    : 'Ticket Types'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerCreateTicketTypesModal;