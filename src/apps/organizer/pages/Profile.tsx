// src/apps/organizer/pages/Profile.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, Globe, Upload,
  X, Save, Edit, Trash2, Clock, LogOut, AlertCircle, ExternalLink,
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import {
  getOrganizerSessions,
  revokeOrganizerSession,
  revokeAllOtherOrganizerSessions,
} from '@shared/api/organizer/orgProfileApi';
import { timeAgo } from '@shared/utils/timeAgo';

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
  organizer_info: {
    bio?: string;
    organization_name?: string;
    website_url?: string;
    profile_picture_url?: string;
    social_media_links?: string[];
    area_of_expertise?: string[];
  };
}

interface RefreshSession {
  session_id: string;
  user_id: number;
  device_info: string | null;
  ip_address: string | null;
  location: string | null;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  revoked_at: string | null;
  replaced_by_sid: string | null;
  is_active: boolean;
}

type ActiveTab = 'profile' | 'sessions';

// ─── Component ────────────────────────────────────────────────────────────────

const OrganizerProfile: React.FC = () => {
  const { sessionId } = useAuth();
  const [profile, setProfile]   = useState<OrganizerProfile | null>(null);
  const [loading, setLoading]   = useState(false);
  const [editing, setEditing]   = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    bio: '',
    organization_name: '',
    website_url: '',
    social_media_links: [''],
    area_of_expertise: [''],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [sessions, setSessions]               = useState<RefreshSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionError, setSessionError]       = useState<string | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────

  useEffect(() => { loadProfile(); }, []);

  useEffect(() => {
    if (activeTab === 'sessions' && sessions.length === 0 && !sessionsLoading) fetchSessions();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async () => {
    setLoading(true);
    // TODO: replace mock with real API call
    const mockProfile: OrganizerProfile = {
      id: 1,
      name: 'John Organizer',
      email: 'john.organizer@example.com',
      phone_number: '+254712345678',
      role: 'organizer',
      email_verified: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      organizer_info: {
        bio: 'Passionate event organizer with 10+ years of experience creating memorable experiences',
        organization_name: 'Epic Events Kenya',
        website_url: 'https://epicevents.ke',
        profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        social_media_links: ['https://twitter.com/epicevents', 'https://instagram.com/epicevents'],
        area_of_expertise: ['Music Festivals', 'Corporate Events', 'Conferences'],
      },
    };
    setProfile(mockProfile);
    setFormData({
      name: mockProfile.name,
      phone_number: mockProfile.phone_number,
      bio: mockProfile.organizer_info?.bio || '',
      organization_name: mockProfile.organizer_info?.organization_name || '',
      website_url: mockProfile.organizer_info?.website_url || '',
      social_media_links: mockProfile.organizer_info?.social_media_links || [''],
      area_of_expertise: mockProfile.organizer_info?.area_of_expertise || [''],
    });
    setProfilePicturePreview(mockProfile.organizer_info?.profile_picture_url || '');
    setLoading(false);
  };

  const fetchSessions = async () => {
    setSessionsLoading(true);
    setSessionError(null);
    try {
      const data = await getOrganizerSessions();
      setSessions(data);
    } catch {
      setSessionError('Failed to load sessions. Please try again.');
    } finally {
      setSessionsLoading(false);
    }
  };

  // ── Session handlers ──────────────────────────────────────────────────────

  const handleRevokeSession = async (targetSessionId: string) => {
    try {
      await revokeOrganizerSession(targetSessionId);
      setSessions(prev => prev.filter(s => s.session_id !== targetSessionId));
    } catch {
      setSessionError('Failed to revoke session. Please try again.');
    }
  };

  const handleRevokeAllOther = async () => {
    if (!sessionId) return;
    try {
      await revokeAllOtherOrganizerSessions(sessionId);
      setSessions(prev => prev.filter(s => s.session_id === sessionId));
    } catch {
      setSessionError('Failed to sign out other sessions. Please try again.');
    }
  };

  // ── Profile handlers ──────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleArrayInputChange = (
    index: number, value: string,
    field: 'social_media_links' | 'area_of_expertise'
  ) => {
    setFormData(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayField    = (field: 'social_media_links' | 'area_of_expertise') =>
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));

  const removeArrayField = (index: number, field: 'social_media_links' | 'area_of_expertise') =>
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, profilePicture: 'File size must be less than 5MB' })); return; }
    if (!file.type.startsWith('image/')) { setErrors(prev => ({ ...prev, profilePicture: 'Please upload an image file' })); return; }
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicturePreview(reader.result as string);
    reader.readAsDataURL(file);
    if (errors.profilePicture) setErrors(prev => ({ ...prev, profilePicture: '' }));
  };

  const removeProfilePicture = () => {
    setProfilePicturePreview('');
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // TODO: await updateOrganizerProfile(formData);
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your organizer profile and information</p>
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

        {/* ══ Profile Tab ══ */}
        {activeTab === 'profile' && (
          <>
            {/* Profile Picture */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-orange-200" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {editing && profilePicturePreview && (
                    <button type="button" onClick={removeProfilePicture}
                      className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
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
                    {errors.profilePicture && <p className="text-sm text-red-600 mt-1">{errors.profilePicture}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!editing}
                    className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600`} />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* ── Email — read-only ── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" value={profile?.email ?? ''} disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
                  <div className="mt-1.5 flex items-center justify-between flex-wrap gap-1.5">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Email cannot be edited directly.
                    </p>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Contact us to change
                    </Link>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} disabled={!editing}
                    className={`w-full px-4 py-3 border ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600`} />
                  {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                  <input type="text" name="organization_name" value={formData.organization_name} onChange={handleInputChange} disabled={!editing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
                  <input type="url" name="website_url" value={formData.website_url} onChange={handleInputChange} disabled={!editing}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={!editing} rows={4}
                    placeholder="Tell us about yourself and your organization..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 resize-none" />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Social Media Links</h2>
              <div className="space-y-3">
                {formData.social_media_links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <input type="url" value={link}
                      onChange={e => handleArrayInputChange(index, e.target.value, 'social_media_links')}
                      disabled={!editing} placeholder="https://twitter.com/yourhandle"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600" />
                    {editing && formData.social_media_links.length > 1 && (
                      <button type="button" onClick={() => removeArrayField(index, 'social_media_links')}
                        className="px-3 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
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

            {/* Area of Expertise */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Area of Expertise</h2>
              <div className="space-y-3">
                {formData.area_of_expertise.map((area, index) => (
                  <div key={index} className="flex gap-2">
                    <input type="text" value={area}
                      onChange={e => handleArrayInputChange(index, e.target.value, 'area_of_expertise')}
                      disabled={!editing} placeholder="e.g., Music Festivals, Corporate Events"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600" />
                    {editing && formData.area_of_expertise.length > 1 && (
                      <button type="button" onClick={() => removeArrayField(index, 'area_of_expertise')}
                        className="px-3 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
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

            {editing && (
              <div className="flex gap-4">
                <button type="button" onClick={() => { setEditing(false); loadProfile(); }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50">
                  {loading
                    ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    : <><Save className="w-5 h-5 mr-2" />Save Changes</>}
                </button>
              </div>
            )}
          </>
        )}

        {/* ══ Sessions Tab ══ */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Active Sessions</h2>
            <p className="text-gray-600 mb-6">Devices currently signed in to your organizer account.</p>

            {sessionError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                <p className="text-red-700 text-sm">{sessionError}</p>
              </div>
            )}

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
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
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCurrent ? 'bg-blue-200' : 'bg-gray-200'
                        }`}>
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