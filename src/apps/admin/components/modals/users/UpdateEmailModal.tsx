// src/apps/admin/components/modal/users/UpdateEmailModal.tsx

import { useState } from 'react';
import { Mail, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { updateUserEmail } from '@admin/services/adminService';
import type { AdminUser } from '@admin/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a display-ready full name from an AdminUser.
 * Handles both live API shape { name } and dummy-data shape { first_name, last_name }.
 */
function getDisplayName(user: AdminUser): string {
  if ((user as any).name) return (user as any).name as string;
  const full = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  return full || 'Unknown';
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  user: AdminUser;
  onClose: () => void;
  /** Called with the updated user after a successful save. */
  onUpdated: (user: AdminUser) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const UpdateEmailModal: React.FC<Props> = ({ user, onClose, onUpdated }) => {
  const [newEmail, setNewEmail]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    const trimmed = newEmail.trim();
    if (!trimmed) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address.';
    if (trimmed.toLowerCase() === user.email.toLowerCase())
      return 'The new email must be different from the current one.';
    return null;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const updated = await updateUserEmail(user.id, newEmail.trim());
      setSuccess(true);
      // Give the user a moment to read the success state before closing
      setTimeout(() => {
        onUpdated(updated);
        onClose();
      }, 1200);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        'Failed to update email. Please try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !success) handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel max-w-md p-6"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Update Email Address</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                For{' '}
                <span className="font-semibold text-gray-700">{getDisplayName(user)}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current email (read-only reference) */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 mb-0.5">Current email</p>
          <p className="text-sm font-medium text-gray-700">{user.email}</p>
        </div>

        {/* Info note */}
        <div className="mb-4 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Changing the email will mark it as <strong>unverified</strong>. A new
            verification email will be sent to the updated address. Admin email
            addresses cannot be changed.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800 font-medium">Email updated successfully.</p>
          </div>
        )}

        {/* New email input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            New Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="email"
              autoFocus
              value={newEmail}
              onChange={e => { setNewEmail(e.target.value); setError(null); }}
              placeholder="new.email@example.com"
              disabled={loading || success}
              className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm transition-all
                focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                disabled:opacity-60 disabled:cursor-not-allowed
                ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success || !newEmail.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
            ) : success ? (
              <><CheckCircle className="w-4 h-4" /> Updated</>
            ) : (
              <><Mail className="w-4 h-4" /> Update Email</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateEmailModal;