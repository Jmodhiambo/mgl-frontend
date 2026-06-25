// src/apps/organizer/pages/CoOrganizers.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  UserPlus, Mail, Trash2, X, Send, Users,
  CheckCircle, AlertCircle, Loader2, MoreVertical,
} from 'lucide-react';
import {
  createCoOrganizer,
  getAllCoOrganizers,
  getCoOrganizersForEvent,
  deleteCoOrganizer,
} from '@shared/api/organizer/orgCoOrganizer';
import { getMyEvents } from '@organizer/services/eventService';
import type { OrganizerEventOut } from '@shared/types/Event';

/**
 * Mirrors CoOrganizerWithUserAndEvent from the backend schema.
 * `id` is the co_organizers row PK — passed to deleteCoOrganizer().
 * `user_id` is the invited user's id (kept separate for profile linking).
 * One row per co-organizer/event pairing, so a user co-organizing two
 * events appears as two rows — matching the backend's one-row-per-pair design.
 */
interface CoOrganizer {
  id: number;              // co_organizers.id — the DELETE key
  event_id: number;
  event_title: string;
  invited_by: number;
  create_co_organizer: boolean;
  created_at: string;
  user_id: number;         // the user's own id
  name: string;
  email: string;
  phone_number?: string;
  role: string;
}

// ─── Row Action Menu ────────────────────────────────────────────────────────
// Uses a portal + getBoundingClientRect so the dropdown is never clipped by
// table overflow or pushed off-screen when there's only one row.

const MENU_HEIGHT = 48; // single "Remove" item: ~40px + padding

const RowMenu: React.FC<{ onRemove: () => void }> = ({ onRemove }) => {
  const [open, setOpen]         = useState(false);
  const [style, setStyle]       = useState<React.CSSProperties>({});
  const triggerRef              = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < MENU_HEIGHT + 8 && rect.top > MENU_HEIGHT;
    setStyle(
      openUpward
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right, top: 'auto' }
        : { position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right },
    );
    setOpen(o => !o);
  };

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) close();
    };
    window.addEventListener('mousedown', onOutside);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('mousedown', onOutside);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={close} />
          <div style={{ ...style, zIndex: 9999 }} className="w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <button
              onClick={() => { close(); onRemove(); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        </>,
        document.body,
      )}
    </>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const CoOrganizerManagement: React.FC = () => {
  const [coOrganizers, setCoOrganizers] = useState<CoOrganizer[]>([]);
  const [events,       setEvents]       = useState<OrganizerEventOut[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [selectedCoOrg,  setSelectedCoOrg]     = useState<CoOrganizer | null>(null);

  const [inviteData, setInviteData] = useState({ email: '', eventId: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Tracks the active filter so the <select> stays controlled. Without this,
  // the dropdown's selected value lived only in the DOM — and since `loading`
  // swaps the whole tree for a spinner on every filter change, React remounted
  // a fresh <select> afterwards that always defaulted back to "All Events".
  const [selectedEventId, setSelectedEventId] = useState('');

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadCoOrganizers = useCallback(async (eventId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = eventId
        ? await getCoOrganizersForEvent(eventId)
        : await getAllCoOrganizers();
      setCoOrganizers(data);
    } catch {
      setError('Failed to load co-organizers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const data = await getMyEvents();
      setEvents(data);
    } catch {
      // Non-fatal — event list just won't populate the dropdown
    }
  }, []);

  useEffect(() => {
    Promise.all([loadCoOrganizers(), loadEvents()]);
  }, [loadCoOrganizers, loadEvents]);

  // Reload co-organizers when the selected event changes
  const handleEventFilterChange = (eventId: string) => {
    setSelectedEventId(eventId);
    loadCoOrganizers(eventId ? Number(eventId) : undefined);
  };

  // ── Invite ────────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!inviteData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!inviteData.eventId) {
      errs.eventId = 'Please select an event';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInvite = async () => {
    if (!validateForm()) return;
    setActionLoading(true);
    setInviteError(null);
    try {
      await createCoOrganizer(Number(inviteData.eventId), inviteData.email);
      setShowInviteModal(false);
      setInviteData({ email: '', eventId: '' });
      await loadCoOrganizers(selectedEventId ? Number(selectedEventId) : undefined);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Failed to send invitation. Please try again.';
      setInviteError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!selectedCoOrg) return;
    setActionLoading(true);
    try {
      // selectedCoOrg.id is co_organizers.id (the row PK), not user_id —
      // the DELETE endpoint expects the co_organizer row id.
      await deleteCoOrganizer(selectedCoOrg.id);
      setCoOrganizers(prev => prev.filter(c => c.id !== selectedCoOrg.id));
      setShowDeleteModal(false);
      setSelectedCoOrg(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to remove co-organizer.');
    } finally {
      setActionLoading(false);
    }
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteData({ email: '', eventId: '' });
    setFormErrors({});
    setInviteError(null);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Co-Organizers</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage the team members helping you run your events
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          <UserPlus className="w-4 h-4" /> Add Co-Organizer
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">Filter by event:</label>
        <select
          value={selectedEventId}
          onChange={e => handleEventFilterChange(e.target.value)}
          className="w-full md:w-72 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Events</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table / content area */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : coOrganizers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">No co-organizers yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedEventId
                ? 'No co-organizers found for this event.'
                : 'Add team members to help manage your events.'}
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              <UserPlus className="w-4 h-4" /> Add Co-Organizer
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Name', 'Event', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coOrganizers.map(co => (
                    <tr key={co.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-semibold text-xs">{getInitials(co.name)}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{co.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{co.event_title ?? '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{co.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{co.phone_number ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
                          {co.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RowMenu onRemove={() => { setSelectedCoOrg(co); setShowDeleteModal(true); }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {coOrganizers.map(co => (
                <div key={co.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">{getInitials(co.name)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{co.name}</p>
                      <p className="text-xs text-gray-500">{co.email}</p>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">{co.event_title ?? '—'}</p>
                    </div>
                  </div>
                  <RowMenu onRemove={() => { setSelectedCoOrg(co); setShowDeleteModal(true); }} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Co-Organizer</h2>
              <button onClick={closeInviteModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {inviteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{inviteError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={e => {
                      setInviteData(p => ({ ...p, email: e.target.value }));
                      if (formErrors.email) setFormErrors(p => ({ ...p, email: '' }));
                    }}
                    placeholder="colleague@example.com"
                    className={`w-full pl-10 pr-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Event *</label>
                <select
                  value={inviteData.eventId}
                  onChange={e => {
                    setInviteData(p => ({ ...p, eventId: e.target.value }));
                    if (formErrors.eventId) setFormErrors(p => ({ ...p, eventId: '' }));
                  }}
                  className={`w-full px-4 py-3 border ${formErrors.eventId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
                >
                  <option value="">Choose an event…</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
                {formErrors.eventId && <p className="mt-1 text-sm text-red-600">{formErrors.eventId}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  The user must already have an MGLTickets account. They will be added as a co-organizer immediately.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeInviteModal}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={actionLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50"
              >
                {actionLoading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><Send className="w-5 h-5 mr-2" /> Add Co-Organizer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && selectedCoOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Remove Co-Organizer?</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to remove <span className="font-semibold">{selectedCoOrg.name}</span>
              {selectedCoOrg.event_title
                ? <> from <span className="font-semibold">{selectedCoOrg.event_title}</span></>
                : null}?
              They will lose access to manage {selectedCoOrg.event_title ? 'this event' : 'events'}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedCoOrg(null); }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoOrganizerManagement;