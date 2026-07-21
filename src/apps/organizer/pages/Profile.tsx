// src/apps/organizer/pages/Profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, Globe, Camera, Check, Plus,
  X, Save, Edit, Trash2, Clock, LogOut,
  AlertCircle, ExternalLink, Loader2, ShieldCheck, ShieldOff,
  Key,
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import {
  getOrganizerSessions,
  revokeOrganizerSession,
  revokeAllOtherOrganizerSessions,
} from '@shared/api/organizer/orgProfileApi';
import {
  getOrganizerProfile,
  updateOrganizerProfile,
  deleteOrganizerProfilePicture,
} from '@shared/api/organizer/orgUserApi';
import { timeAgo } from '@shared/utils/timeAgo';
import type { RefreshSession } from '@shared/types/Auth';

// Password changes are handled exclusively in the user app (mgltickets.com).
// All three apps share one account/password, but the browser's saved-password
// entry is scoped per-origin — organizer.mgltickets.com, admin.mgltickets.com,
// and mgltickets.com are three separate "sites" to Chrome/Safari's password
// manager. Consolidating the change form into one origin keeps that one
// saved entry current instead of fragmenting it across three.
const USER_APP_PROFILE_URL = 'https://mgltickets.com/profile';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrganizerProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  bio?: string | null;
  organization_name?: string | null;
  website_url?: string | null;
  profile_picture_url?: string | null;
  social_media_links?: string[] | null;
  area_of_expertise?: string[] | null;
}

type ActiveTab = 'profile' | 'security' | 'sessions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseApiError(err: any, fallback: string): string {
  const raw = err?.response?.data?.detail;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.map((e: any) => e.msg).join('; ');
  return fallback;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Prepends https:// to a link if it's missing a scheme, so users can type
// "instagram.com/handle" instead of being forced to type the full URL.
function ensureHttps(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{children}</p>
);

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="text-xs text-red-500 mt-1.5">{msg}</p> : null;

// ─── Component ────────────────────────────────────────────────────────────────

const OrganizerProfile: React.FC = () => {
  const { sessionId } = useAuth();

  const [profile, setProfile]     = useState<OrganizerProfile | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving,  setSaving]      = useState(false);
  const [editing, setEditing]     = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [pageError, setPageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [profilePictureFile,    setProfilePictureFile]    = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');

  const [formData, setFormData] = useState({
    name:               '',
    phone_number:       '',
    bio:                '',
    organization_name:  '',
    website_url:        '',
    social_media_links: [''],
    area_of_expertise:  [''],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newExpertise, setNewExpertise] = useState('');

  const expertiseOptions = [
    'Music & Entertainment', 'Technology & Innovation', 'Food & Beverage',
    'Sports & Fitness',      'Arts & Culture',          'Business & Networking',
    'Education & Training',  'Health & Wellness',       'Fashion & Beauty',
    'Charity & Fundraising',
  ];

  const [sessions,        setSessions]        = useState<RefreshSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionError,    setSessionError]    = useState<string | null>(null);

  // ── Load profile ──────────────────────────────────────────────────────────

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const data = await getOrganizerProfile();
      const p = data as unknown as OrganizerProfile;
      setProfile(p);
      setFormData({
        name:               p.name              ?? '',
        phone_number:       p.phone_number       ?? '',
        bio:                p.bio                ?? '',
        organization_name:  p.organization_name  ?? '',
        website_url:        p.website_url        ?? '',
        social_media_links: p.social_media_links?.length ? p.social_media_links : [''],
        area_of_expertise:  p.area_of_expertise?.length  ? p.area_of_expertise  : [''],
      });
      setProfilePicturePreview(p.profile_picture_url ?? '');
    } catch (err) {
      setPageError(parseApiError(err, 'Failed to load profile. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Sessions ──────────────────────────────────────────────────────────────

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionError(null);
    try { setSessions(await getOrganizerSessions()); }
    catch { setSessionError('Failed to load sessions. Please try again.'); }
    finally { setSessionsLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'sessions' && sessions.length === 0 && !sessionsLoading) fetchSessions();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRevokeSession = async (sid: string) => {
    try { await revokeOrganizerSession(sid); setSessions(p => p.filter(s => s.session_id !== sid)); }
    catch { setSessionError('Failed to revoke session.'); }
  };

  const handleRevokeAllOther = async () => {
    if (!sessionId) return;
    try { await revokeAllOtherOrganizerSessions(sessionId); setSessions(p => p.filter(s => s.session_id === sessionId)); }
    catch { setSessionError('Failed to sign out other sessions.'); }
  };

  // ── Profile picture ───────────────────────────────────────────────────────

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFormErrors(p => ({ ...p, profilePicture: 'File must be under 5 MB' })); return; }
    if (!file.type.startsWith('image/')) { setFormErrors(p => ({ ...p, profilePicture: 'Please upload an image file' })); return; }
    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicturePreview(reader.result as string);
    reader.readAsDataURL(file);
    setFormErrors(p => ({ ...p, profilePicture: '' }));
  };

  const handleRemoveProfilePicture = async () => {
    if (profile?.profile_picture_url) {
      try { await deleteOrganizerProfilePicture(); } catch { /* non-fatal */ }
    }
    setProfilePictureFile(null);
    setProfilePicturePreview('');
  };

  // ── Array fields ──────────────────────────────────────────────────────────

  const handleArrayChange = (i: number, v: string, f: 'social_media_links' | 'area_of_expertise') =>
    setFormData(p => { const a = [...p[f]]; a[i] = v; return { ...p, [f]: a }; });

  const addArrayField = (f: 'social_media_links' | 'area_of_expertise') =>
    setFormData(p => ({ ...p, [f]: [...p[f], ''] }));

  const removeArrayField = (i: number, f: 'social_media_links' | 'area_of_expertise') =>
    setFormData(p => ({ ...p, [f]: p[f].filter((_, idx) => idx !== i) }));

  const handleToggleExpertise = (expertise: string) => {
    setFormData(p => ({
      ...p,
      area_of_expertise: p.area_of_expertise.includes(expertise)
        ? p.area_of_expertise.filter(e => e !== expertise)
        : [...p.area_of_expertise, expertise],
    }));
  };

  // ── Validate & save ───────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim())         errs.name         = 'Name is required';
    if (!formData.phone_number.trim()) errs.phone_number = 'Phone number is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    setShowSuccess(false);
    try {
      const payload = new FormData();
      payload.append('name',              formData.name);
      payload.append('phone_number',      formData.phone_number);
      payload.append('bio',               formData.bio);
      payload.append('organization_name', formData.organization_name);
      payload.append('website_url',       formData.website_url.trim() ? ensureHttps(formData.website_url) : '');
      payload.append('social_media_links', JSON.stringify(formData.social_media_links.filter(Boolean).map(ensureHttps)));
      payload.append('area_of_expertise',  JSON.stringify(formData.area_of_expertise.filter(Boolean)));
      if (profilePictureFile) payload.append('profile_picture', profilePictureFile);
      await updateOrganizerProfile(payload);
      setEditing(false);
      setProfilePictureFile(null);
      setShowSuccess(true);
      await loadProfile();
    } catch (err) {
      setSaveError(parseApiError(err, 'Failed to save profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setSaveError(null);
    setShowSuccess(false);
    setFormErrors({});
    setProfilePicturePreview(profile?.profile_picture_url ?? '');
    setProfilePictureFile(null);
    loadProfile();
  };

  // ── Render guards ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (pageError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-gray-800 font-semibold">{pageError ?? 'Profile not found.'}</p>
          <button onClick={loadProfile} className="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const inp = (key: string) =>
    `w-full px-4 py-3 bg-gray-50 border ${formErrors[key] ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-60 disabled:cursor-default transition-colors`;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Identity hero band ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-blue-100">
                {profilePicturePreview ? (
                  <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-2xl font-black text-blue-500 tracking-tight">
                      {getInitials(profile.name)}
                    </span>
                  </div>
                )}
              </div>

              {editing && (
                <>
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-sm">
                    <Camera className="w-4 h-4" />
                    <input type="file" id="profilePicture" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                  </label>
                  {profilePicturePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Identity + meta */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-gray-900 truncate">
                {profile.organization_name || profile.name}
              </h1>
              <p className="text-sm font-medium text-gray-600 mt-0.5">{profile.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  profile.email_verified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {profile.email_verified
                    ? <><ShieldCheck className="w-3.5 h-3.5" /> Verified</>
                    : <><ShieldOff className="w-3.5 h-3.5" /> Unverified</>}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  profile.is_active ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {profile.is_active ? 'Active account' : 'Inactive account'}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              {formErrors.profilePicture && (
                <p className="text-xs text-red-500 mt-2">{formErrors.profilePicture}</p>
              )}
            </div>

            {/* Edit button (desktop) — only visible on sm+ */}
            {activeTab === 'profile' && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
              >
                <Edit className="w-4 h-4" /> Edit profile
              </button>
            )}
          </div>

          {/* Edit button (mobile) */}
          {activeTab === 'profile' && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="sm:hidden mt-4 w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Edit className="w-4 h-4" /> Edit profile
            </button>
          )}

          {/* Tabs */}
          <div className="flex gap-1.5 mt-6 border-b border-gray-100 -mb-px">
            {([
              { value: 'profile',  label: 'Profile'  },
              { value: 'security', label: 'Security' },
              { value: 'sessions', label: 'Sessions' },
            ] as { value: ActiveTab; label: string }[]).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setActiveTab(value); setEditing(false); }}
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 -mb-px ${
                  activeTab === value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══ PROFILE TAB ══ */}
        {activeTab === 'profile' && (
          <div className="space-y-6">

            {/* Basic info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <SectionLabel>Basic information</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input type="text" value={formData.name} disabled={!editing}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className={inp('name')} />
                  <FieldError msg={formErrors.name} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="text-red-400">*</span></label>
                  <input type="tel" value={formData.phone_number} disabled={!editing}
                    onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                    className={inp('phone_number')} />
                  <FieldError msg={formErrors.phone_number} />
                </div>

                {/* Email — always read-only */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={profile.email} disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
                  <div className="mt-1.5 flex items-center justify-between flex-wrap gap-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Email can't be edited here.
                    </p>
                    <Link to="/contact" className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" /> Contact us to change
                    </Link>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization</label>
                  <input type="text" value={formData.organization_name} disabled={!editing}
                    onChange={e => setFormData(p => ({ ...p, organization_name: e.target.value }))}
                    className={inp('organization_name')} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                  <input type="url" value={formData.website_url} disabled={!editing}
                    placeholder="https://example.com"
                    onChange={e => setFormData(p => ({ ...p, website_url: e.target.value }))}
                    className={inp('website_url')} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                  <textarea value={formData.bio} disabled={!editing} rows={4}
                    placeholder="Tell attendees what makes your events worth showing up for…"
                    onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                    className={`${inp('bio')} resize-none`} />
                </div>
              </div>
            </div>

            {/* Social media */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <SectionLabel>Social media</SectionLabel>
              <div className="space-y-2.5">
                {formData.social_media_links.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="url" value={link} disabled={!editing}
                      placeholder="https://twitter.com/yourhandle"
                      onChange={e => handleArrayChange(i, e.target.value, 'social_media_links')}
                      className={`flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-60 transition-colors`} />
                    {editing && formData.social_media_links.length > 1 && (
                      <button type="button" onClick={() => removeArrayField(i, 'social_media_links')}
                        className="w-11 flex items-center justify-center border border-gray-200 text-gray-400 rounded-xl hover:border-red-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {editing && (
                  <button type="button" onClick={() => addArrayField('social_media_links')}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                    + Add link
                  </button>
                )}
              </div>
            </div>

            {/* Area of expertise */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <SectionLabel>Areas of expertise</SectionLabel>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-2">
                {expertiseOptions.map(opt => {
                  const selected = formData.area_of_expertise.includes(opt);
                  return editing ? (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleToggleExpertise(opt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        selected
                          ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {selected && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
                      {opt}
                    </button>
                  ) : selected ? (
                    <span key={opt} className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500 text-white border border-blue-500">
                      {opt}
                    </span>
                  ) : null;
                })}
              </div>

              {/* Custom expertise — separated by divider */}
              {(() => {
                const custom = formData.area_of_expertise.filter(e => !expertiseOptions.includes(e));
                if (custom.length === 0 && !editing) return null;
                return (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {custom.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {custom.map(e => (
                          <span key={e} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500 text-white">
                            {e}
                            {editing && (
                              <button type="button" onClick={() => handleToggleExpertise(e)} className="hover:text-blue-200 transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    {editing && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newExpertise}
                          onChange={e => setNewExpertise(e.target.value)}
                          placeholder="Add a custom area…"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newExpertise.trim()) { handleToggleExpertise(newExpertise.trim()); setNewExpertise(''); }
                            }
                          }}
                          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => { if (newExpertise.trim()) { handleToggleExpertise(newExpertise.trim()); setNewExpertise(''); } }}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {!editing && formData.area_of_expertise.length === 0 && (
                <p className="text-sm text-gray-400 mt-1">No areas of expertise added yet.</p>
              )}
            </div>

            {/* Save / cancel */}
            {editing && (
              <div className="space-y-3 pb-8">
                {showSuccess && (
                  <div className="flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Profile saved</p>
                      <p className="text-xs text-green-600 mt-0.5">Your changes are live on your profile.</p>
                    </div>
                  </div>
                )}
                {saveError && (
                  <div className="flex items-start gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-700">{saveError}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={handleCancelEdit}
                    className="flex-1 py-3.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={saving}
                    className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><Save className="w-4 h-4" /> Save changes</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ SECURITY TAB ══ */}
        {activeTab === 'security' && (
          <div className="space-y-4 pb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Your organizer login is the same account used across every MGLTickets
                    app. Password changes are handled in one place — your main account
                    settings — so your browser's saved password stays accurate instead of
                    going stale on one app after you update it on another.
                  </p>
                  <a
                    href={USER_APP_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Update password on mgltickets.com <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ SESSIONS TAB ══ */}
        {activeTab === 'sessions' && (
          <div className="space-y-4 pb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <SectionLabel>Active sessions</SectionLabel>
              <p className="text-sm font-medium text-gray-600 -mt-2 mb-5">Devices currently signed in to your account.</p>

              {sessionError && (
                <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{sessionError}</p>
                </div>
              )}

              {sessionsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-7 w-7 text-blue-400 animate-spin" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No active sessions found.</p>
              ) : (
                <div className="space-y-2.5">
                  {sessions.map(session => {
                    const isCurrent = session.session_id === sessionId;
                    return (
                      <div
                        key={session.session_id}
                        className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors ${
                          isCurrent ? 'border-blue-200 bg-blue-50/60' : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <Globe className={`w-4 h-4 ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {session.device_info ?? 'Unknown device'}
                              </p>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                                  This device
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {session.ip_address ?? '—'}{session.location ? ` · ${session.location}` : ''}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 flex-shrink-0" /> Last active {timeAgo(session.last_used_at)}
                            </p>
                          </div>
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={() => handleRevokeSession(session.session_id)}
                            className="text-xs font-semibold text-gray-400 hover:text-red-500 flex items-center gap-1 flex-shrink-0 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Revoke
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {sessions.filter(s => s.session_id !== sessionId).length > 0 && (
                <button
                  onClick={handleRevokeAllOther}
                  className="mt-5 text-xs font-semibold text-red-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out all other devices
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrganizerProfile;