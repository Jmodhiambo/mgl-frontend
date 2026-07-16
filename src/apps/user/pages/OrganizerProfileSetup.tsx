// src/apps/user/pages/OrganizerProfileSetup.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Building2, Globe, Instagram, Facebook, Twitter, Linkedin,
  Plus, X, Upload, Check, ArrowLeft, Loader2, AlertCircle, Camera,
} from 'lucide-react';
import { OrganizerProfileSEO } from '@shared/components/SEO';
import {
  getOrganizerProfile,
  updateOrganizerProfile,
  deleteOrganizerProfilePicture,
} from '@shared/api/organizer/orgUserApi';
import { useOrganizerProfile, FIELD_LABELS } from '@user/hooks/useOrganizerProfile';
import { useAuth } from '@shared/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrganizerProfile {
  name?: string;
  bio: string;
  organization_name: string;
  website_url: string;
  profile_picture_url: string;
  social_media_links: string[];
  area_of_expertise: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseApiError(err: any, fallback: string): string {
  const raw = err?.response?.data?.detail;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.map((e: any) => e.msg).join('; ');
  return fallback;
}

function getInitials(name?: string): string {
  if (!name) return '?';
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

const OrganizerProfileSetup: React.FC = () => {
  const [formData, setFormData] = useState<OrganizerProfile>({
    name: '',
    bio: '',
    organization_name: '',
    website_url: '',
    profile_picture_url: '',
    social_media_links: [],
    area_of_expertise: [],
  });

  const [newSocialLink, setNewSocialLink]   = useState('');
  const [newExpertise, setNewExpertise]     = useState('');
  const [imagePreview, setImagePreview]     = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [pageLoading, setPageLoading]       = useState(true);
  const [pageError, setPageError]           = useState<string | null>(null);
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState<string | null>(null);
  const [showSuccess, setShowSuccess]       = useState(false);
  const [errors, setErrors]                 = useState<Record<string, string>>({});

  // Shared status hook — same source Navbar reads from. Calling its
  // refetch() after a successful save is what makes the navbar switch to
  // "Organizer Dashboard" without needing a page reload.
  const { status: organizerStatus, refetch: refetchOrganizerStatus } = useOrganizerProfile();

  // AuthContext's user.role is what Navbar actually gates the organizer UI
  // on. The backend silently promotes 'user' -> 'organizer' on first
  // profile completion, so we need to pull that change into client state too
  // — refetching organizer status alone isn't enough for a first-timer.
  const { refreshUser } = useAuth();

  const expertiseOptions = [
    'Music & Entertainment', 'Technology & Innovation', 'Food & Beverage',
    'Sports & Fitness',      'Arts & Culture',          'Business & Networking',
    'Education & Training',  'Health & Wellness',       'Fashion & Beauty',
    'Charity & Fundraising',
  ];

  // ── Completion score ──────────────────────────────────────────────────────
  //
  // Driven by the server's status.missing_fields rather than recomputed
  // locally, so the percentage can never drift from what the backend
  // actually considers "complete" (this is also what unlocks the organizer
  // dashboard link in the navbar). Note: FIELD_LABELS — and therefore this
  // score — does NOT include social_media_links, because the backend's
  // completion check doesn't track it. Social links are still saved and
  // shown below, they just don't move this bar.
  const trackedFieldKeys = Object.keys(FIELD_LABELS);
  const missingFields    = organizerStatus?.missing_fields ?? [];
  const completionPct    = organizerStatus
    ? Math.round(((trackedFieldKeys.length - missingFields.length) / trackedFieldKeys.length) * 100)
    : 0;

  // ── Load profile ──────────────────────────────────────────────────────────

  const loadProfile = useCallback(async () => {
    setPageLoading(true);
    setPageError(null);
    try {
      const data = await getOrganizerProfile();
      setFormData({
        name:                data.name                ?? '',
        bio:                 data.bio                 ?? '',
        organization_name:   data.organization_name   ?? '',
        website_url:         data.website_url         ?? '',
        profile_picture_url: data.profile_picture_url ?? '',
        social_media_links:  Array.isArray(data.social_media_links) ? data.social_media_links : [],
        area_of_expertise:   Array.isArray(data.area_of_expertise)  ? data.area_of_expertise  : [],
      });
      setImagePreview(data.profile_picture_url ?? '');
    } catch (err) {
      setPageError(parseApiError(err, 'Failed to load your profile. Please try again.'));
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Picture handlers ──────────────────────────────────────────────────────

  const handleRemoveProfilePicture = async () => {
    if (formData.profile_picture_url && imagePreview === formData.profile_picture_url) {
      try { await deleteOrganizerProfilePicture(); } catch { /* non-fatal */ }
    }
    setProfilePictureFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, profile_picture_url: '' }));
    setErrors(prev => ({ ...prev, profile_picture: '' }));
  };

  // ── Form handlers ─────────────────────────────────────────────────────────

  const handleInputChange = (field: keyof OrganizerProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profile_picture: 'Please upload a valid image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profile_picture: 'Image must be under 5 MB' }));
      return;
    }
    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setErrors(prev => ({ ...prev, profile_picture: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddSocialLink = () => {
    if (!newSocialLink.trim()) return;
    setFormData(prev => ({ ...prev, social_media_links: [...prev.social_media_links, newSocialLink.trim()] }));
    setNewSocialLink('');
    setErrors(prev => ({ ...prev, social_link: '' }));
  };

  const handleRemoveSocialLink = (index: number) =>
    setFormData(prev => ({ ...prev, social_media_links: prev.social_media_links.filter((_, i) => i !== index) }));

  const handleToggleExpertise = (expertise: string) => {
    if (formData.area_of_expertise.includes(expertise)) {
      setFormData(prev => ({ ...prev, area_of_expertise: prev.area_of_expertise.filter(e => e !== expertise) }));
    } else {
      setFormData(prev => ({ ...prev, area_of_expertise: [...prev.area_of_expertise, expertise] }));
      if (errors.area_of_expertise) setErrors(prev => ({ ...prev, area_of_expertise: '' }));
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.bio.trim())                    errs.bio               = 'Bio is required';
    else if (formData.bio.trim().length < 50)    errs.bio               = 'Bio must be at least 50 characters';
    if (!formData.organization_name.trim())       errs.organization_name = 'Organization name is required';
    if (formData.area_of_expertise.length === 0) errs.area_of_expertise = 'Select at least one area of expertise';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setSaveError(null);
    setShowSuccess(false);
    try {
      const payload = new FormData();
      payload.append('bio',                formData.bio);
      payload.append('organization_name',  formData.organization_name);
      payload.append('website_url',        formData.website_url.trim() ? ensureHttps(formData.website_url) : '');
      payload.append('social_media_links', JSON.stringify(formData.social_media_links.map(ensureHttps)));
      payload.append('area_of_expertise',  JSON.stringify(formData.area_of_expertise));
      if (profilePictureFile) payload.append('profile_picture', profilePictureFile);
      await updateOrganizerProfile(payload);
      setShowSuccess(true);
      setProfilePictureFile(null);
      await Promise.all([loadProfile(), refetchOrganizerStatus(), refreshUser()]);
    } catch (err) {
      setSaveError(parseApiError(err, 'Failed to update profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const getSocialIcon = (url: string) => {
    const u = url.toLowerCase();
    if (u.includes('instagram'))                return <Instagram className="w-4 h-4" />;
    if (u.includes('facebook'))                 return <Facebook  className="w-4 h-4" />;
    if (u.includes('twitter') || u.includes('x.com')) return <Twitter className="w-4 h-4" />;
    if (u.includes('linkedin'))                 return <Linkedin  className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  // ── Render guards ─────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <>
        <OrganizerProfileSEO />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading your profile…</p>
          </div>
        </div>
      </>
    );
  }

  if (pageError) {
    return (
      <>
        <OrganizerProfileSEO />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-gray-800 font-semibold">{pageError}</p>
            <button onClick={loadProfile} className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
              Try again
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Shared input class ────────────────────────────────────────────────────

  const inp = (key: string) =>
    `w-full px-4 py-3 bg-gray-50 border ${errors[key] ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors`;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <OrganizerProfileSEO />
      <div className="min-h-screen bg-gray-50">

        {/* ── Identity hero band ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Back */}
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-orange-100">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      <span className="text-2xl font-black text-orange-500 tracking-tight">
                        {getInitials(formData.name)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-sm">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {/* Remove button */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Identity text + progress */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                  {formData.organization_name || formData.name || 'Your Profile'}
                </h1>
                <p className="text-sm font-medium text-gray-600 mt-0.5">Organizer account</p>

                {/* Completion bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Profile completion</span>
                    <span className={`text-xs font-bold ${completionPct === 100 ? 'text-green-600' : 'text-orange-500'}`}>
                      {completionPct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full sm:max-w-xs">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>

                  {missingFields.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Still needed: {missingFields.map(f => FIELD_LABELS[f] ?? f).join(' · ')}
                    </p>
                  )}
                </div>

                {errors.profile_picture && (
                  <p className="text-xs text-red-500 mt-2">{errors.profile_picture}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

            {/* About */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <SectionLabel>About you</SectionLabel>
              <div className="space-y-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Organization name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organization_name}
                    onChange={e => handleInputChange('organization_name', e.target.value)}
                    placeholder="e.g. Nairobi Live Events"
                    className={inp('organization_name')}
                  />
                  <FieldError msg={errors.organization_name} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Bio <span className="text-red-400">*</span>
                    </label>
                    <span className={`text-xs tabular-nums ${formData.bio.length < 50 ? 'text-orange-400' : 'text-gray-400'}`}>
                      {formData.bio.length} / 500
                    </span>
                  </div>
                  <textarea
                    value={formData.bio}
                    onChange={e => handleInputChange('bio', e.target.value)}
                    placeholder="Tell attendees what makes your events worth showing up for…"
                    rows={4}
                    className={`${inp('bio')} resize-none`}
                  />
                  <FieldError msg={errors.bio} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.website_url}
                      onChange={e => handleInputChange('website_url', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className={`${inp('website_url')} pl-9`}
                    />
                  </div>
                  <FieldError msg={errors.website_url} />
                </div>

              </div>
            </div>

            {/* Areas of expertise */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <SectionLabel>Areas of expertise <span className="text-red-400 normal-case">*</span></SectionLabel>
              <p className="text-xs font-medium text-gray-500 -mt-2 mb-4">Select all that apply — helps attendees find your events.</p>

              <div className="flex flex-wrap gap-2">
                {expertiseOptions.map(opt => {
                  const selected = formData.area_of_expertise.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleToggleExpertise(opt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        selected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                      }`}
                    >
                      {selected && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Custom tags */}
              {formData.area_of_expertise.filter(e => !expertiseOptions.includes(e)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                  {formData.area_of_expertise
                    .filter(e => !expertiseOptions.includes(e))
                    .map(e => (
                      <span key={e} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 text-white">
                        {e}
                        <button type="button" onClick={() => handleToggleExpertise(e)} className="hover:text-orange-200 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}

              <FieldError msg={errors.area_of_expertise} />

              {/* Add custom */}
              <div className="flex gap-2 mt-4">
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
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => { if (newExpertise.trim()) { handleToggleExpertise(newExpertise.trim()); setNewExpertise(''); } }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* Social media */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <SectionLabel>Social media</SectionLabel>

              {/* Existing links */}
              {formData.social_media_links.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.social_media_links.map((link, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 flex-shrink-0">{getSocialIcon(link)}</span>
                      <span className="flex-1 text-sm text-gray-700 truncate">{link}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add link */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSocialLink}
                  onChange={e => setNewSocialLink(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSocialLink(); } }}
                  placeholder="https://instagram.com/yourhandle"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              <FieldError msg={errors.social_link} />
            </div>

            {/* Feedback */}
            {showSuccess && (
              <div className="flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">Profile saved</p>
                  <p className="text-xs text-green-600 mt-0.5">Your changes are live on your organizer profile.</p>
                </div>
              </div>
            )}

            {saveError && (
              <div className="flex items-start gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pb-8">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></>
                ) : (
                  'Save profile'
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </>
  );
};

export default OrganizerProfileSetup;