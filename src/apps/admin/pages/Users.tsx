// src/apps/admin/pages/Users.tsx
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UserPlus, Download, Filter, MoreVertical, Eye,
  ShieldCheck, ShieldOff, UserCheck, UserX, Trash2,
  ChevronDown, X,
} from 'lucide-react';
import {
  FilterBar, StatusBadge, ConfirmDialog, SectionCard,
  Pagination, TableSkeleton, EmptyState, AlertBanner,
} from '@admin/components/ui';
import {
  listAllUsers, deleteUser, activateUser, deactivateUser,
  verifyUserEmail, promoteToOrganizer, promoteToAdmin, demoteFromAdmin,
} from '@admin/services/adminService';
import { formatDateTime } from '@admin/utils/dummyData';
import type { AdminUser } from '@admin/types';

type Action = 'delete' | 'activate' | 'deactivate' | 'verify' | 'promote-org' | 'promote-admin' | 'demote-admin';

const ROLES = ['all', 'user', 'organizer', 'admin'];
const STATUS_FILTERS = ['all', 'active', 'inactive', 'verified', 'unverified'];
const PAGE_SIZE = 10;

const Users: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState(searchParams.get('search') ?? '');
  const [roleFilter, setRole]   = useState('all');
  const [statusFilter, setStatus] = useState('all');
  const [page, setPage]         = useState(1);
  const [confirm, setConfirm]   = useState<{ action: Action; user: AdminUser } | null>(null);
  const [actionLoading, setAL]  = useState(false);
  const [alert, setAlert]       = useState<{ type: 'success'|'error'; msg: string } | null>(null);
  const [detailUser, setDetail] = useState<AdminUser | null>(null);

  useEffect(() => {
    listAllUsers().then(data => { setUsers(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const name = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase();
      if (search && !name.includes(search.toLowerCase())) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.is_active) return false;
      if (statusFilter === 'inactive' && u.is_active) return false;
      if (statusFilter === 'verified' && !u.is_verified) return false;
      if (statusFilter === 'unverified' && u.is_verified) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAction = async () => {
    if (!confirm) return;
    setAL(true);
    try {
      const { action, user } = confirm;
      let updated: AdminUser | null = null;
      if (action === 'delete')          { await deleteUser(user.id); setUsers(p => p.filter(u => u.id !== user.id)); }
      else if (action === 'activate')   updated = await activateUser(user.id);
      else if (action === 'deactivate') updated = await deactivateUser(user.id);
      else if (action === 'verify')     updated = await verifyUserEmail(user.id);
      else if (action === 'promote-org') updated = await promoteToOrganizer(user.id);
      else if (action === 'promote-admin') updated = await promoteToAdmin(user.id);
      else if (action === 'demote-admin')  updated = await demoteFromAdmin(user.id);
      if (updated) setUsers(p => p.map(u => u.id === updated!.id ? updated! : u));
      setAlert({ type: 'success', msg: 'Action completed successfully.' });
    } catch {
      setAlert({ type: 'error', msg: 'Action failed. Please try again.' });
    } finally {
      setAL(false);
      setConfirm(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['ID','Name','Email','Role','Active','Verified','Created'],
      ...filtered.map(u => [
        u.id, `${u.first_name} ${u.last_name}`, u.email,
        u.role, u.is_active, u.is_verified, u.created_at,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'users.csv'; a.click();
  };

  const actionLabels: Record<Action, string> = {
    delete: 'Delete User', activate: 'Activate User', deactivate: 'Deactivate User',
    verify: 'Verify Email', 'promote-org': 'Promote to Organizer',
    'promote-admin': 'Promote to Admin', 'demote-admin': 'Demote from Admin',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{filtered.length} users · {users.filter(u => u.is_active).length} active</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Alert */}
      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        placeholder="Search by name or email…"
        filters={
          <>
            <select value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[120px]">
              {ROLES.map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[140px]">
              {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </>
        }
      />

      {/* Table */}
      <SectionCard
        title="All Users"
        subtitle={`Showing ${paginated.length} of ${filtered.length}`}
        noPadding
      >
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={7} /></div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={UserPlus} title="No users found" description="Try adjusting your filters" />
        ) : (
          <>
            <div className="table-wrapper rounded-none border-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(user => (
                    <tr key={user.id}>
                      <td className="text-gray-400 text-xs">{user.id}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full purple-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={user.role} /></td>
                      <td>
                        <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td>
                        {user.is_verified
                          ? <span className="badge-success">Verified</span>
                          : <span className="badge-warning">Unverified</span>}
                      </td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(user.created_at)}
                      </td>
                      <td>
                        <UserActionsMenu user={user} onAction={(a) => setConfirm({ action: a, user })} onView={() => setDetail(user)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          title={actionLabels[confirm.action]}
          message={`Are you sure you want to ${confirm.action.replace('-', ' ')} ${confirm.user.first_name} ${confirm.user.last_name}? This action cannot be undone.`}
          confirmLabel={actionLabels[confirm.action]}
          variant={confirm.action === 'delete' || confirm.action === 'deactivate' ? 'danger' : 'info'}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {/* Detail Modal */}
      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetail(null)} />}
    </div>
  );
};

// ─── User Actions Dropdown ────────────────────────────────────────────────────
const UserActionsMenu: React.FC<{
  user: AdminUser;
  onAction: (a: Action) => void;
  onView: () => void;
}> = ({ user, onAction, onView }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="btn-icon">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm animate-slide-up">
            <button onClick={() => { onView(); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700">
              <Eye className="w-4 h-4 text-gray-400" /> View Details
            </button>
            <div className="divider my-1" />
            {user.is_active
              ? <button onClick={() => { onAction('deactivate'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600">
                  <UserX className="w-4 h-4" /> Deactivate
                </button>
              : <button onClick={() => { onAction('activate'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-emerald-50 text-emerald-600">
                  <UserCheck className="w-4 h-4" /> Activate
                </button>
            }
            {!user.is_verified && (
              <button onClick={() => { onAction('verify'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-blue-50 text-blue-600">
                <ShieldCheck className="w-4 h-4" /> Verify Email
              </button>
            )}
            {user.role === 'user' && (
              <>
                <button onClick={() => { onAction('promote-org'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-600">
                  <ShieldCheck className="w-4 h-4" /> Promote to Organizer
                </button>
                <button onClick={() => { onAction('promote-admin'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-600">
                  <ShieldCheck className="w-4 h-4" /> Promote to Admin
                </button>
              </>
            )}
            {user.role === 'organizer' && (
              <button onClick={() => { onAction('promote-admin'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-purple-50 text-purple-600">
                <ShieldCheck className="w-4 h-4" /> Promote to Admin
              </button>
            )}
            {user.role === 'admin' && (
              <button onClick={() => { onAction('demote-admin'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-amber-50 text-amber-600">
                <ShieldOff className="w-4 h-4" /> Demote to User
              </button>
            )}
            <div className="divider my-1" />
            <button onClick={() => { onAction('delete'); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600">
              <Trash2 className="w-4 h-4" /> Delete User
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── User Detail Modal ────────────────────────────────────────────────────────
const UserDetailModal: React.FC<{ user: AdminUser; onClose: () => void }> = ({ user, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-panel max-w-lg p-6" onClick={e => e.stopPropagation()}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl purple-gradient flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user.first_name} {user.last_name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          ['User ID', `#${user.id}`],
          ['Role', user.role],
          ['Status', user.is_active ? 'Active' : 'Inactive'],
          ['Email Verified', user.is_verified ? 'Yes' : 'No'],
          ['Phone', user.phone ?? 'N/A'],
          ['Joined', formatDateTime(user.created_at)],
          ['Last Updated', formatDateTime(user.updated_at)],
        ].map(([label, value]) => (
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