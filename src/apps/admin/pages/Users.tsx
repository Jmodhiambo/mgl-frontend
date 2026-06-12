// src/apps/admin/pages/Users.tsx
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  UserPlus, Download, MoreVertical, Eye,
  ShieldCheck, ShieldOff, UserCheck, UserX, Trash2, X, Mail,
} from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import {
  listAllUsers, deleteUser, activateUser, deactivateUser,
  resendVerificationEmail, updateUserRole
} from '@admin/services/adminService';
import { formatDateTime } from '@admin/utils/format';
import type { AdminUser } from '@admin/types';
import UpdateEmailModal from '@admin/components/modals/users/UpdateEmailModal';

type Action = 'delete' | 'activate' | 'deactivate' | 'resend-verification' | 'promote-org' | 'promote-admin' | 'demote-org' | 'demote-admin';
type NewUserRole = 'user' | 'organizer' | 'admin';

interface NewUserForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: NewUserRole;
}

const ROLES = ['all', 'user', 'organizer', 'admin'];
const STATUS_FILTERS = ['all', 'active', 'inactive', 'verified', 'unverified'];
const PAGE_SIZE = 10;

const roleDescriptions: Record<NewUserRole, string> = {
  user: 'Standard account. Can browse events and make bookings.',
  organizer: "Can create and manage events. They'll be notified on first login to complete their organizer profile.",
  admin: 'Full access to the admin panel. Grant with caution.',
};

const roleColors: Record<NewUserRole, string> = {
  user: 'border-blue-500 bg-blue-50 text-blue-700',
  organizer: 'border-purple-500 bg-purple-50 text-purple-700',
  admin: 'border-red-500 bg-red-50 text-red-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDisplayName(user: AdminUser): string {
  if ((user as any).name) return (user as any).name as string;
  const full = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  return full || 'Unknown';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0].charAt(0) + (parts[0].charAt(1) || '')).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getPhoneNumber(user: AdminUser): string {
  return (user as any).phone_number ?? (user as any).phone ?? 'N/A';
}

// ─── Create User Modal ────────────────────────────────────────────────────────

const CreateUserModal: React.FC<{
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
}> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState<NewUserForm>({
    first_name: '', last_name: '', email: '', password: '', role: 'user',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NewUserForm, string>>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: Partial<Record<keyof NewUserForm, string>> = {};
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.last_name.trim())  e.last_name  = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'A valid email is required';
    if (form.password.length < 8) e.password = 'Min. 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const fullName = `${form.first_name} ${form.last_name}`.trim();
      const newUser: AdminUser = {
        id: Math.floor(Math.random() * 9000) + 1000,
        ...(({ name: fullName } as any)),
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        role:       form.role,
        is_active:  true,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onCreated(newUser);
    } catch {
      setErrors({ email: 'Failed to create user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const cls = (key: keyof NewUserForm) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Create New User</h3>
            <p className="text-sm text-gray-500 mt-0.5">Add a user, organizer, or admin account.</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={form.first_name} placeholder="Jane"
                onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                className={cls('first_name')} />
              {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={form.last_name} placeholder="Doe"
                onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                className={cls('last_name')} />
              {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={form.email} placeholder="jane@example.com"
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className={cls('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} placeholder="Min. 8 characters"
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className={cls('password')} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['user', 'organizer', 'admin'] as NewUserRole[]).map(r => (
                <button key={r} type="button"
                  onClick={() => setForm(p => ({ ...p, role: r }))}
                  className={`py-2.5 px-3 rounded-lg border-2 text-sm font-semibold transition-all capitalize ${
                    form.role === r ? roleColors[r] : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
              {roleDescriptions[form.role]}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              : <><UserPlus className="w-4 h-4" /> Create User</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const Users: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers]               = useState<AdminUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState(searchParams.get('search') ?? '');
  const [roleFilter, setRole]           = useState('all');
  const [statusFilter, setStatus]       = useState('all');
  const [page, setPage]                 = useState(1);
  const [confirm, setConfirm]           = useState<{ action: Action; user: AdminUser } | null>(null);
  const [actionLoading, setAL]          = useState(false);
  const [alert, setAlert]               = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [detailUser, setDetail]         = useState<AdminUser | null>(null);
  const [showCreate, setShowCreate]     = useState(false);
  // ── Update email modal state ──────────────────────────────────────────────
  const [emailTarget, setEmailTarget]   = useState<AdminUser | null>(null);

  useEffect(() => {
    listAllUsers().then(data => { setUsers(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => users.filter(u => {
    const name = `${getDisplayName(u)} ${u.email}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter === 'active'     && !u.is_active)  return false;
    if (statusFilter === 'inactive'   &&  u.is_active)  return false;
    if (statusFilter === 'verified'   && !u.is_verified) return false;
    if (statusFilter === 'unverified' &&  u.is_verified) return false;
    return true;
  }), [users, search, roleFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAction = async () => {
    if (!confirm) return;
    setAL(true);
    try {
      const { action, user } = confirm;
      let updated: AdminUser | null = null;
      if      (action === 'delete')             { await deleteUser(user.id); setUsers(p => p.filter(u => u.id !== user.id)); }
      else if (action === 'activate')           updated = await activateUser(user.id);
      else if (action === 'deactivate')         updated = await deactivateUser(user.id);
      else if (action === 'resend-verification') {
        const res = await resendVerificationEmail(user.id);
        setAlert({ type: 'success', msg: res.message });
        setAL(false); setConfirm(null); return;
      }
      else if (action === 'promote-org')   updated = await updateUserRole(user.id, 'organizer');
      else if (action === 'promote-admin') updated = await updateUserRole(user.id, 'admin');
      else if (action === 'demote-org')    updated = await updateUserRole(user.id, 'user');
      else if (action === 'demote-admin')  updated = await updateUserRole(user.id, 'user');
      
      if (updated) setUsers(p => p.map(u => u.id === updated!.id ? updated! : u));
      setAlert({ type: 'success', msg: 'Action completed successfully.' });
    } catch {
      setAlert({ type: 'error', msg: 'Action failed. Please try again.' });
    } finally { setAL(false); setConfirm(null); }
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Email', 'Role', 'Active', 'Verified', 'Created'],
      ...filtered.map(u => [u.id, getDisplayName(u), u.email, u.role, u.is_active, u.is_verified, u.created_at]),
    ];
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'));
    a.download = 'users.csv'; a.click();
  };

  const actionLabels: Record<Action, string> = {
    delete: 'Delete User', activate: 'Activate User', deactivate: 'Deactivate User',
    'resend-verification': 'Resend Verification Email', 'promote-org': 'Promote to Organizer',
    'promote-admin': 'Promote to Admin', 'demote-admin': 'Demote from Admin',
    'demote-org': 'Demote from Organizer',
  };

  const actionMessages: Record<Action, string> = {
    delete:                `Are you sure you want to delete {name}? This action cannot be undone.`,
    activate:              `Activate {name}'s account?`,
    deactivate:            `Deactivate {name}'s account? They won't be able to log in until reactivated.`,
    'resend-verification': `Resend a verification email to {name} at {email}? They originally received one on sign-up but haven't verified yet.`,
    'promote-org':         `Promote {name} to Organizer? They'll be able to create and manage events.`,
    'promote-admin':       `Promote {name} to Admin? They'll have full access to this panel. Proceed with caution.`,
    'demote-admin':        `Demote {name} from Admin to User? They'll lose access to this panel immediately.`,
    'demote-org':          `Demote {name} from Organizer to User? They'll lose the ability to manage events.`,
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{filtered.length} users · {users.filter(u => u.is_active).length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Create User</span>
          </button>
          <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <FilterBar
        search={search} onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search by name or email…"
        filters={
          <>
            <select value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1); }} className="select-field w-auto min-w-[120px]">
              {ROLES.map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} className="select-field w-auto min-w-[140px]">
              {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </>
        }
      />

      <SectionCard title="All Users" subtitle={`Showing ${paginated.length} of ${filtered.length}`} noPadding>
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={7} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={UserPlus} title="No users found" description="Try adjusting your filters" />
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr><th>#</th><th>User</th><th>Role</th><th>Status</th><th>Verified</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {paginated.map(user => (
                    <tr key={user.id}>
                      <td className="text-gray-400 text-xs">{user.id}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full purple-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(getDisplayName(user))}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{getDisplayName(user)}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={user.role} /></td>
                      <td><StatusBadge status={user.is_active ? 'active' : 'inactive'} /></td>
                      <td>
                        {user.is_verified
                          ? <span className="badge-success">Verified</span>
                          : <span className="badge-warning">Unverified</span>}
                      </td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(user.created_at)}</td>
                      <td>
                        <UserActionsMenu
                          user={user}
                          onAction={a => setConfirm({ action: a, user })}
                          onView={() => setDetail(user)}
                          onUpdateEmail={() => setEmailTarget(user)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map(user => (
                <div key={user.id} className="flex items-start gap-3 p-4">
                  <div className="w-10 h-10 rounded-full purple-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getInitials(getDisplayName(user))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900 truncate">{getDisplayName(user)}</p>
                      <UserActionsMenu
                        user={user}
                        onAction={a => setConfirm({ action: a, user })}
                        onView={() => setDetail(user)}
                        onUpdateEmail={() => setEmailTarget(user)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={user.role} />
                      <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                      {user.is_verified
                        ? <span className="badge-success">Verified</span>
                        : <span className="badge-warning">Unverified</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Joined {formatDateTime(user.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} total={filtered.length} limit={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </SectionCard>

      {confirm && (
        <ConfirmDialog
          title={actionLabels[confirm.action]}
          message={actionMessages[confirm.action]
            .replace('{name}', getDisplayName(confirm.user))
            .replace('{email}', confirm.user.email)}
          confirmLabel={actionLabels[confirm.action]}
          variant={confirm.action === 'delete' || confirm.action === 'deactivate' ? 'danger' : 'info'}
          onConfirm={handleAction} onCancel={() => setConfirm(null)} loading={actionLoading}
        />
      )}

      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetail(null)} />}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={newUser => {
            setUsers(p => [newUser, ...p]);
            setShowCreate(false);
            setAlert({ type: 'success', msg: `${getDisplayName(newUser)} created successfully as ${newUser.role}.` });
          }}
        />
      )}

      {/* ── Update Email Modal ── */}
      {emailTarget && (
        <UpdateEmailModal
          user={emailTarget}
          onClose={() => setEmailTarget(null)}
          onUpdated={updated => {
            setUsers(p => p.map(u => u.id === updated.id ? updated : u));
            setEmailTarget(null);
            setAlert({ type: 'success', msg: `Email updated for ${getDisplayName(updated)}.` });
          }}
        />
      )}
    </div>
  );
};

// ─── User Actions Dropdown ────────────────────────────────────────────────────

const UserActionsMenu: React.FC<{
  user: AdminUser;
  onAction: (a: Action) => void;
  onView: () => void;
  onUpdateEmail: () => void;
}> = ({ user, onAction, onView, onUpdateEmail }) => {
  const [open, setOpen]       = useState(false);
  const [menuStyle, setStyle] = useState<React.CSSProperties>({});
  const triggerRef            = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 340; // approx — enough for all items
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;
    setStyle(
      openUpward
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right, top: 'auto' }
        : { position: 'fixed', top: rect.bottom + 4, right: window.innerWidth - rect.right },
    );
    setOpen(o => !o);
  }, []);

  // Close on scroll/resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [open]);

  const menu = open && createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
      <div
        style={{ ...menuStyle, zIndex: 9999 }}
        className="w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up"
      >
        <button onClick={() => { onView(); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700">
          <Eye className="w-4 h-4 text-gray-400" /> View Details
        </button>

        <div className="divider my-1" />

        {/* ── Status actions ── */}
        {user.is_active
          ? <button onClick={() => { onAction('deactivate'); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600">
              <UserX className="w-4 h-4" /> Deactivate
            </button>
          : <button onClick={() => { onAction('activate'); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" /> Activate
            </button>
        }
        {!user.is_verified && (
          <button onClick={() => { onAction('resend-verification'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-blue-50 text-blue-600">
            <Mail className="w-4 h-4" /> Resend Verification Email
          </button>
        )}

        {/* ── Role actions ── */}
        {user.role === 'user' && (
          <>
            <button onClick={() => { onAction('promote-org'); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-600">
              <ShieldCheck className="w-4 h-4" /> Promote to Organizer
            </button>
            <button onClick={() => { onAction('promote-admin'); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-600">
              <ShieldCheck className="w-4 h-4" /> Promote to Admin
            </button>
          </>
        )}
        {user.role === 'organizer' && (
          <>
            <button onClick={() => { onAction('promote-admin'); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-600">
              <ShieldCheck className="w-4 h-4" /> Promote to Admin
            </button>
            <button onClick={() => { onAction('demote-org'); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-amber-50 text-amber-600">
              <ShieldOff className="w-4 h-4" /> Demote to User
            </button>
          </>
        )}
        {user.role === 'admin' && (
          <button onClick={() => { onAction('demote-admin'); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-amber-50 text-amber-600">
            <ShieldOff className="w-4 h-4" /> Demote to User
          </button>
        )}

        <div className="divider my-1" />

        {/* ── Update email — disabled for admins ── */}
        <button
          onClick={() => { onUpdateEmail(); setOpen(false); }}
          disabled={user.role === 'admin'}
          title={user.role === 'admin' ? 'Admin email addresses cannot be changed' : undefined}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-blue-50 text-blue-600
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:text-gray-400"
        >
          <Mail className="w-4 h-4" /> Update Email
        </button>

        <div className="divider my-1" />

        <button onClick={() => { onAction('delete'); setOpen(false); }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600">
          <Trash2 className="w-4 h-4" /> Delete User
        </button>
      </div>
    </>,
    document.body,
  );

  return (
    <>
      <button ref={triggerRef} onClick={handleOpen} className="btn-icon">
        <MoreVertical className="w-4 h-4" />
      </button>
      {menu}
    </>
  );
};

// ─── User Detail Modal ────────────────────────────────────────────────────────

const UserDetailModal: React.FC<{ user: AdminUser; onClose: () => void }> = ({ user, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-panel max-w-lg p-6" onClick={e => e.stopPropagation()}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl purple-gradient flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {getInitials(getDisplayName(user))}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{getDisplayName(user)}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {([
          ['User ID',       `#${user.id}`],
          ['Role',          user.role],
          ['Status',        user.is_active ? 'Active' : 'Inactive'],
          ['Email Verified',user.is_verified ? 'Yes' : 'No'],
          ['Phone',         getPhoneNumber(user)],
          ['Joined',        formatDateTime(user.created_at)],
          ['Last Updated',  formatDateTime(user.updated_at)],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
        <button onClick={onClose} className="btn-secondary flex-1">Close</button>
      </div>
    </div>
  </div>
);

export default Users;