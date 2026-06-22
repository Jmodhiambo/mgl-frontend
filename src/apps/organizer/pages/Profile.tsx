// src/apps/organizer/pages/Profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, Globe, Upload,
  X, Save, Edit, Trash2, Clock, LogOut,
  AlertCircle, ExternalLink, Loader2, Percent,
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

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Matches backend OrganizerOut, which now inherits flat fields directly
 * from both UserOut and OrganizerInfo (no nested organizer_info object).
 * bio, organization_name, website_url, profile_picture_url,
 * social_media_links, and area_of_expertise all live at the top level.
 */
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

type ActiveTab = 'profile' | 'sessions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseApiError(err: any, fallback: string): string {
  const raw = err?.response?.data?.detail;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.map((e: any) => e.msg).join('; ');
  return fallback;
}

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

  const [profilePictureFile,    setProfilePictureFile]    = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');

  const [formData, setFormData] = useState({
    name:                 '',
    phone_number:         '',
    bio:                  '',
    organization_name:    '',
    website_url:          '',
    social_media_links:   [''],
    area_of_expertise:    [''],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [sessions,        setSessions]        = useState<RefreshSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionError,    setSessionError]    = useState<string | null>(null);

  // ── Load profile ──────────────────────────────────────────────────────────

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const data = await getOrganizerProfile();
      const profileData = data as unknown as OrganizerProfile;
      setProfile(profileData);
      setFormData({
        name:               profileData.name ?? '',
        phone_number:       profileData.phone_number ?? '',
        bio:                profileData.bio ?? '',
        organization_name:  profileData.organization_name ?? '',
        website_url:        profileData.website_url ?? '',
        social_media_links: profileData.social_media_links?.length ? profileData.social_media_links : [''],
        area_of_expertise:  profileData.area_of_expertise?.length  ? profileData.area_of_expertise  : [''],
      });
      setProfilePicturePreview(profileData.profile_picture_url ?? '');
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
    try {
      setSessions(await getOrganizerSessions());
    } catch {
      setSessionError('Failed to load sessions. Please try again.');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'sessions' && sessions.length === 0 && !sessionsLoading) {
      fetchSessions();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRevokeSession = async (sid: string) => {
    try {
      await revokeOrganizerSession(sid);
      setSessions(p => p.filter(s => s.session_id !== sid));
    } catch {
      setSessionError('Failed to revoke session.');
    }
  };

  const handleRevokeAllOther = async () => {
    if (!sessionId) return;
    try {
      await revokeAllOtherOrganizerSessions(sessionId);
      setSessions(p => p.filter(s => s.session_id === sessionId));
    } catch {
      setSessionError('Failed to sign out other sessions.');
    }
  };

  // ── Profile picture ───────────────────────────────────────────────────────

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(p => ({ ...p, profilePicture: 'File size must be less than 5MB' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setFormErrors(p => ({ ...p, profilePicture: 'Please upload an image file' }));
      return;
    }
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

  const handleArrayChange = (
    index: number, value: string,
    field: 'social_media_links' | 'area_of_expertise',
  ) => {
    setFormData(p => {
      const arr = [...p[field]];
      arr[index] = value;
      return { ...p, [field]: arr };
    });
  };

  const addArrayField = (field: 'social_media_links' | 'area_of_expertise') =>
    setFormData(p => ({ ...p, [field]: [...p[field], ''] }));

  const removeArrayField = (index: number, field: 'social_media_links' | 'area_of_expertise') =>
    setFormData(p => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));

  // ── Validation & save ─────────────────────────────────────────────────────

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
    try {
      const payload = new FormData();
      payload.append('name',              formData.name);
      payload.append('phone_number',      formData.phone_number);
      payload.append('bio',               formData.bio);
      payload.append('organization_name', formData.organization_name);
      payload.append('website_url',       formData.website_url);
      // Arrays serialised as JSON strings — adjust if your backend expects repeated fields
      payload.append('social_media_links', JSON.stringify(formData.social_media_links.filter(Boolean)));
      payload.append('area_of_expertise',  JSON.stringify(formData.area_of_expertise.filter(Boolean)));
      if (profilePictureFile) payload.append('profile_picture', profilePictureFile);

      await updateOrganizerProfile(payload);
      setEditing(false);
      setProfilePictureFile(null);
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
    setFormErrors({});
    // Reset preview to server value
    setProfilePicturePreview(profile?.profile_picture_url ?? '');
    setProfilePictureFile(null);
    loadProfile();
  };

  // ── Render guards ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (pageError || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-600 font-semibold">{pageError ?? 'Profile not found.'}</p>
          <button onClick={loadProfile} className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const inp = (key: string) =>
    `w-full px-4 py-3 border ${formErrors[key] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your organizer profile and account settings</p>
          </div>
          {activeTab === 'profile' && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center"
            >
              <Edit className="w-5 h-5 mr-2" /> Edit Profile
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { value: 'profile',  label: 'Profile Info'    },
            { value: 'sessions', label: 'Active Sessions' },
          ] as { value: ActiveTab; label: string }[]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setActiveTab(value); setEditing(false); }}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === value
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ══ PROFILE TAB ══ */}
        {activeTab === 'profile' && (
          <>
            {/* Save error */}
            {saveError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            )}

            {/* Profile picture */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {editing && profilePicturePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {editing && (
                  <div className="flex-1">
                    <input type="file" id="profilePicture" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                    <label htmlFor="profilePicture" className="cursor-pointer inline-flex items-center px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                      <Upload className="w-4 h-4 mr-2" /> Upload New Picture
                    </label>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG or WEBP (MAX. 5MB)</p>
                    {formErrors.profilePicture && <p className="text-sm text-red-600 mt-1">{formErrors.profilePicture}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Basic information */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input type="text" value={formData.name} disabled={!editing}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className={inp('name')} />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>

                {/* Email — always read-only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" value={profile.email} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
                  <div className="mt-1.5 flex items-center justify-between flex-wrap gap-1.5">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Email cannot be edited directly.
                    </p>
                    <Link to="/contact" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                      <ExternalLink className="w-3.5 h-3.5" /> Contact us to change
                    </Link>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" value={formData.phone_number} disabled={!editing}
                    onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                    className={inp('phone_number')} />
                  {formErrors.phone_number && <p className="mt-1 text-sm text-red-600">{formErrors.phone_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                  <input type="text" value={formData.organization_name} disabled={!editing}
                    onChange={e => setFormData(p => ({ ...p, organization_name: e.target.value }))}
                    className={inp('organization_name')} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
                  <input type="url" value={formData.website_url} disabled={!editing}
                    placeholder="https://example.com"
                    onChange={e => setFormData(p => ({ ...p, website_url: e.target.value }))}
                    className={inp('website_url')} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea value={formData.bio} disabled={!editing} rows={4}
                    placeholder="Tell us about yourself and your organization…"
                    onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600 resize-none" />
                </div>
              </div>
            </div>

            {/* Social media */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Social Media Links</h2>
              <div className="space-y-3">
                {formData.social_media_links.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="url" value={link} disabled={!editing}
                      placeholder="https://twitter.com/yourhandle"
                      onChange={e => handleArrayChange(i, e.target.value, 'social_media_links')}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                    {editing && formData.social_media_links.length > 1 && (
                      <button type="button" onClick={() => removeArrayField(i, 'social_media_links')}
                        className="px-3 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {editing && (
                  <button type="button" onClick={() => addArrayField('social_media_links')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                    + Add Social Media Link
                  </button>
                )}
              </div>
            </div>

            {/* Area of expertise */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Area of Expertise</h2>
              <div className="space-y-3">
                {formData.area_of_expertise.map((area, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text" value={area} disabled={!editing}
                      placeholder="e.g., Music Festivals, Corporate Events"
                      onChange={e => handleArrayChange(i, e.target.value, 'area_of_expertise')}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                    {editing && formData.area_of_expertise.length > 1 && (
                      <button type="button" onClick={() => removeArrayField(i, 'area_of_expertise')}
                        className="px-3 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {editing && (
                  <button type="button" onClick={() => addArrayField('area_of_expertise')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                    + Add Area of Expertise
                  </button>
                )}
              </div>
            </div>

            {/* Account info (read-only) */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium text-gray-800 capitalize">{profile.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email Verified</p>
                    <p className={`font-medium ${profile.email_verified ? 'text-green-600' : 'text-red-500'}`}>
                      {profile.email_verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-800">
                      {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Account Status</p>
                    <p className={`font-medium ${profile.is_active ? 'text-green-600' : 'text-red-500'}`}>
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save / cancel */}
            {editing && (
              <div className="flex gap-4">
                <button type="button" onClick={handleCancelEdit}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmit} disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50">
                  {saving
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
                </button>
              </div>
            )}
          </>
        )}

        {/* ══ SESSIONS TAB ══ */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Active Sessions</h2>
            <p className="text-gray-600 mb-6">Devices currently signed in to your organizer account.</p>

            {sessionError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{sessionError}</p>
              </div>
            )}

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No active sessions found.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => {
                  const isCurrent = session.session_id === sessionId;
                  return (
                    <div
                      key={session.session_id}
                      className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${
                        isCurrent ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-blue-200' : 'bg-gray-200'}`}>
                          <Globe className={`w-5 h-5 ${isCurrent ? 'text-blue-700' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900">
                              {session.device_info ?? 'Unknown device'}
                            </p>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {session.ip_address ?? '—'}{session.location ? ` · ${session.location}` : ''}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Last active {timeAgo(session.last_used_at)}
                          </p>
                        </div>
                      </div>
                      {!isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(session.session_id)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 flex-shrink-0 mt-1 font-medium"
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
                className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sign out all other devices
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default OrganizerProfile;