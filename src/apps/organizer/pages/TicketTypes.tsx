// src/apps/organizer/pages/TicketTypes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Ticket, Plus, Edit, Trash2, X, Save, DollarSign, Users, Eye, EyeOff, AlertCircle } from 'lucide-react';
import {
  organizer_getEventTicketTypes,
  organizer_createTicketType,
  organizer_updateTicketType,
  organizer_deleteTicketType,
  type TicketTypeOut,
  type TicketTypeCreate,
  type TicketTypeUpdate,
} from '@shared/api/user/ticketTypesApi';

interface TicketTypeFormData {
  name: string;
  description: string;
  price: string;
  total_quantity: string;
}

const TicketTypesManagement: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const [ticketTypes, setTicketTypes]   = useState<TicketTypeOut[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [showModal, setShowModal]       = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketTypeOut | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete]   = useState<TicketTypeOut | null>(null);
  const [submitting, setSubmitting]     = useState(false);

  const [formData, setFormData] = useState<TicketTypeFormData>({
    name: '', description: '', price: '', total_quantity: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadTicketTypes = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await organizer_getEventTicketTypes(Number(eventId));
      setTicketTypes(data);
    } catch {
      setError('Failed to load ticket types. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { loadTicketTypes(); }, [loadTicketTypes]);

  // ── Form ──────────────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Ticket type name is required';

    const price = parseFloat(formData.price);
    if (formData.price.trim() === '' || isNaN(price) || price < 0)
      errs.price = 'Price must be 0 or greater';

    if (!formData.total_quantity || parseInt(formData.total_quantity) <= 0) {
      errs.total_quantity = 'Quantity must be greater than 0';
    } else if (editingTicket && parseInt(formData.total_quantity) < editingTicket.quantity_sold) {
      errs.total_quantity = `Cannot be less than ${editingTicket.quantity_sold} (already sold)`;
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreateModal = () => {
    setEditingTicket(null);
    setFormData({ name: '', description: '', price: '', total_quantity: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (ticket: TicketTypeOut) => {
    setEditingTicket(ticket);
    setFormData({
      name:           ticket.name,
      description:    ticket.description ?? '',
      price:          ticket.price.toString(),
      total_quantity: ticket.total_quantity.toString(),
    });
    setFormErrors({});
    setShowModal(true);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateForm() || !eventId) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editingTicket) {
        const update: TicketTypeUpdate = {
          name:           formData.name,
          description:    formData.description || undefined,
          price:          parseFloat(formData.price),
          total_quantity: parseInt(formData.total_quantity),
        };
        const updated = await organizer_updateTicketType(editingTicket.id, update);
        setTicketTypes(prev => prev.map(t => t.id === updated.id ? updated : t));
      } else {
        const create: TicketTypeCreate = {
          event_id:       Number(eventId),
          name:           formData.name,
          description:    formData.description || undefined,
          price:          parseFloat(formData.price),
          total_quantity: parseInt(formData.total_quantity),
          is_active:      true,
        };
        const created = await organizer_createTicketType(Number(eventId), create);
        setTicketTypes(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save ticket type. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────

  const handleToggleActive = async (ticket: TicketTypeOut) => {
    try {
      const updated = await organizer_updateTicketType(ticket.id, { is_active: !ticket.is_active });
      setTicketTypes(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {
      setError('Failed to update ticket status.');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    try {
      await organizer_deleteTicketType(ticketToDelete.id);
      setTicketTypes(prev => prev.filter(t => t.id !== ticketToDelete.id));
    } catch (err: unknown) {
      // Backend returns 400 when ticket has bookings — it deactivates instead of deleting
      const msg = err instanceof Error ? err.message
        : 'Cannot delete ticket type with existing bookings. It has been deactivated instead.';
      setError(msg);
      // Reload to reflect any server-side deactivation
      loadTicketTypes();
    } finally {
      setShowDeleteModal(false);
      setTicketToDelete(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Ticket Types</h1>
            <p className="text-gray-600">Manage ticket types for your event</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Ticket Type
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : ticketTypes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No ticket types yet</h3>
            <p className="text-gray-500 mb-6">Create ticket types to start selling tickets</p>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Create First Ticket Type
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ticketTypes.map(ticket => {
              const soldPct = Math.round((ticket.quantity_sold / ticket.total_quantity) * 100);
              return (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-xl shadow-md p-6 ${!ticket.is_active ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{ticket.name}</h3>
                        {!ticket.is_active && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full flex items-center">
                            <EyeOff className="w-3 h-3 mr-1" /> Inactive
                          </span>
                        )}
                      </div>
                      {ticket.description && (
                        <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl font-bold ${ticket.price === 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {ticket.price === 0 ? 'Free' : `KES ${ticket.price.toLocaleString()}`}
                      </span>
                      <button
                        onClick={() => handleToggleActive(ticket)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          ticket.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {ticket.is_active
                          ? <><Eye className="w-4 h-4" /> Active</>
                          : <><EyeOff className="w-4 h-4" /> Inactive</>}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sold:</span>
                      <span className="font-semibold text-gray-800">
                        {ticket.quantity_sold} / {ticket.total_quantity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          soldPct >= 90 ? 'bg-red-500' : soldPct >= 70 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${soldPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className={`font-semibold ${ticket.quantity_available <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {ticket.quantity_available} tickets
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(ticket)}
                      className="flex-1 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => { setTicketToDelete(ticket); setShowDeleteModal(true); }}
                      className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTicket ? 'Edit Ticket Type' : 'Create Ticket Type'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ticket Name *</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleInputChange}
                  placeholder="e.g., VIP Pass, Regular Admission"
                  className={`w-full px-4 py-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description" value={formData.description} onChange={handleInputChange}
                  rows={3} placeholder="Describe what's included with this ticket..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (KES) * <span className="text-gray-400 font-normal">— enter 0 for free</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number" name="price" min="0" value={formData.price} onChange={handleInputChange}
                      placeholder="5000"
                      className={`w-full pl-10 pr-4 py-3 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {editingTicket ? 'Total Capacity *' : 'Quantity *'}
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number" name="total_quantity" min={editingTicket ? Math.max(editingTicket.quantity_sold, 1) : 1}
                      value={formData.total_quantity} onChange={handleInputChange}
                      placeholder="100"
                      className={`w-full pl-10 pr-4 py-3 border ${formErrors.total_quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  {formErrors.total_quantity && <p className="mt-1 text-sm text-red-600">{formErrors.total_quantity}</p>}
                  {editingTicket && (
                    <p className="mt-1 text-xs text-gray-500">
                      Raising capacity makes more tickets available. Cannot set below {editingTicket.quantity_sold} (already sold).
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50"
              >
                {submitting
                  ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  : <><Save className="w-5 h-5 mr-2" />{editingTicket ? 'Update' : 'Create'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ticketToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Ticket Type?</h3>
            <p className="text-gray-600 text-center mb-6">
              {ticketToDelete.quantity_sold > 0
                ? `"${ticketToDelete.name}" has ${ticketToDelete.quantity_sold} bookings. It will be deactivated instead of deleted.`
                : `Are you sure you want to delete "${ticketToDelete.name}"? This cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setTicketToDelete(null); }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTicket}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                {ticketToDelete.quantity_sold > 0 ? 'Deactivate' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTypesManagement;