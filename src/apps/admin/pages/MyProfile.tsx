// src/apps/admin/pages/MyProfile.tsx
import { useState, useRef } from 'react';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Shield, Camera,
  Save, CheckCircle, AlertCircle, Clock, Activity,
  LogOut, Key, Globe, Bell, Trash2, X,
} from 'lucide-react';
import { dummyAuditLogs, formatDateTime } from '@admin/utils/dummyData';

interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  timezone: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const TIMEZONES = [
  'Africa/Nairobi',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
];

const MOCK_SESSIONS = [
  { id: 1, device: 'Chrome on macOS', ip: '41.90.64.12',   location: 'Nairobi, KE',  last_active: '2025-04-06T14:30:00Z', is_current: true  },
  { id: 2, device: 'Firefox on Windows', ip: '41.90.64.55', location: 'Nairobi, KE', last_active: '2025-04-05T09:15:00Z', is_current: false },
  { id: 3, device: 'Safari on iPhone',  ip: '197.248.10.3', location: 'Mombasa, KE', last_active: '2025-04-03T18:00:00Z', is_current: false },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type Tab = 'profile' | 'security' | 'sessions' | 'activity';

const TAB_ITEMS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: 'profile',  label: 'Profile',        icon: User     },
  { value: 'security', label: 'Security',        icon: Lock     },
  { value: 'sessions', label: 'Active Sessions', icon: Globe    },
  { value: 'activity', label: 'My Activity',     icon: Activity },
];

const MyProfile: React.FC = () => {
  const [tab, setTab] = useState<Tab>('profile');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  // DB sends a single `name` field — split it for the form, rejoin on save
  const parseName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    return {
      first_name: parts[0] ?? '',
      last_name:  parts.slice(1).join(' '),
    };
  };

  const [profile, setProfile] = useState<ProfileForm>({
    ...parseName('Alice Mwangi'),
    email:    'alice@example.com',
    phone:    '+254 712 345 678',
    bio:      'Platform administrator. Managing events, users, and system integrity for MGLTickets.',
    timezone: 'Africa/Nairobi',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState<PasswordForm>({ current_password: '', new_password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwErrors, setPwErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [notifPrefs, setNotifPrefs] = useState({
    new_event: true, user_signup: true, payment_dispute: true,
    weekly_report: false, system_alerts: true,
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    // Concatenate back to a single `name` field for the DB
    const payload = {
      ...profile,
      name: `${profile.first_name.trim()} ${profile.last_name.trim()}`.trim(),
    };
    // TODO: await api.put('/admin/profile', payload);
    console.log('Saving profile:', payload);
    await new Promise(r => setTimeout(r, 900));
    setProfileLoading(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const validatePassword = (): boolean => {
    const e: Partial<Record<keyof PasswordForm, string>> = {};
    if (!pwForm.current_password) e.current_password = 'Required';
    if (pwForm.new_password.length < 8) e.new_password = 'Min. 8 characters';
    if (pwForm.new_password !== pwForm.confirm_password) e.confirm_password = 'Passwords do not match';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;
    setPwLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setPwLoading(false);
    setPwSuccess(true);
    setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    setTimeout(() => setPwSuccess(false), 4000);
  };

  const revokeSession = (id: number) => setSessions(p => p.filter(s => s.id !== id));

  const initials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();

  const inp = (hasError?: boolean) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
    }`;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-2xl purple-gradient flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h2>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                <Shield className="w-3 h-3" /> Administrator
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-lg">{profile.bio}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-5 text-center flex-shrink-0">
            {[
              { label: 'Actions',  value: dummyAuditLogs.length },
              { label: 'Sessions', value: sessions.length },
              { label: 'Timezone', value: 'EAT +3' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 p-1 flex gap-1 flex-wrap">
        {TAB_ITEMS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex-1 justify-center sm:flex-none
                ${tab === t.value ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Profile Tab ── */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
            <p className="text-sm text-gray-500 mt-0.5">Update your name, contact details, and preferences.</p>
          </div>

          {profileSaved && (
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-800 font-medium">Profile updated successfully.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={profile.first_name}
                  onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))}
                  placeholder="e.g. Alice"
                  className={`${inp()} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                value={profile.last_name}
                onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))}
                placeholder="e.g. Mwangi"
                className={inp()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className={`${inp()} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  className={`${inp()} pl-9`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              className={`${inp()} resize-none`}
              placeholder="A short description about your role…"
            />
            <p className="text-xs text-gray-400 mt-1">{profile.bio.length} / 200</p>
          </div>

          <div className="sm:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={profile.timezone}
                onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                className={`${inp()} pl-9 appearance-none`}
              >
                {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
              </select>
            </div>
          </div>

          {/* Notification preferences */}
          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Email Notification Preferences
            </h4>
            <div className="space-y-3">
              {([
                { key: 'new_event',        label: 'New event submitted for approval' },
                { key: 'user_signup',      label: 'New user registration alerts'     },
                { key: 'payment_dispute',  label: 'Payment disputes and refunds'     },
                { key: 'weekly_report',    label: 'Weekly analytics digest'          },
                { key: 'system_alerts',    label: 'System health and error alerts'   },
              ] as { key: keyof typeof notifPrefs; label: string }[]).map(item => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <div
                    onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                    className={`relative w-8 rounded-full cursor-pointer transition-colors flex-shrink-0`}
                    style={{ height: 18, width: 32, background: notifPrefs[item.key] ? '#7c3aed' : '#e5e7eb' }}
                  >
                    <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all
                      ${notifPrefs[item.key] ? 'left-[14px]' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary">Discard</button>
            <button onClick={handleProfileSave} disabled={profileLoading}
              className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {profileLoading
                ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {tab === 'security' && (
        <div className="space-y-4">
          {/* Change password */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-600" /> Change Password
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">Choose a strong password. We recommend at least 12 characters.</p>
            </div>

            {pwSuccess && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <p className="text-sm text-emerald-800 font-medium">Password updated successfully.</p>
              </div>
            )}

            {(['current_password', 'new_password', 'confirm_password'] as const).map((field, idx) => {
              const labels = ['Current Password', 'New Password', 'Confirm New Password'];
              const shown = showPw[field === 'current_password' ? 'current' : field === 'new_password' ? 'new' : 'confirm'];
              return (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{labels[idx]}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={shown ? 'text' : 'password'}
                      value={pwForm[field]}
                      onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                      className={`${inp(!!pwErrors[field])} pl-9 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => ({
                        ...p,
                        [field === 'current_password' ? 'current' : field === 'new_password' ? 'new' : 'confirm']:
                          !p[field === 'current_password' ? 'current' : field === 'new_password' ? 'new' : 'confirm'],
                      }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwErrors[field] && <p className="mt-1 text-xs text-red-600">{pwErrors[field]}</p>}
                  {field === 'new_password' && pwForm.new_password && (
                    <div className="mt-2 flex gap-1">
                      {[8, 12, 16].map(len => (
                        <div key={len} className={`h-1 flex-1 rounded-full transition-colors ${
                          pwForm.new_password.length >= len ? 'bg-emerald-500' : 'bg-gray-200'
                        }`} />
                      ))}
                      <span className="text-xs text-gray-400 ml-2">
                        {pwForm.new_password.length < 8 ? 'Too short' : pwForm.new_password.length < 12 ? 'Fair' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end">
              <button onClick={handlePasswordChange} disabled={pwLoading}
                className="btn-primary flex items-center gap-2 disabled:opacity-60">
                {pwLoading
                  ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  : <><Key className="w-4 h-4" /> Update Password</>}
              </button>
            </div>
          </div>

          {/* 2FA placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" /> Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account using an authenticator app.</p>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex-shrink-0">Not enabled</span>
            </div>
            <button className="mt-4 btn-secondary flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" /> Enable 2FA
            </button>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-100 p-6">
            <h3 className="text-base font-bold text-red-700 flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4" /> Danger Zone
            </h3>
            <p className="text-sm text-gray-500 mb-4">Irreversible actions. Proceed with caution.</p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign out all devices
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sessions Tab ── */}
      {tab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Active Sessions</h3>
            <p className="text-sm text-gray-500 mt-0.5">Devices currently signed in to your account.</p>
          </div>
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id}
                className={`flex items-start justify-between gap-4 p-4 rounded-xl border
                  ${session.is_current ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${session.is_current ? 'bg-purple-200' : 'bg-gray-200'}`}>
                    <Globe className={`w-4 h-4 ${session.is_current ? 'text-purple-700' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{session.device}</p>
                      {session.is_current && (
                        <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full">Current</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{session.ip} · {session.location}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Last active {timeAgo(session.last_active)}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <button onClick={() => revokeSession(session.id)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 flex-shrink-0 mt-1 font-medium">
                    <X className="w-3.5 h-3.5" /> Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
          {sessions.filter(s => !s.is_current).length > 0 && (
            <button
              onClick={() => setSessions(p => p.filter(s => s.is_current))}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Revoke all other sessions
            </button>
          )}
        </div>
      )}

      {/* ── Activity Tab ── */}
      {tab === 'activity' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Admin Activity</h3>
            <p className="text-sm text-gray-500 mt-0.5">Your last {dummyAuditLogs.length} actions on the platform.</p>
          </div>
          <div className="space-y-1">
            {dummyAuditLogs.map((log, i) => (
              <div key={log.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold capitalize">{log.action.replace(/_/g, ' ')}</span>
                    {' · '}
                    <span className="text-gray-500 capitalize">{log.target_type} #{log.target_id}</span>
                  </p>
                  {Object.keys(log.details).length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{timeAgo(log.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;