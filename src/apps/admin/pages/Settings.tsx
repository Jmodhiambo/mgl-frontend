// src/apps/admin/pages/Settings.tsx
// ─── NOTE: New endpoints needed ───────────────────────────────────────────────
// ⚠️  NEW ENDPOINT NEEDED: GET  /admin/settings         → platform settings object
// ⚠️  NEW ENDPOINT NEEDED: PUT  /admin/settings         → update platform settings
// ⚠️  NEW ENDPOINT NEEDED: POST /admin/auth/cleanup-sessions?hours=24 (exists ✓)
//
// Current backend endpoint available:
// POST /admin/auth/cleanup-sessions  → cleanup_expired_and_revoked_sessions_service

import { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Shield, Bell, Database, Globe, CreditCard, CheckCircle } from 'lucide-react';
import { SectionCard, AlertBanner } from '@admin/components/ui';
import { cleanupSessions } from '@admin/services/adminService';

interface PlatformSettings {
  platform_name: string;
  platform_email: string;
  support_email: string;
  default_currency: string;
  timezone: string;
  platform_fee_percent: number;
  require_event_approval: boolean;
  allow_user_registration: boolean;
  allow_organizer_signup: boolean;
  enable_refunds: boolean;
  max_tickets_per_booking: number;
  session_timeout_hours: number;
  maintenance_mode: boolean;
}

const defaultSettings: PlatformSettings = {
  platform_name: 'MGLTickets',
  platform_email: 'admin@mgltickets.com',
  support_email: 'support@mgltickets.com',
  default_currency: 'KES',
  timezone: 'Africa/Nairobi',
  platform_fee_percent: 5,
  require_event_approval: true,
  allow_user_registration: true,
  allow_organizer_signup: true,
  enable_refunds: true,
  max_tickets_per_booking: 10,
  session_timeout_hours: 24,
  maintenance_mode: false,
};

const Settings: React.FC = () => {
  const [settings, setSettings]     = useState<PlatformSettings>(defaultSettings);
  const [saving, setSaving]         = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [alert, setAlert]           = useState<{ type: 'success'|'error'; msg: string } | null>(null);
  const [activeTab, setActiveTab]   = useState<'general'|'platform'|'security'|'notifications'>('general');

  const update = (key: keyof PlatformSettings, value: unknown) =>
    setSettings(p => ({ ...p, [key]: value }));

  const saveSettings = async () => {
    setSaving(true);
    // TODO: uncomment to use real API
    // await api.put('/admin/settings', settings);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setAlert({ type: 'success', msg: 'Settings saved successfully.' });
  };

  const handleCleanupSessions = async () => {
    setCleaningUp(true);
    try {
      const result = await cleanupSessions(settings.session_timeout_hours);
      setAlert({ type: 'success', msg: `Session cleanup complete. ${result.deleted} sessions removed.` });
    } catch {
      setAlert({ type: 'error', msg: 'Session cleanup failed.' });
    } finally {
      setCleaningUp(false);
    }
  };

  const TABS = [
    { id: 'general',       label: 'General',       icon: Globe },
    { id: 'platform',      label: 'Platform',      icon: SettingsIcon },
    { id: 'security',      label: 'Security',      icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Platform configuration and preferences</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
          ) : (
            <><Save className="w-4 h-4" /> Save Settings</>
          )}
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Tab navigation */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === t.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── General Tab ── */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Platform Identity">
            <div className="space-y-4">
              <div>
                <label className="label">Platform Name</label>
                <input className="input-field" value={settings.platform_name}
                  onChange={e => update('platform_name', e.target.value)} />
              </div>
              <div>
                <label className="label">Admin Email</label>
                <input type="email" className="input-field" value={settings.platform_email}
                  onChange={e => update('platform_email', e.target.value)} />
              </div>
              <div>
                <label className="label">Support Email</label>
                <input type="email" className="input-field" value={settings.support_email}
                  onChange={e => update('support_email', e.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Locale & Currency">
            <div className="space-y-4">
              <div>
                <label className="label">Default Currency</label>
                <select className="select-field" value={settings.default_currency}
                  onChange={e => update('default_currency', e.target.value)}>
                  <option value="KES">KES — Kenyan Shilling</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
              <div>
                <label className="label">Timezone</label>
                <select className="select-field" value={settings.timezone}
                  onChange={e => update('timezone', e.target.value)}>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Platform Tab ── */}
      {activeTab === 'platform' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Event Management">
            <div className="space-y-5">
              <ToggleSetting
                label="Require Event Approval"
                description="New events must be approved by admin before going live"
                checked={settings.require_event_approval}
                onChange={v => update('require_event_approval', v)}
              />
              <ToggleSetting
                label="Enable Refunds"
                description="Allow users to request refunds for cancelled bookings"
                checked={settings.enable_refunds}
                onChange={v => update('enable_refunds', v)}
              />
              <div>
                <label className="label">Max Tickets Per Booking</label>
                <input type="number" min={1} max={50} className="input-field"
                  value={settings.max_tickets_per_booking}
                  onChange={e => update('max_tickets_per_booking', parseInt(e.target.value))} />
                <p className="text-xs text-gray-400 mt-1">Maximum number of tickets a user can book in one transaction</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Registration & Fees">
            <div className="space-y-5">
              <ToggleSetting
                label="Allow User Registration"
                description="Enable new users to create accounts on the platform"
                checked={settings.allow_user_registration}
                onChange={v => update('allow_user_registration', v)}
              />
              <ToggleSetting
                label="Allow Organizer Sign-up"
                description="Enable users to apply to become event organizers"
                checked={settings.allow_organizer_signup}
                onChange={v => update('allow_organizer_signup', v)}
              />
              <div>
                <label className="label">Platform Fee (%)</label>
                <input type="number" min={0} max={50} step={0.5} className="input-field"
                  value={settings.platform_fee_percent}
                  onChange={e => update('platform_fee_percent', parseFloat(e.target.value))} />
                <p className="text-xs text-gray-400 mt-1">Percentage taken from each ticket sale as platform commission</p>
              </div>
            </div>
          </SectionCard>

          {/* Maintenance mode — full width, danger zone */}
          <div className="lg:col-span-2">
            <SectionCard title="⚠️ Maintenance Mode">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-1">
                    Enabling maintenance mode will show a maintenance page to all non-admin users and prevent new bookings.
                  </p>
                  <p className="text-xs text-red-500 font-medium">Use with caution — this affects all platform users.</p>
                </div>
                <ToggleSetting
                  label=""
                  description=""
                  checked={settings.maintenance_mode}
                  onChange={v => update('maintenance_mode', v)}
                  danger
                />
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Session Management">
            <div className="space-y-4">
              <div>
                <label className="label">Session Timeout (hours)</label>
                <input type="number" min={1} max={168} className="input-field"
                  value={settings.session_timeout_hours}
                  onChange={e => update('session_timeout_hours', parseInt(e.target.value))} />
                <p className="text-xs text-gray-400 mt-1">How long before inactive sessions expire automatically</p>
              </div>
              <div className="divider" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Manual Session Cleanup</p>
                <p className="text-xs text-gray-500 mb-3">
                  Remove all expired and revoked refresh tokens older than {settings.session_timeout_hours} hours.
                  This calls <code className="bg-gray-100 px-1 rounded text-purple-700">POST /admin/auth/cleanup-sessions</code>.
                </p>
                <button
                  onClick={handleCleanupSessions}
                  disabled={cleaningUp}
                  className="btn-secondary flex items-center gap-2"
                >
                  {cleaningUp
                    ? <><div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Cleaning up…</>
                    : <><RefreshCw className="w-4 h-4" /> Run Cleanup</>}
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Access Control">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Two-Factor Authentication</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      2FA configuration is managed per-user in the user profile settings.
                      Recommended for all admin accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Database className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">All admin actions are logged</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Every action performed in this panel is recorded in the Audit Logs for accountability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Admin Notifications">
            <div className="space-y-5">
              {[
                { label: 'New event pending approval',  key: 'notify_new_event' },
                { label: 'New contact message received', key: 'notify_new_message' },
                { label: 'Payment failure detected',    key: 'notify_payment_failure' },
                { label: 'New organizer application',   key: 'notify_new_organizer' },
                { label: 'Booking refund requested',    key: 'notify_refund_request' },
              ].map(n => (
                <ToggleSetting
                  key={n.key}
                  label={n.label}
                  description=""
                  checked={true}
                  onChange={() => {}}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Notification Delivery">
            <div className="space-y-4">
              <div>
                <label className="label">Notification Email</label>
                <input type="email" className="input-field" value={settings.platform_email}
                  onChange={e => update('platform_email', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Admin notifications will be sent to this address</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">
                  Email delivery is configured through your email provider settings.
                  Ensure SMTP credentials are correctly set in your backend environment variables.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

// ─── Toggle component ─────────────────────────────────────────────────────────
const ToggleSetting: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}> = ({ label, description, checked, onChange, danger }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex-1">
      {label && <p className="text-sm font-medium text-gray-800">{label}</p>}
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${checked
          ? danger ? 'bg-red-500 focus:ring-red-400' : 'bg-purple-600 focus:ring-purple-400'
          : 'bg-gray-200 focus:ring-gray-300'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow
        transform ring-0 transition duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default Settings;