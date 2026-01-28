import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Ticket, Plus, Edit, Trash2, X, Save, DollarSign, Users, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';

interface TicketType {
  id: number;
  event_id: number;
  name: string;
  description: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TicketTypeFormData {
  name: string;
  description: string;
  price: string;
  quantity_available: string;
}

const TicketTypesManagement: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<TicketType | null>(null);

  const [formData, setFormData] = useState<TicketTypeFormData>({
    name: '',
    description: '',
    price: '',
    quantity_available: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (eventId) {
      loadTicketTypes();
    }
  }, [eventId]);

  const loadTicketTypes = async () => {
    if (!eventId) return;
    
    setLoading(true);
    // TODO: Replace with actual API call
    // const response = await getTicketTypesByEvent(eventId);
    
    const mockTicketTypes: TicketType[] = [
      {
        id: 1,
        event_id: parseInt(eventId),
        name: "VIP Pass",
        description: "Front row access, complimentary drinks, exclusive lounge area",
        price: 5000,
        quantity_available: 50,
        quantity_sold: 23,
        is_active: true,
        created_at: "2025-01-01T10:00:00Z",
        updated_at: "2025-01-01T10:00:00Z"
      },
      {
        id: 2,
        event_id: parseInt(eventId),
        name: "Regular Admission",
        description: "General admission to the festival",
        price: 1500,
        quantity_available: 500,
        quantity_sold: 342,
        is_active: true,
        created_at: "2025-01-01T10:00:00Z",
        updated_at: "2025-01-01T10:00:00Z"
      },
      {
        id: 3,
        event_id: parseInt(eventId),
        name: "Student Ticket",
        description: "Valid student ID required at entrance",
        price: 1000,
        quantity_available: 200,
        quantity_sold: 156,
        is_active: true,
        created_at: "2025-01-01T10:00:00Z",
        updated_at: "2025-01-01T10:00:00Z"
      },
      {
        id: 4,
        event_id: parseInt(eventId),
        name: "Early Bird Special",
        description: "Limited time offer - save 30%!",
        price: 1050,
        quantity_available: 100,
        quantity_sold: 98,
        is_active: false,
        created_at: "2025-01-01T10:00:00Z",
        updated_at: "2025-01-15T10:00:00Z"
      }
    ];

    setTicketTypes(mockTicketTypes);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ticket type name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.quantity_available || parseInt(formData.quantity_available) <= 0) {
      newErrors.quantity_available = 'Quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCreateModal = () => {
    setEditingTicket(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity_available: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      description: ticket.description || '',
      price: ticket.price.toString(),
      quantity_available: ticket.quantity_available.toString()
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const ticketData = {
        event_id: parseInt(eventId!),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity_available: parseInt(formData.quantity_available)
      };

      // TODO: API call to create/update ticket type
      // if (editingTicket) {
      //   await updateTicketType(editingTicket.id, ticketData);
      // } else {
      //   await createTicketType(ticketData);
      // }

      console.log('Ticket type submitted:', ticketData);
      alert(`Ticket type ${editingTicket ? 'updated' : 'created'} successfully!`);
      
      setShowModal(false);
      loadTicketTypes();
    } catch (error) {
      console.error('Error submitting ticket type:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (ticketId: number, currentStatus: boolean) => {
    // TODO: API call to toggle is_active status
    // await updateTicketType(ticketId, { is_active: !currentStatus });
    
    setTicketTypes(ticketTypes.map(t => 
      t.id === ticketId ? { ...t, is_active: !currentStatus } : t
    ));
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    // Check if ticket has bookings
    if (ticketToDelete.quantity_sold > 0) {
      alert('Cannot delete ticket type with existing bookings. Deactivate it instead.');
      setShowDeleteModal(false);
      setTicketToDelete(null);
      return;
    }

    // TODO: API call to delete ticket type
    // await deleteTicketType(ticketToDelete.id);
    
    setTicketTypes(ticketTypes.filter(t => t.id !== ticketToDelete.id));
    setShowDeleteModal(false);
    setTicketToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Ticket Types</h1>
            <p className="text-gray-600">Manage ticket types for your event</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Ticket Type
          </button>
        </div>

        {/* Ticket Types List */}
        {ticketTypes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No ticket types yet</h3>
            <p className="text-gray-500 mb-6">Create ticket types to start selling tickets</p>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Create First Ticket Type
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ticketTypes.map((ticket) => {
              const availableTickets = ticket.quantity_available - ticket.quantity_sold;
              const soldPercentage = (ticket.quantity_sold / ticket.quantity_available) * 100;

              return (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-xl shadow-md p-6 ${
                    !ticket.is_active ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{ticket.name}</h3>
                        {!ticket.is_active && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full flex items-center">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-orange-600">
                        KES {ticket.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleToggleActive(ticket.id, ticket.is_active)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          ticket.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {ticket.is_active ? (
                          <>
                            <Eye className="w-4 h-4" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Inactive
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sold:</span>
                      <span className="font-semibold text-gray-800">
                        {ticket.quantity_sold} / {ticket.quantity_available}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          soldPercentage >= 90 ? 'bg-red-500' : soldPercentage >= 70 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${soldPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className={`font-semibold ${
                        availableTickets <= 10 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {availableTickets} tickets
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(ticket)}
                      className="flex-1 px-4 py-2 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setTicketToDelete(ticket);
                        setShowDeleteModal(true);
                      }}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTicket ? 'Edit Ticket Type' : 'Create Ticket Type'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ticket Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., VIP Pass, Regular Admission"
                  className={`w-full px-4 py-3 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe what's included with this ticket..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (KES) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="5000"
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      name="quantity_available"
                      value={formData.quantity_available}
                      onChange={handleInputChange}
                      placeholder="100"
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.quantity_available ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    />
                  </div>
                  {errors.quantity_available && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity_available}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {editingTicket ? 'Update' : 'Create'}
                  </>
                )}
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
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
              Delete Ticket Type?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {ticketToDelete.quantity_sold > 0
                ? `Cannot delete "${ticketToDelete.name}" because it has ${ticketToDelete.quantity_sold} bookings. You can deactivate it instead.`
                : `Are you sure you want to delete "${ticketToDelete.name}"? This action cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTicketToDelete(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {ticketToDelete.quantity_sold === 0 && (
                <button
                  onClick={handleDeleteTicket}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTypesManagement;