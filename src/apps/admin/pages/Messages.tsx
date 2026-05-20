// src/apps/admin/pages/Messages.tsx
import { useEffect, useState, useMemo } from 'react';
import { MessageSquare, X, Mail, Clock, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import {
  listContactMessages, markMessageAsResponded,
  markMessageAsClosed, markMessageAsSpam,
} from '@admin/services/adminService';
import { formatDateTime } from '@admin/utils/dummyData';
import type { ContactMessage } from '@admin/types';

const STATUS_OPTS = ['all', 'open', 'responded', 'closed', 'spam'];
const CATEGORY_OPTS = ['all', 'booking', 'payment', 'refund', 'event', 'general'];
const PAGE_SIZE = 10;

type QuickAction = 'respond' | 'close' | 'spam';

const Messages: React.FC = () => {
  const [messages, setMessages]   = useState<ContactMessage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [catFilter, setCat]       = useState('all');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState<ContactMessage | null>(null);
  const [confirm, setConfirm]     = useState<{ action: QuickAction; msg: ContactMessage } | null>(null);
  const [actionLoading, setAL]    = useState(false);
  const [alert, setAlert]         = useState<{ type: 'success'|'error'; msg: string } | null>(null);

  useEffect(() => {
    listContactMessages().then(data => { setMessages(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return messages.filter(m => {
      const str = `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase();
      if (search && !str.includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (catFilter !== 'all' && m.category !== catFilter) return false;
      return true;
    });
  }, [messages, search, statusFilter, catFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    open:      messages.filter(m => m.status === 'open').length,
    responded: messages.filter(m => m.status === 'responded').length,
    closed:    messages.filter(m => m.status === 'closed').length,
    spam:      messages.filter(m => m.status === 'spam').length,
  }), [messages]);

  const handleAction = async () => {
    if (!confirm) return;
    setAL(true);
    try {
      const { action, msg } = confirm;
      let updated: ContactMessage;
      if (action === 'respond') updated = await markMessageAsResponded(msg.id);
      else if (action === 'close') updated = await markMessageAsClosed(msg.id);
      else updated = await markMessageAsSpam(msg.id);
      setMessages(p => p.map(m => m.id === updated.id ? updated : m));
      if (selected?.id === msg.id) setSelected(updated);
      setAlert({ type: 'success', msg: 'Message status updated.' });
    } catch {
      setAlert({ type: 'error', msg: 'Action failed.' });
    } finally {
      setAL(false);
      setConfirm(null);
    }
  };

  const actionLabel: Record<QuickAction, string> = {
    respond: 'Mark as Responded',
    close: 'Close Message',
    spam: 'Mark as Spam',
  };

  const statusIcon = (status: string) => {
    if (status === 'open') return <Clock className="w-3.5 h-3.5 text-orange-500" />;
    if (status === 'responded') return <Mail className="w-3.5 h-3.5 text-blue-500" />;
    if (status === 'closed') return <CheckCircle className="w-3.5 h-3.5 text-gray-400" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contact Messages</h1>
          <p className="page-subtitle">{messages.length} total messages</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {[
          { label: 'Open',      value: counts.open,      cls: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', onClick: () => setStatus('open') },
          { label: 'Responded', value: counts.responded, cls: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   onClick: () => setStatus('responded') },
          { label: 'Closed',    value: counts.closed,    cls: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200',   onClick: () => setStatus('closed') },
          { label: 'Spam',      value: counts.spam,      cls: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    onClick: () => setStatus('spam') },
        ].map(c => (
          <button key={c.label}
            onClick={() => { c.onClick(); setPage(1); }}
            className={`card-sm text-center border-2 transition-all hover:shadow-md cursor-pointer
              ${statusFilter === c.label.toLowerCase() ? `${c.border} shadow-sm` : 'border-transparent'}`}
          >
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.cls}`}>{c.value}</p>
          </button>
        ))}
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search by name, email, subject…"
        filters={
          <>
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[130px]">
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
            <select value={catFilter} onChange={e => { setCat(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[140px]">
              {CATEGORY_OPTS.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </>
        }
        actions={
          statusFilter !== 'all' && (
            <button onClick={() => setStatus('all')} className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filter
            </button>
          )
        }
      />

      <SectionCard title="Messages" subtitle={`${filtered.length} results`} noPadding>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={6} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No messages found" />
        ) : (
          <>
            <div className="table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Sender</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(m => (
                    <tr key={m.id} className={m.status === 'open' ? 'bg-orange-50/30' : ''}>
                      <td className="text-xs text-gray-400 font-mono">{m.reference_id}</td>
                      <td>
                        <p className="font-medium text-sm text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.email}</p>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelected(m)}
                          className="text-sm text-left text-gray-800 hover:text-purple-700 font-medium truncate max-w-[200px] block"
                        >
                          {m.subject}
                        </button>
                      </td>
                      <td>
                        <span className="badge-gray capitalize">{m.category}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {statusIcon(m.status)}
                          <StatusBadge status={m.status} size="sm" />
                        </div>
                      </td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(m.created_at)}
                      </td>
                      <td>
                        <MessageActionsMenu
                          message={m}
                          onView={() => setSelected(m)}
                          onAction={(a) => setConfirm({ action: a, msg: m })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} total={filtered.length} limit={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </SectionCard>

      {confirm && (
        <ConfirmDialog
          title={actionLabel[confirm.action]}
          message={`Mark message from ${confirm.msg.name} as "${confirm.action}"?`}
          confirmLabel={actionLabel[confirm.action]}
          variant={confirm.action === 'spam' ? 'danger' : 'info'}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {selected && (
        <MessageDetailModal
          message={selected}
          onClose={() => setSelected(null)}
          onAction={(a) => setConfirm({ action: a, msg: selected })}
        />
      )}
    </div>
  );
};

// ─── Actions dropdown ─────────────────────────────────────────────────────────
const MessageActionsMenu: React.FC<{
  message: ContactMessage;
  onView: () => void;
  onAction: (a: QuickAction) => void;
}> = ({ message, onView, onAction }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="btn-icon">
        <span className="text-xs font-medium text-gray-500">•••</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up">
            <button onClick={() => { onView(); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700">
              <MessageSquare className="w-4 h-4 text-gray-400" /> Read Message
            </button>
            {message.status === 'open' && (
              <button onClick={() => { onAction('respond'); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-blue-50 text-blue-700">
                <Mail className="w-4 h-4" /> Mark Responded
              </button>
            )}
            {message.status !== 'closed' && message.status !== 'spam' && (
              <button onClick={() => { onAction('close'); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700">
                <CheckCircle className="w-4 h-4" /> Close
              </button>
            )}
            {message.status !== 'spam' && (
              <button onClick={() => { onAction('spam'); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600">
                <Trash2 className="w-4 h-4" /> Mark Spam
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Message Detail Modal ─────────────────────────────────────────────────────
const MessageDetailModal: React.FC<{
  message: ContactMessage;
  onClose: () => void;
  onAction: (a: QuickAction) => void;
}> = ({ message, onClose, onAction }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-panel max-w-2xl p-6" onClick={e => e.stopPropagation()}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-gray-500 font-mono mb-1">{message.reference_id}</p>
          <h3 className="text-xl font-bold text-gray-900">{message.subject}</h3>
        </div>
        <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
      </div>

      {/* Sender info */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-5">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
          {message.name.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{message.name}</p>
          <p className="text-sm text-gray-500">{message.email}</p>
          {message.phone && <p className="text-sm text-gray-500">{message.phone}</p>}
        </div>
        <div className="text-right">
          <StatusBadge status={message.status} />
          <p className="text-xs text-gray-400 mt-1">{formatDateTime(message.created_at)}</p>
        </div>
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 mb-4">
        <span className="badge-gray capitalize">{message.category}</span>
      </div>

      {/* Message body */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{message.message}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="btn-secondary flex-1">Close</button>
        {message.status === 'open' && (
          <button onClick={() => { onAction('respond'); onClose(); }}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> Mark as Responded
          </button>
        )}
        {message.status !== 'closed' && message.status !== 'spam' && (
          <button onClick={() => { onAction('close'); onClose(); }}
            className="btn-secondary flex-1">
            Close Ticket
          </button>
        )}
        {message.status !== 'spam' && (
          <button onClick={() => { onAction('spam'); onClose(); }}
            className="btn-danger flex-1 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Spam
          </button>
        )}
      </div>
    </div>
  </div>
);

export default Messages;