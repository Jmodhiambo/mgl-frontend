// src/apps/admin/pages/Reports.tsx
// ─── NOTE: These are custom report generation endpoints ──────────────────────
// ⚠️  NEW ENDPOINT NEEDED: POST /admin/reports/generate
//     Accepts: { type, date_from, date_to, filters }
//     Returns: report data array
// ⚠️  NEW ENDPOINT NEEDED: GET /admin/reports/history
//     Returns: list of previously generated reports

import { useState } from 'react';
import { FileText, Download, Calendar, Users, Ticket, CreditCard, BarChart3, CheckCircle } from 'lucide-react';
import { SectionCard, AlertBanner } from '@admin/components/ui';
import {
  dummyUsers, dummyEvents, dummyBookings, dummyPayments,
  formatKES, formatDate,
} from '@admin/utils/dummyData';

type ReportType = 'users' | 'events' | 'bookings' | 'payments' | 'revenue';

interface ReportConfig {
  type: ReportType;
  dateFrom: string;
  dateTo: string;
  statusFilter: string;
  roleFilter: string;
}

interface GeneratedReport {
  id: string;
  type: ReportType;
  name: string;
  rowCount: number;
  generatedAt: string;
  config: ReportConfig;
}

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'users',    label: 'Users Report',    icon: Users,     description: 'All users with roles, status and join dates' },
  { value: 'events',   label: 'Events Report',   icon: Calendar,  description: 'Events with organizer, status and revenue' },
  { value: 'bookings', label: 'Bookings Report',  icon: Ticket,    description: 'All bookings with customer and payment info' },
  { value: 'payments', label: 'Payments Report',  icon: CreditCard,description: 'All transactions with amounts and methods' },
  { value: 'revenue',  label: 'Revenue Summary',  icon: BarChart3, description: 'Revenue breakdown by event, organizer and period' },
];

const Reports: React.FC = () => {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'bookings',
    dateFrom: '',
    dateTo: '',
    statusFilter: 'all',
    roleFilter: 'all',
  });
  const [generating, setGenerating]   = useState(false);
  const [generated, setGenerated]     = useState<GeneratedReport[]>([]);
  const [alert, setAlert]             = useState<{ type: 'success'|'error'; msg: string } | null>(null);
  const [preview, setPreview]         = useState<Record<string, unknown>[] | null>(null);

  const buildData = (): Record<string, unknown>[] => {
    switch (config.type) {
      case 'users':
        return dummyUsers
          .filter(u => config.roleFilter === 'all' || u.role === config.roleFilter)
          .map(u => ({
            ID: u.id, Name: `${u.first_name} ${u.last_name}`, Email: u.email,
            Role: u.role, Active: u.is_active, Verified: u.is_verified,
            Joined: formatDate(u.created_at),
          }));
      case 'events':
        return dummyEvents
          .filter(e => config.statusFilter === 'all' || e.status === config.statusFilter)
          .map(e => ({
            ID: e.id, Title: e.title, Organizer: e.organizer_name,
            Status: e.status, Approved: e.is_approved,
            City: e.city, Date: formatDate(e.start_time),
            Bookings: e.total_bookings ?? 0,
            Revenue: e.total_revenue ?? 0,
          }));
      case 'bookings':
        return dummyBookings
          .filter(b => config.statusFilter === 'all' || b.status === config.statusFilter)
          .map(b => ({
            ID: b.id, Customer: b.customer_name, Email: b.customer_email,
            Event: b.event_title, TicketType: b.ticket_type_name,
            Quantity: b.quantity, Total: b.total_price,
            Status: b.status, Date: formatDate(b.created_at),
          }));
      case 'payments':
        return dummyPayments
          .filter(p => config.statusFilter === 'all' || p.status === config.statusFilter)
          .map(p => ({
            ID: p.id, User: p.user_name, Amount: p.amount,
            Method: p.method, Status: p.status,
            BookingID: p.booking_id, Date: formatDate(p.created_at),
          }));
      case 'revenue':
        return dummyEvents.map(e => ({
          EventID: e.id, Title: e.title, Organizer: e.organizer_name,
          Bookings: e.total_bookings ?? 0,
          Revenue: e.total_revenue ?? 0,
          Status: e.status, Date: formatDate(e.start_time),
        }));
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    // TODO: uncomment to use real API
    // const data = await api.post('/admin/reports/generate', config);
    await new Promise(r => setTimeout(r, 900)); // simulate
    const data = buildData();
    const reportDef = REPORT_TYPES.find(r => r.value === config.type)!;
    const report: GeneratedReport = {
      id: `RPT-${Date.now()}`,
      type: config.type,
      name: reportDef.label,
      rowCount: data.length,
      generatedAt: new Date().toISOString(),
      config: { ...config },
    };
    setGenerated(p => [report, ...p]);
    setPreview(data);
    setAlert({ type: 'success', msg: `Report generated: ${data.length} records.` });
    setGenerating(false);
  };

  const downloadCSV = (data: Record<string, unknown>[]) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = [headers, ...data.map(r => headers.map(h => r[h]))];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `${config.type}-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const selectedType = REPORT_TYPES.find(r => r.value === config.type)!;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and export platform data reports</p>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Report Builder ── */}
        <div className="lg:col-span-1 space-y-5">
          <SectionCard title="Report Builder">
            <div className="space-y-4">
              {/* Report type */}
              <div>
                <label className="label">Report Type</label>
                <div className="space-y-2">
                  {REPORT_TYPES.map(r => {
                    const Icon = r.icon;
                    const active = config.type === r.value;
                    return (
                      <button
                        key={r.value}
                        onClick={() => setConfig(p => ({ ...p, type: r.value }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all
                          ${active ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${active ? 'bg-purple-600' : 'bg-gray-100'}`}>
                          <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${active ? 'text-purple-900' : 'text-gray-800'}`}>
                            {r.label}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{r.description}</p>
                        </div>
                        {active && <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="divider" />

              {/* Date range */}
              <div>
                <label className="label">Date Range (optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">From</p>
                    <input type="date" value={config.dateFrom}
                      onChange={e => setConfig(p => ({ ...p, dateFrom: e.target.value }))}
                      className="input-field text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">To</p>
                    <input type="date" value={config.dateTo}
                      onChange={e => setConfig(p => ({ ...p, dateTo: e.target.value }))}
                      className="input-field text-sm" />
                  </div>
                </div>
              </div>

              {/* Conditional filters */}
              {(config.type === 'bookings' || config.type === 'payments' || config.type === 'events') && (
                <div>
                  <label className="label">Status Filter</label>
                  <select value={config.statusFilter}
                    onChange={e => setConfig(p => ({ ...p, statusFilter: e.target.value }))}
                    className="select-field">
                    <option value="all">All Status</option>
                    {config.type === 'bookings' && ['pending','confirmed','cancelled','refunded'].map(s =>
                      <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    {config.type === 'payments' && ['pending','completed','failed','refunded'].map(s =>
                      <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    {config.type === 'events' && ['upcoming','ongoing','completed','cancelled'].map(s =>
                      <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              )}

              {config.type === 'users' && (
                <div>
                  <label className="label">Role Filter</label>
                  <select value={config.roleFilter}
                    onChange={e => setConfig(p => ({ ...p, roleFilter: e.target.value }))}
                    className="select-field">
                    <option value="all">All Roles</option>
                    {['user','organizer','admin'].map(r =>
                      <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                  </select>
                </div>
              )}

              <button
                onClick={generateReport}
                disabled={generating}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {generating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</>
                ) : (
                  <><BarChart3 className="w-4 h-4" /> Generate Report</>
                )}
              </button>
            </div>
          </SectionCard>

          {/* History */}
          {generated.length > 0 && (
            <SectionCard title="Report History" noPadding>
              <div className="divide-y divide-gray-50">
                {generated.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.rowCount} records · {formatDate(r.generatedAt)}</p>
                    </div>
                    <button
                      onClick={() => { setPreview(buildData()); }}
                      className="text-xs text-purple-600 font-medium hover:text-purple-700"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Preview Panel ── */}
        <div className="lg:col-span-2">
          {preview ? (
            <SectionCard
              title={`${selectedType.label} Preview`}
              subtitle={`${preview.length} records`}
              noPadding
              actions={
                <button
                  onClick={() => downloadCSV(preview)}
                  className="btn-primary btn-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download CSV
                </button>
              }
            >
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="admin-table">
                  <thead className="sticky top-0">
                    <tr>
                      {Object.keys(preview[0]).map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="max-w-[160px] truncate">
                            {typeof val === 'boolean' ? (val ? '✓' : '✗') : String(val ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 50 && (
                <p className="text-xs text-gray-400 text-center py-3">
                  Showing 50 of {preview.length} rows. Download CSV for full data.
                </p>
              )}
            </SectionCard>
          ) : (
            <div className="card h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-purple-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">No Report Generated Yet</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Select a report type, configure your filters, and click "Generate Report" to preview data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;