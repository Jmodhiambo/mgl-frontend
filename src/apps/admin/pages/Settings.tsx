// src/apps/admin/pages/Settings.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon, Save, RefreshCw, Shield,
  Bell, Database, Globe, Loader2,
} from 'lucide-react';
import { SectionCard, AlertBanner } from '@admin/components/ui';
import {
  getPlatformSettings,
  updatePlatformSettings,
  getAdminNotificationPrefs,
  updateAdminNotificationPrefs,
  cleanupSessions,
} from '@admin/services/adminService';
import type { PlatformSettings, AdminNotificationPrefs } from '@admin/services/adminService';

// ─── Types ────────────────────────────────────────────────────────────────────

// Working copy used by the form — omits read-only server fields
type SettingsForm = Omit<PlatformSettings, 'updated_at' | 'updated_by_user_id'>;

type NotifForm = Omit<AdminNotificationPrefs, 'user_id' | 'updated_at'>;

type Tab = 'general' | 'platform' | 'security' | 'notifications';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const FieldSkeleton: React.FC<{ wide?: boolean }> = ({ wide }) => (
  <div className="space-y-1.5">
    <div className="h-3.5 w-24 bg-gray-100 rounded animate-pulse" />
    <div className={`h-9 ${wide ? 'w-full' : 'w-full'} bg-gray-100 rounded-lg animate-pulse`} />
  </div>
);

const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <FieldSkeleton key={i} />
    ))}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const Settings: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [settings, setSettings]         = useState<SettingsForm | null>(null);
  const [notifPrefs, setNotifPrefs]     = useState<NotifForm | null>(null);
  const [loadingSettings, setLS]        = useState(true);
  const [loadingNotifs, setLN]          = useState(true);
  const [loadError, setLoadError]       = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [cleaningUp, setCleaningUp]     = useState(false);
  const [alert, setAlert]               = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [activeTab, setActiveTab]       = useState<Tab>('general');
  const [dirty, setDirty]               = useState(false);
  const [notifDirty, setNotifDirty]     = useState(false);

  // ── Load on mount ──────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLS(true);
    setLoadError(null);
    try {
      const data = await getPlatformSettings();
      // Strip server-managed fields before putting into form state
      const { updated_at, updated_by_user_id, ...form } = data;
      setSettings(form);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? err?.message ?? 'Failed to load settings.';
      setLoadError(detail);
    } finally {
      setLS(false);
    }
  }, []);

  const loadNotifPrefs = useCallback(async () => {
    setLN(true);
    try {
      const data = await getAdminNotificationPrefs();
      const { user_id, updated_at, ...form } = data;
      setNotifPrefs(form);
    } catch {
      // Non-critical — silently fall back to defaults
      setNotifPrefs({
        notify_new_event: true,
        notify_new_message: true,
        notify_payment_failure: true,
        notify_new_organizer: true,
        notify_refund_request: true,
      });
    } finally {
      setLN(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (activeTab === 'notifications' && notifPrefs === null) {
      loadNotifPrefs();
    }
  }, [activeTab, notifPrefs, loadNotifPrefs]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const update = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setSettings(p => p ? { ...p, [key]: value } : p);
    setDirty(true);
  };

  const updateNotif = <K extends keyof NotifForm>(key: K, value: NotifForm[K]) => {
    setNotifPrefs(p => p ? { ...p, [key]: value } : p);
    setNotifDirty(true);
  };

  // ── Save handlers ──────────────────────────────────────────────────────────
  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setAlert(null);
    try {
      const updated = await updatePlatformSettings(settings);
      const { updated_at, updated_by_user_id, ...form } = updated;
      setSettings(form);
      setDirty(false);
      setAlert({ type: 'success', msg: 'Settings saved successfully.' });
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Failed to save settings. Please try again.';
      setAlert({ type: 'error', msg: detail });
    } finally {
      setSaving(false);
    }
  };

  const saveNotifPrefs = async () => {
    if (!notifPrefs) return;
    setSavingNotifs(true);
    setAlert(null);
    try {
      const updated = await updateAdminNotificationPrefs(notifPrefs);
      const { user_id, updated_at, ...form } = updated;
      setNotifPrefs(form);
      setNotifDirty(false);
      setAlert({ type: 'success', msg: 'Notification preferences saved.' });
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Failed to save notification preferences.';
      setAlert({ type: 'error', msg: detail });
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleCleanupSessions = async () => {
    if (!settings) return;
    setCleaningUp(true);
    setAlert(null);
    try {
      const result = await cleanupSessions(settings.session_timeout_hours);
      setAlert({
        type: 'success',
        msg: `Session cleanup complete. ${result.deleted_count} sessions removed. ${result.active_sessions} active sessions remain.`,
      });
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Session cleanup failed. Please try again.';
      setAlert({ type: 'error', msg: detail });
    } finally {
      setCleaningUp(false);
    }
  };

  // ── Tab config ─────────────────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'general',       label: 'General',       icon: Globe        },
    { id: 'platform',      label: 'Platform',      icon: SettingsIcon },
    { id: 'security',      label: 'Security',      icon: Shield       },
    { id: 'notifications', label: 'Notifications', icon: Bell         },
  ];

  // ── Hard load error ────────────────────────────────────────────────────────
  if (!loadingSettings && loadError) {
    return (
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Platform configuration and preferences</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center space-y-4">
          <p className="text-red-600 font-semibold">Failed to load settings</p>
          <p className="text-sm text-gray-500">{loadError}</p>
          <button onClick={loadSettings} className="btn-secondary inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Platform configuration and preferences</p>
        </div>

        {/* Save button — label and dirty-check vary by tab */}
        {activeTab !== 'security' && (
          <button
            onClick={activeTab === 'notifications' ? saveNotifPrefs : saveSettings}
            disabled={
              activeTab === 'notifications'
                ? (savingNotifs || loadingNotifs || !notifDirty)
                : (saving || loadingSettings || !dirty)
            }
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {(activeTab === 'notifications' ? savingNotifs : saving) ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> {activeTab === 'notifications' ? 'Save Preferences' : 'Save Settings'}</>
            )}
          </button>
        )}
      </div>

      {alert && (
        <AlertBanner
          type={alert.type}
          message={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}

      {/* ── Tab navigation ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === t.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══ General Tab ══════════════════════════════════════════════════════ */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <SectionCard title="Platform Identity">
            {loadingSettings ? (
              <CardSkeleton rows={3} />
            ) : settings ? (
              <div className="space-y-4">
                <div>
                  <label className="label">Platform Name</label>
                  <input
                    className="input-field"
                    value={settings.platform_name}
                    onChange={e => update('platform_name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Admin Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={settings.platform_email}
                    onChange={e => update('platform_email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Support Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={settings.support_email}
                    onChange={e => update('support_email', e.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Locale & Currency">
            {loadingSettings ? (
              <CardSkeleton rows={2} />
            ) : settings ? (
              <div className="space-y-4">
                <div>
                  <label className="label">Default Currency</label>
                  <select
                    className="select-field"
                    value={settings.default_currency}
                    onChange={e => update('default_currency', e.target.value)}
                  >
                    <option value="KES">KES — Kenyan Shilling</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="label">Timezone</label>
                  <select
                    className="select-field"
                    value={settings.timezone}
                    onChange={e => update('timezone', e.target.value)}
                  >
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
            ) : null}
          </SectionCard>

        </div>
      )}

      {/* ══ Platform Tab ═════════════════════════════════════════════════════ */}
      {activeTab === 'platform' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <SectionCard title="Event Management">
            {loadingSettings ? (
              <CardSkeleton rows={3} />
            ) : settings ? (
              <div className="space-y-5">
                <ToggleSetting
                  label="Require Event Approval"
                  description="New events must be approved by an admin before going live"
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
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="input-field"
                    value={settings.max_tickets_per_booking}
                    onChange={e => update('max_tickets_per_booking', parseInt(e.target.value, 10))}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Maximum number of tickets a user can purchase in one transaction
                  </p>
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Registration & Fees">
            {loadingSettings ? (
              <CardSkeleton rows={3} />
            ) : settings ? (
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
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    className="input-field"
                    value={settings.platform_fee_percent}
                    onChange={e => update('platform_fee_percent', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Percentage taken from each ticket sale as platform commission
                  </p>
                </div>
              </div>
            ) : null}
          </SectionCard>

          {/* Maintenance mode — full width danger zone */}
          <div className="lg:col-span-2">
            <SectionCard title="⚠️ Maintenance Mode">
              {loadingSettings ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : settings ? (
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-1">
                      Enabling maintenance mode shows a maintenance page to all non-admin users
                      and prevents new bookings.
                    </p>
                    <p className="text-xs text-red-500 font-medium">
                      Use with caution — this affects all platform users immediately.
                    </p>
                  </div>
                  <ToggleSetting
                    label=""
                    description=""
                    checked={settings.maintenance_mode}
                    onChange={v => update('maintenance_mode', v)}
                    danger
                  />
                </div>
              ) : null}
            </SectionCard>
          </div>

        </div>
      )}

      {/* ══ Security Tab ═════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <SectionCard title="Session Management">
            {loadingSettings ? (
              <CardSkeleton rows={2} />
            ) : settings ? (
              <div className="space-y-4">
                <div>
                  <label className="label">Session Timeout (hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    className="input-field"
                    value={settings.session_timeout_hours}
                    onChange={e => update('session_timeout_hours', parseInt(e.target.value, 10))}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    How long before inactive sessions expire automatically
                  </p>
                </div>

                <div className="divider" />

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Manual Session Cleanup</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Hard-deletes all expired and revoked refresh tokens older than{' '}
                    <strong>{settings.session_timeout_hours}h</strong>. Calls{' '}
                    <code className="bg-gray-100 px-1 rounded text-purple-700 text-[11px]">
                      POST /admin/auth/cleanup-sessions
                    </code>.
                  </p>
                  <button
                    onClick={handleCleanupSessions}
                    disabled={cleaningUp}
                    className="btn-secondary flex items-center gap-2 disabled:opacity-60"
                  >
                    {cleaningUp ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Cleaning up…</>
                    ) : (
                      <><RefreshCw className="w-4 h-4" /> Run Cleanup</>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Access Control">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Two-Factor Authentication</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      2FA is managed per-user in the profile settings.
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
                      Every action performed in this panel is recorded in the Audit Logs
                      for full accountability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

        </div>
      )}

      {/* ══ Notifications Tab ════════════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <SectionCard title="Admin Notifications">
            {loadingNotifs ? (
              <CardSkeleton rows={5} />
            ) : notifPrefs ? (
              <div className="space-y-5">
                {(
                  [
                    { key: 'notify_new_event',       label: 'New event pending approval'   },
                    { key: 'notify_new_message',      label: 'New contact message received' },
                    { key: 'notify_payment_failure',  label: 'Payment failure detected'     },
                    { key: 'notify_new_organizer',    label: 'New organizer application'    },
                    { key: 'notify_refund_request',   label: 'Booking refund requested'     },
                  ] as { key: keyof NotifForm; label: string }[]
                ).map(n => (
                  <ToggleSetting
                    key={n.key}
                    label={n.label}
                    description=""
                    checked={notifPrefs[n.key]}
                    onChange={v => updateNotif(n.key, v)}
                  />
                ))}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Notification Delivery">
            {loadingSettings ? (
              <CardSkeleton rows={1} />
            ) : settings ? (
              <div className="space-y-4">
                <div>
                  <label className="label">Notification Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={settings.platform_email}
                    onChange={e => update('platform_email', e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Admin notifications will be sent to this address
                  </p>
                </div>
              </div>
            ) : null}
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
      {label      && <p className="text-sm font-medium text-gray-800">{label}</p>}
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${checked
          ? danger
            ? 'bg-red-500 focus:ring-red-400'
            : 'bg-purple-600 focus:ring-purple-400'
          : 'bg-gray-200 focus:ring-gray-300'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow
          transform ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

export default Settings;