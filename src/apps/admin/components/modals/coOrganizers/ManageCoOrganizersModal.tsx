// src/apps/admin/components/modals/coOrganizers/ManageCoOrganizersModal.tsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, UserPlus, Trash2, Loader2, AlertCircle, Users, Mail, MoreVertical,
} from 'lucide-react';
import {
  adminAddCoOrganizer,
  adminGetCoOrganizersForEvent,
  adminDeleteCoOrganizer,
} from '@admin/services/adminCoOrganizerApi';
import type { CoOrganizerWithUserAndEvent } from '@shared/api/organizer/orgCoOrganizer';
import type { AdminEvent } from '@admin/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseApiError(err: unknown, fallback: string): string {
  const detail = (err as any)?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((e: any) => e.msg).join('; ');
  return fallback;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Row action menu ──────────────────────────────────────────────────────────
// Portal-based so the dropdown is never clipped by the modal's overflow-y-auto
// scroll container or pushed off-screen on short lists.

const MENU_HEIGHT = 44; // single "Remove" item

const RowMenu: React.FC<{ onRemove: () => void }> = ({ onRemove }) => {
  const [open, setOpen]   = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef        = useRef<HTMLButtonElement>(null);

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
        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Row actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={close} />
          <div style={{ ...style, zIndex: 9999 }} className="w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <button
              onClick={() => { close(); onRemove(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </>,
        document.body,
      )}
    </>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  event: AdminEvent;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ManageCoOrganizersModal: React.FC<Props> = ({ event, onClose }) => {
  const [coOrganizers, setCoOrganizers] = useState<CoOrganizerWithUserAndEvent[]>([]);
  const [loading, setLoading]           = useState(true);
  const [listError, setListError]       = useState<string | null>(null);

  const [email, setEmail]           = useState('');
  const [emailError, setEmailError] = useState('');
  const [adding, setAdding]         = useState(false);
  const [addError, setAddError]     = useState<string | null>(null);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [removing, setRemoving]   = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCoOrganizers = async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await adminGetCoOrganizersForEvent(event.id);
      setCoOrganizers(data);
    } catch (err) {
      setListError(parseApiError(err, 'Failed to load co-organizers. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoOrganizers(); }, [event.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add ────────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!email.trim()) { setEmailError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setAdding(true);
    setAddError(null);
    setEmailError('');
    try {
      await adminAddCoOrganizer(email.trim(), event.id);
      setEmail('');
      // Re-fetch so the new row gets the server-populated fields
      await fetchCoOrganizers();
    } catch (err) {
      setAddError(parseApiError(err, 'Failed to add co-organizer. Please try again.'));
    } finally {
      setAdding(false);
    }
  };

  // ── Remove ─────────────────────────────────────────────────────────────────

  const handleRemove = async () => {
    if (confirmId === null) return;
    setRemoving(true);
    try {
      await adminDeleteCoOrganizer(confirmId);
      setCoOrganizers(prev => prev.filter(c => c.id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setListError(parseApiError(err, 'Failed to remove co-organizer. Please try again.'));
      setConfirmId(null);
    } finally {
      setRemoving(false);
    }
  };

  const confirmTarget = coOrganizers.find(c => c.id === confirmId);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl font-bold text-gray-900">Co-Organizers</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Add form */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Add by email address
          </label>

          {addError && (
            <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{addError}</p>
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); setAddError(null); }}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                placeholder="user@example.com"
                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  emailError ? 'border-red-400' : 'border-gray-300'
                }`}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {adding
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><UserPlus className="w-4 h-4" /> Add</>}
            </button>
          </div>
          {emailError && <p className="mt-1.5 text-xs text-red-600">{emailError}</p>}
          <p className="mt-1.5 text-xs text-gray-500">
            The user must already have an MGLTickets account.
          </p>
        </div>

        {/* Co-organizer list */}
        <div className="flex-1 overflow-y-auto">
          {listError && (
            <div className="m-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{listError}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : coOrganizers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No co-organizers yet</p>
              <p className="text-xs text-gray-500 mt-1">Add a team member using the field above.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  {['Name', 'Email', 'Role', ''].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coOrganizers.map(co => (
                  <tr key={co.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-xs">
                            {getInitials(co.name)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{co.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{co.email}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
                        {co.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <RowMenu onRemove={() => setConfirmId(co.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Remove confirmation overlay */}
      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center w-11 h-11 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Remove Co-Organizer?</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Remove <span className="font-semibold">{confirmTarget?.name}</span> from{' '}
              <span className="font-semibold">{event.title}</span>? They will lose access immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                disabled={removing}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoOrganizersModal;