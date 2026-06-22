// src/apps/organizer/pages/CoOrganizers.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import type { CoOrganizer } from '@shared/types/User';

/**
 * TODO(backend): getAllCoOrganizers / getCoOrganizersForEvent currently return
 * plain User rows. To show which event a co-organizer belongs to, the repo
 * needs to join CoOrganizer -> Event and the service/schema needs to return
 * event_id + event_title alongside the user fields (and the "all" view should
 * return one row per event/co-organizer pair, not deduped by user, since one
 * person can co-organize multiple events). This type documents the shape the
 * frontend expects so the two stay in sync once that's wired up — swap for a
 * generated type at that point.
 */


// ─── Row Action Menu ────────────────────────────────────────────────────────
// Kebab menu — mirrors the admin RowMenu pattern (MoreVertical trigger,
// click-to-open, closes on outside click). Worth promoting to a shared
// component if a second organizer-app table needs the same pattern.

const RowMenu: React.FC<{ onRemove: () => void }> = ({ onRemove }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <button
            onClick={() => { setOpen(false); onRemove(); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        </div>
      )}
    </div>
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
      await loadCoOrganizers();
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
      await deleteCoOrganizer(selectedCoOrg.id);
      setCoOrganizers(prev => prev.filter(c => c.id !== selectedCoOrg.id));
      setShowDeleteModal(false);
      setSelectedCoOrg(null);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Failed to remove co-organizer.';
      setError(typeof detail === 'string' ? detail : 'Failed to remove co-organizer.');
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

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Co-Organizers</h1>
            <p className="text-gray-600">Invite and manage co-organizers for your events</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center"
          >
            <UserPlus className="w-5 h-5 mr-2" /> Invite Co-Organizer
          </button>
        </div>

        {/* Event filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filter by Event
          </label>
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Info card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Co-organizers are team members you invite to help manage specific events.
            They can view bookings, manage ticket types, and assist with event coordination.
          </p>
        </div>

        {/* Co-organizers list */}
        {coOrganizers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No co-organizers yet</h3>
            <p className="text-gray-500 mb-6">Invite team members to help you manage events</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Invite Your First Co-Organizer
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Name', 'Event', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coOrganizers.map(co => (
                    <tr key={co.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-blue-600 font-semibold text-sm">
                              {co.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </span>
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
                      <span className="text-blue-600 font-semibold text-sm">
                        {co.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </span>
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
          </div>
        )}
      </div>

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Invite Co-Organizer</h2>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Event *
                </label>
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
                  The user must already have an MGLTickets account. They will be added
                  as a co-organizer immediately.
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
              {selectedCoOrg.event_title ? <> from <span className="font-semibold">{selectedCoOrg.event_title}</span></> : null}?
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
                {actionLoading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoOrganizerManagement;