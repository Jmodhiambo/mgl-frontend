// src/apps/admin/components/modals/ticketTypes/SuspendTicketTypeModal.tsx
import { useState } from 'react';
import { Ban } from 'lucide-react';
import type { AdminTicketType } from '@admin/types';

interface Props {
  ticket: AdminTicketType;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

const SuspendTicketTypeModal: React.FC<Props> = ({ ticket, onCancel, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [error, setError]   = useState('');

  const submit = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError('Please give a reason (at least 3 characters).');
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-slide-up">
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Ban className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Suspend Ticket Type</h3>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">"{ticket.name}"</span> will be
              immediately deactivated. The organizer will not be able to reactivate it themselves
              until an admin lifts the suspension.
            </p>
          </div>
        </div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={e => { setReason(e.target.value); setError(''); }}
          rows={3}
          placeholder="e.g. Reported fraud, chargeback dispute, policy violation…"
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all resize-none ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
          autoFocus
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 btn-secondary">Cancel</button>
          <button
            onClick={submit}
            className="flex-1 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
          >
            Suspend
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendTicketTypeModal;