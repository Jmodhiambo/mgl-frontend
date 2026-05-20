// src/apps/admin/components/ui/index.tsx
// ─── Shared UI building blocks for the admin app ────────────────────────────

import { X, AlertTriangle, CheckCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Status Badge ─────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusMap: Record<string, string> = {
  // User
  active:       'badge-success',
  inactive:     'badge-gray',
  verified:     'badge-info',
  unverified:   'badge-warning',
  // Event
  upcoming:     'badge-info',
  ongoing:      'badge-success',
  completed:    'badge-gray',
  cancelled:    'badge-danger',
  deleted:      'badge-danger',
  draft:        'badge-gray',
  approved:     'badge-success',
  unapproved:   'badge-warning',
  pending:      'badge-warning',
  // Booking
  confirmed:    'badge-success',
  refunded:     'badge-purple',
  // Payment
  'failed':     'badge-danger',
  // Message
  open:         'badge-orange',
  responded:    'badge-info',
  closed:       'badge-gray',
  spam:         'badge-danger',
  // Roles
  admin:        'badge-purple',
  organizer:    'badge-info',
  user:         'badge-gray',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const cls = statusMap[status.toLowerCase()] ?? 'badge-gray';
  return (
    <span className={`${cls} ${size === 'sm' ? 'text-xs px-2 py-px' : ''}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title, message, confirmLabel = 'Confirm',
  variant = 'danger', onConfirm, onCancel, loading,
}) => {
  const Icon = variant === 'danger' ? AlertTriangle
    : variant === 'warning' ? AlertTriangle : Info;
  const iconColor = variant === 'danger' ? 'text-red-600 bg-red-100'
    : variant === 'warning' ? 'text-amber-600 bg-amber-100' : 'text-blue-600 bg-blue-100';
  const btnCls = variant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button onClick={onCancel} className="btn-icon -mt-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`${btnCls} flex-1`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />Confirming…
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Spinner ─────────────────────────────────────────────────────────────────
interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; color?: string; }
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'border-purple-600' }) => {
  const sizeMap = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-[3px]' };
  return (
    <div className={`${sizeMap[size]} ${color} border-t-transparent rounded-full animate-spin`} />
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon, title, description, action,
}) => (
  <div className="empty-state">
    {Icon && (
      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-purple-300" />
      </div>
    )}
    <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
    {action && (
      <button onClick={action.onClick} className="btn-primary btn-sm mt-4">
        {action.label}
      </button>
    )}
  </div>
);

// ─── Page Loader ──────────────────────────────────────────────────────────────
export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  </div>
);

// ─── Toast / Alert Banner ─────────────────────────────────────────────────────
interface AlertBannerProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}
export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onClose }) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error:   'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800',
  };
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertTriangle : Info;
  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-2">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}
export const Pagination: React.FC<PaginationProps> = ({
  page, totalPages, total, limit, onPageChange,
}) => {
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
      <span>Showing <strong>{from}–{to}</strong> of <strong>{total}</strong></span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-icon disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                ${p === page
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-icon disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Search + Filter Bar ──────────────────────────────────────────────────────
interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}
export const FilterBar: React.FC<FilterBarProps> = ({
  search, onSearchChange, placeholder = 'Search…', filters, actions,
}) => (
  <div className="flex flex-wrap items-center gap-3 mb-5">
    <div className="relative flex-1 min-w-[200px]">
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9"
      />
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    {filters}
    {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
  </div>
);

// ─── Data Table Skeleton ──────────────────────────────────────────────────────
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 6, cols = 5,
}) => (
  <div className="table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i}><div className="skeleton h-3 w-20" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}><div className={`skeleton h-4 ${c === 0 ? 'w-8' : c === 1 ? 'w-32' : 'w-20'}`} /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
interface SectionCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}
export const SectionCard: React.FC<SectionCardProps> = ({
  title, subtitle, actions, children, className = '', noPadding,
}) => (
  <div className={`card ${noPadding ? 'p-0 overflow-hidden' : ''} ${className}`}>
    <div className={`flex items-start justify-between gap-4 ${noPadding ? 'px-6 py-4 border-b border-gray-100' : 'mb-4'}`}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
    {noPadding ? children : <div>{children}</div>}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: string; up: boolean };
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}
export const StatCard: React.FC<StatCardProps> = ({
  label, value, delta, icon: Icon, iconBg, iconColor,
}) => (
  <div className="stat-card animate-fade-in">
    <div className={`stat-icon ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {delta && (
        <p className={delta.up ? 'stat-delta-up' : 'stat-delta-down'}>
          {delta.up ? '↑' : '↓'} {delta.value}
        </p>
      )}
    </div>
  </div>
);

// ─── Simple Bar Chart ─────────────────────────────────────────────────────────
interface MiniChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}
export const MiniBarChart: React.FC<MiniChartProps> = ({
  data, height = 80, color = '#9333ea',
}) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{
              height: `${(d.value / max) * (height - 20)}px`,
              backgroundColor: color,
              opacity: 0.7 + (i / data.length) * 0.3,
            }}
          />
          <span className="text-[10px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Line Sparkline (SVG) ─────────────────────────────────────────────────────
export const SparkLine: React.FC<{ data: number[]; color?: string; height?: number }> = ({
  data, color = '#9333ea', height = 40,
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
    </svg>
  );
};