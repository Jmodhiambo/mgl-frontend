import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Mail, Clock, CheckCircle, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import { listContactMessages, updateContactMessageStatus, deleteContactMessage } from '@admin/services/adminService';
import { formatDateTime } from '@admin/utils/dummyData';
import type { ContactMessage } from '@admin/types';
import { adminEvents } from '@admin/utils/adminEvents';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTS   = ['all', 'new', 'pending', 'responded', 'closed', 'spam'];
const CATEGORY_OPTS = ['all', 'booking', 'payment', 'refund', 'event', 'general'];
const PAGE_SIZE     = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type ContactMessageStatus = 'new' | 'pending' | 'responded' | 'closed' | 'spam';

// Actions map 1-to-1 to statuses, plus delete which is separate
type QuickAction = ContactMessageStatus | 'delete';

// Map each action to the status it sets (delete is handled separately)
const ACTION_STATUS: Record<Exclude<QuickAction, 'delete'>, ContactMessageStatus> = {
  new:       'new',
  pending:   'pending',
  responded: 'responded',
  closed:    'closed',
  spam:      'spam',
};

// ─── Component ────────────────────────────────────────────────────────────────

const Messages: React.FC = () => {
  const [messages, setMessages]   = useState<ContactMessage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefresh]  = useState(false);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [catFilter, setCat]       = useState('all');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState<ContactMessage | null>(null);
  const [confirm, setConfirm]     = useState<{ action: QuickAction; msg: ContactMessage } | null>(null);
  const [actionLoading, setAL]    = useState(false);
  const [alert, setAlert]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefresh(true);
    try {
      const data = await listContactMessages();
      setMessages(data);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const filtered = useMemo(() => messages.filter(m => {
    const str = `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase();
    if (search && !str.includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (catFilter !== 'all' && m.category !== catFilter) return false;
    return true;
  }), [messages, search, statusFilter, catFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    new:       messages.filter(m => m.status === 'new').length,
    pending:   messages.filter(m => m.status === 'pending').length,
    responded: messages.filter(m => m.status === 'responded').length,
    closed:    messages.filter(m => m.status === 'closed').length,
    spam:      messages.filter(m => m.status === 'spam').length,
  }), [messages]);

  // ── Action handler ──────────────────────────────────────────────────────────
  const handleAction = async () => {
    if (!confirm) return;
    setAL(true);
    try {
      const { action, msg } = confirm;
      if (action === 'delete') {
        await deleteContactMessage(msg.id);
        setMessages(p => p.filter(m => m.id !== msg.id));
        if (selected?.id === msg.id) setSelected(null);
        setAlert({ type: 'success', msg: 'Message deleted.' });
      } else {
        const updated = await updateContactMessageStatus(msg.id, ACTION_STATUS[action]);
        setMessages(p => p.map(m => m.id === updated.id ? updated : m));
        if (selected?.id === msg.id) setSelected(updated);
        setAlert({ type: 'success', msg: 'Message status updated.' });
      }
      // Immediately refresh sidebar/header badge counts
      adminEvents.emit('badges:refresh');
    } catch {
      setAlert({ type: 'error', msg: 'Action failed. Please try again.' });
    } finally {
      setAL(false);
      setConfirm(null);
    }
  };

  // ── Labels & messages ───────────────────────────────────────────────────────
  const actionLabel: Record<QuickAction, string> = {
    new:       'Reopen Message',
    pending:   'Mark as Pending',
    responded: 'Mark as Responded',
    closed:    'Close Message',
    spam:      'Mark as Spam',
    delete:    'Delete Message',
  };

  const actionMessage: Record<QuickAction, string> = {
    new:       'Reopen this message from {name} and reset it back to new?',
    pending:   "Mark this message from {name} as pending? Use this when you're actively working on it.",
    responded: 'Mark this message from {name} as responded?',
    closed:    'Close this message from {name}?',
    spam:      'Mark this message from {name} as spam? It will be filtered from the main view.',
    delete:    'Permanently delete this message from {name}? This cannot be undone.',
  };

  // ── Status icon ─────────────────────────────────────────────────────────────
  const statusIcon = (s: string) => {
    if (s === 'new')       return <Clock      className="w-3.5 h-3.5 text-orange-500" />;
    if (s === 'pending')   return <RefreshCw  className="w-3.5 h-3.5 text-amber-500"  />;
    if (s === 'responded') return <Mail       className="w-3.5 h-3.5 text-blue-500"   />;
    if (s === 'closed')    return <CheckCircle className="w-3.5 h-3.5 text-gray-400"  />;
    return                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contact Messages</h1>
          <p className="page-subtitle">{messages.length} total messages</p>
        </div>
        <button
          onClick={() => loadMessages(true)}
          disabled={refreshing}
          className="btn-secondary btn-sm flex items-center gap-2 disabled:opacity-60"
          title="Refresh messages"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
        {([
          { label: 'New',       key: 'new',       cls: 'text-orange-600', border: 'border-orange-200' },
          { label: 'Pending',   key: 'pending',   cls: 'text-amber-600',  border: 'border-amber-200'  },
          { label: 'Responded', key: 'responded', cls: 'text-blue-600',   border: 'border-blue-200'   },
          { label: 'Closed',    key: 'closed',    cls: 'text-gray-600',   border: 'border-gray-200'   },
          { label: 'Spam',      key: 'spam',      cls: 'text-red-600',    border: 'border-red-200'    },
        ] as { label: string; key: keyof typeof counts; cls: string; border: string }[]).map(c => (
          <button
            key={c.key}
            onClick={() => { setStatus(c.key); setPage(1); }}
            className={`card-sm text-center border-2 transition-all hover:shadow-md cursor-pointer
              ${statusFilter === c.key ? `${c.border} shadow-sm` : 'border-transparent'}`}
          >
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.cls}`}>{counts[c.key]}</p>
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
              {STATUS_OPTS.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select value={catFilter} onChange={e => { setCat(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[140px]">
              {CATEGORY_OPTS.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
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
            {/* ── Desktop table ── */}
            <div className="hidden md:block table-wrapper rounded-none border-0">
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
                    <tr key={m.id} className={m.status === 'new' ? 'bg-orange-50/30' : ''}>
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
                      <td><span className="badge-gray capitalize">{m.category}</span></td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {statusIcon(m.status)}
                          <StatusBadge status={m.status} size="sm" />
                        </div>
                      </td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(m.created_at)}</td>
                      <td>
                        <MessageActionsMenu
                          message={m}
                          onView={() => setSelected(m)}
                          onAction={a => setConfirm({ action: a, msg: m })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(m => (
                <div key={m.id} className={`p-4 space-y-2 ${m.status === 'new' ? 'bg-orange-50/40' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{m.name}</p>
                      <p className="text-xs text-gray-500 truncate">{m.email}</p>
                    </div>
                    <MessageActionsMenu
                      message={m}
                      onView={() => setSelected(m)}
                      onAction={a => setConfirm({ action: a, msg: m })}
                    />
                  </div>
                  <button
                    onClick={() => setSelected(m)}
                    className="text-sm font-medium text-gray-800 hover:text-purple-700 text-left w-full truncate block"
                  >
                    {m.subject}
                  </button>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {statusIcon(m.status)}
                      <StatusBadge status={m.status} size="sm" />
                    </div>
                    <span className="badge-gray capitalize">{m.category}</span>
                    <span className="text-xs text-gray-400 font-mono">{m.reference_id}</span>
                  </div>
                  <p className="text-xs text-gray-400">{formatDateTime(m.created_at)}</p>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
              total={filtered.length}
              limit={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </SectionCard>

      {confirm && (
        <ConfirmDialog
          title={actionLabel[confirm.action]}
          message={actionMessage[confirm.action].replace('{name}', confirm.msg.name)}
          confirmLabel={actionLabel[confirm.action]}
          variant={confirm.action === 'spam' || confirm.action === 'delete' ? 'danger' : 'info'}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {selected && (
        <MessageDetailModal
          message={selected}
          onClose={() => setSelected(null)}
          onAction={a => setConfirm({ action: a, msg: selected })}
        />
      )}
    </div>
  );
};

// ─── Actions Dropdown ─────────────────────────────────────────────────────────

const MessageActionsMenu: React.FC<{
  message: ContactMessage;
  onView: () => void;
  onAction: (a: QuickAction) => void;
}> = ({ message, onView, onAction }) => {
  const [open, setOpen]       = useState(false);
  const [menuStyle, setStyle] = useState<React.CSSProperties>({});
  const triggerRef            = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const menuHeight = 220;
    const openUpward = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;
    setStyle(
      openUpward
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right, top: 'auto' }
        : { position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right },
    );
    setOpen(o => !o);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [open]);

  const s = message.status;

  const menu = open && createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
      <div style={{ ...menuStyle, zIndex: 9999 }}
        className="w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up"
      >
        <button onClick={() => { onView(); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700">
          <MessageSquare className="w-4 h-4 text-gray-400" /> Read Message
        </button>

        <div className="divider my-1" />

        {/* ── Forward transitions ── */}
        {s === 'new' && (
          <button onClick={() => { onAction('pending'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-amber-50 text-amber-700">
            <RefreshCw className="w-4 h-4" /> Mark Pending
          </button>
        )}
        {(s === 'new' || s === 'pending') && (
          <button onClick={() => { onAction('responded'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-blue-50 text-blue-700">
            <Mail className="w-4 h-4" /> Mark Responded
          </button>
        )}
        {s !== 'closed' && s !== 'spam' && (
          <button onClick={() => { onAction('closed'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700">
            <CheckCircle className="w-4 h-4" /> Close
          </button>
        )}
        {s !== 'spam' && (
          <button onClick={() => { onAction('spam'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600">
            <AlertTriangle className="w-4 h-4" /> Mark Spam
          </button>
        )}

        {/* ── Reopen ── */}
        {(s === 'closed' || s === 'spam') && (
          <button onClick={() => { onAction('new'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-emerald-50 text-emerald-700">
            <RefreshCw className="w-4 h-4" /> Reopen
          </button>
        )}

        <div className="divider my-1" />

        <button onClick={() => { onAction('delete'); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </>,
    document.body,
  );

  return (
    <>
      <button ref={triggerRef} onClick={handleOpen} className="btn-icon">
        <span className="text-xs font-medium text-gray-500">•••</span>
      </button>
      {menu}
    </>
  );
};

// ─── Message Detail Modal ─────────────────────────────────────────────────────

const MessageDetailModal: React.FC<{
  message: ContactMessage;
  onClose: () => void;
  onAction: (a: QuickAction) => void;
}> = ({ message, onClose, onAction }) => {
  const s = message.status;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-2xl p-6" onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs text-gray-500 font-mono mb-1">{message.reference_id}</p>
            <h3 className="text-xl font-bold text-gray-900">{message.subject}</h3>
          </div>
          <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
        </div>

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

        <div className="flex items-center gap-2 mb-4">
          <span className="badge-gray capitalize">{message.category}</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{message.message}</p>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-100 flex-wrap">
          <button onClick={onClose} className="btn-secondary flex-1">Close</button>

          {s === 'new' && (
            <button onClick={() => { onAction('pending'); onClose(); }}
              className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Mark Pending
            </button>
          )}
          {(s === 'new' || s === 'pending') && (
            <button onClick={() => { onAction('responded'); onClose(); }}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Mark Responded
            </button>
          )}
          {s !== 'closed' && s !== 'spam' && (
            <button onClick={() => { onAction('closed'); onClose(); }}
              className="btn-secondary flex-1">
              Close Ticket
            </button>
          )}
          {(s === 'closed' || s === 'spam') && (
            <button onClick={() => { onAction('new'); onClose(); }}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reopen
            </button>
          )}

          {/* Icon-only danger actions to avoid crowding */}
          {s !== 'spam' && (
            <button onClick={() => { onAction('spam'); onClose(); }}
              title="Mark as Spam"
              className="btn-danger flex items-center justify-center px-3">
              <AlertTriangle className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => { onAction('delete'); onClose(); }}
            title="Delete Message"
            className="btn-danger flex items-center justify-center px-3">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;