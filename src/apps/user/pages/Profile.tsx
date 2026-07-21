// src/apps/user/pages/Profile.tsx

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import {
  getUserSessions,
  revokeUserSession,
  revokeAllOtherUserSessions,
} from '@shared/api/user/profileApi';
import {
  User, Mail, Phone, Lock, CheckCircle, AlertCircle,
  Eye, EyeOff, Save, Globe, Clock, LogOut, X, ExternalLink,
} from 'lucide-react';
import { ProfileSEO } from '@shared/components/SEO';
import { getCurrentUser, updateUserContact, changeUserPassword } from '@shared/api/user/usersApi';
import { deactivateUserAccount } from '@shared/api/auth/authApi';
import { timeAgo } from '@shared/utils/timeAgo';
import type { User as UserData, UserPasswordChange, UserUpdate } from '@shared/types/User';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileFormData {
  name: string;
  email: string;
  phone_number: string;
}

interface PasswordFormData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

interface ShowPasswordsState {
  old: boolean;
  new: boolean;
  confirm: boolean;
}

interface FormErrors {
  name?: string;
  phone_number?: string;
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
  general?: string;
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

type ActiveTab = 'profile' | 'security' | 'sessions';

// ─── Component ────────────────────────────────────────────────────────────────

const ProfileSettingsPage: React.FC = () => {
  const { logout, sessionId } = useAuth();
  const [user, setUser]             = useState<UserData | null>(null);
  const [activeTab, setActiveTab]   = useState<ActiveTab>('profile');
  const [loading, setLoading]       = useState<boolean>(true);
  const [isSaving, setIsSaving]     = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [emailVerified, setEmailVerified]   = useState<boolean>(false);
  const [errors, setErrors]         = useState<FormErrors>({});

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '', email: '', phone_number: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    old_password: '', new_password: '', confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState<ShowPasswordsState>({
    old: false, new: false, confirm: false,
  });

  const [sessions, setSessions]               = useState<RefreshSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionError, setSessionError]       = useState<string | null>(null);

  const navigate = useNavigate();

  // ── Data fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    document.title = 'Profile Settings - MGLTickets';
    const fetchUserData = async (): Promise<void> => {
      try {
        const userData: UserData = await getCurrentUser();
        setUser(userData);
        setEmailVerified(userData.email_verified);
        setProfileForm({
          name: userData.name,
          email: userData.email,
          phone_number: userData.phone_number,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'sessions' && sessions.length === 0 && !sessionsLoading) {
      fetchSessions();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSessions = async () => {
    setSessionsLoading(true);
    setSessionError(null);
    try {
      const data = await getUserSessions();
      setSessions(data);
    } catch {
      setSessionError('Failed to load sessions. Please try again.');
    } finally {
      setSessionsLoading(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validateProfileForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!profileForm.name || profileForm.name.trim().length < 3)
      newErrors.name = 'Name must be at least 3 characters long';
    if (!profileForm.phone_number || !/^(\+254|0)[17]\d{8}$/.test(profileForm.phone_number.trim()))
      newErrors.phone_number = 'Please enter a valid Kenyan phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!passwordForm.old_password) newErrors.old_password = 'Current password is required';
    if (!passwordForm.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordForm.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    }
    if (passwordForm.new_password !== passwordForm.confirm_password)
      newErrors.confirm_password = 'Passwords do not match';
    if (passwordForm.old_password === passwordForm.new_password)
      newErrors.new_password = 'New password must be different from current password';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleProfileUpdate = async (): Promise<void> => {
    if (!validateProfileForm()) return;
    setIsSaving(true);
    setSuccessMessage('');
    try {
      const updatedUser: UserData = await updateUserContact({
        name: profileForm.name,
        phone_number: profileForm.phone_number,
      } as UserUpdate);
      setUser(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        setErrors({ general: error.response.data.detail || error.response.data.message });
      else
        setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (): Promise<void> => {
    if (!validatePasswordForm()) return;
    setIsSaving(true);
    setSuccessMessage('');
    try {
      await changeUserPassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      } as UserPasswordChange);
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        setErrors({ general: error.response.data.detail || error.response.data.message });
      else
        setErrors({ general: 'Failed to change password. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = async (): Promise<void> => {
    if (!window.confirm('Are you sure you want to deactivate your account? You can reactivate it later by logging in.')) return;
    try {
      await deactivateUserAccount();
      await logout();
      alert('Your account has been deactivated. You can reactivate it by logging in again within 90 days.');
      navigate('/login');
    } catch (error) {
      console.error('Error deactivating account:', error);
    }
  };

  const handleRevokeSession = async (targetSessionId: string) => {
    try {
      await revokeUserSession(targetSessionId);
      setSessions(prev => prev.filter(s => s.session_id !== targetSessionId));
    } catch {
      setSessionError('Failed to revoke session. Please try again.');
    }
  };

  const handleRevokeAllOther = async () => {
    if (!sessionId) return;
    try {
      await revokeAllOtherUserSessions(sessionId);
      setSessions(prev => prev.filter(s => s.session_id === sessionId));
    } catch {
      setSessionError('Failed to sign out other sessions. Please try again.');
    }
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <ProfileSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Account Settings</h2>
            <p className="text-gray-600">Manage your profile and account preferences</p>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* ── Sidebar ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
                {([
                  { value: 'profile',  label: 'Profile',         icon: User  },
                  { value: 'security', label: 'Password',        icon: Lock  },
                  { value: 'sessions', label: 'Active Sessions', icon: Globe },
                ] as { value: ActiveTab; label: string; icon: React.ElementType }[]).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => { setActiveTab(value); setErrors({}); setSuccessMessage(''); }}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center ${
                      activeTab === value
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {label}
                  </button>
                ))}
              </div>

              {user && (
                <div className="mt-6 bg-white rounded-xl shadow-md p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Account Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="flex items-center text-green-600 font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" /> Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Verified:</span>
                      {emailVerified ? (
                        <span className="flex items-center text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" /> Yes
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 font-medium">
                          <AlertCircle className="w-4 h-4 mr-1" /> No
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Member since:</span>
                      <span className="text-gray-800 font-medium">{formatDate(user.created_at)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Main Content ── */}
            <div className="lg:col-span-3">

              {/* ══ Profile Tab ══ */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h3>
                  <div className="space-y-6">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="name"
                          autoComplete="name"
                          value={profileForm.name}
                          onChange={e => { setProfileForm({ ...profileForm, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.name}</p>}
                    </div>

                    {/* ── Email — read-only ── */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          autoComplete="username"
                          value={profileForm.email}
                          disabled
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Your email address cannot be edited directly.
                        </p>
                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Contact us to change email
                        </Link>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="tel"
                          autoComplete="tel"
                          value={profileForm.phone_number}
                          onChange={e => { setProfileForm({ ...profileForm, phone_number: e.target.value }); setErrors({ ...errors, phone_number: undefined }); }}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="+254712345678"
                        />
                      </div>
                      {errors.phone_number && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.phone_number}</p>}
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleProfileUpdate}
                        disabled={isSaving}
                        className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                          isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                        }`}
                      >
                        {isSaving
                          ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />Saving...</>
                          : <><Save className="w-5 h-5 mr-2" />Save Changes</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ Security Tab ══ */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-md p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">Change Password</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      This updates the password for your whole MGLTickets account —
                      it applies to the organizer and admin apps too.
                    </p>

                    {/*
                      Real <form> with an explicit onSubmit — the update now
                      only fires on a click (or Enter within a field), never
                      as a side-effect of typing or of the browser's
                      "suggest strong password" autofill.

                      The disabled email field is deliberate: without a
                      username-type field to anchor to, the browser's
                      password manager can behave unpredictably around
                      password-only forms (including firing saves without a
                      click). autoComplete="username" is the standard fix,
                      and it also tells the password manager which account
                      the new password belongs to.
                    */}
                    <form onSubmit={e => { e.preventDefault(); handlePasswordChange(); }} autoComplete="off">
                      <div className="space-y-6">

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="email"
                              name="email"
                              autoComplete="username"
                              value={profileForm.email}
                              disabled
                              readOnly
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {(['old_password', 'new_password', 'confirm_password'] as const).map(field => {
                          const labels = { old_password: 'Current Password', new_password: 'New Password', confirm_password: 'Confirm New Password' };
                          const showKey = field === 'old_password' ? 'old' : field === 'new_password' ? 'new' : 'confirm';
                          const fieldName =
                            field === 'old_password' ? 'current-password'
                            : field === 'new_password' ? 'new-password'
                            : 'confirm-new-password';
                          const autoComplete = field === 'old_password' ? 'current-password' : 'new-password';
                          return (
                            <div key={field}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{labels[field]}</label>
                              <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                  type={showPasswords[showKey] ? 'text' : 'password'}
                                  name={fieldName}
                                  autoComplete={autoComplete}
                                  value={passwordForm[field]}
                                  onChange={e => { setPasswordForm({ ...passwordForm, [field]: e.target.value }); setErrors({ ...errors, [field]: undefined }); }}
                                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
                                  placeholder={field === 'old_password' ? 'Enter current password' : field === 'new_password' ? 'Enter new password' : 'Confirm new password'}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords({ ...showPasswords, [showKey]: !showPasswords[showKey] })}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showPasswords[showKey] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                              {errors[field] && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors[field]}</p>}
                            </div>
                          );
                        })}
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={isSaving}
                            className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                              isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                            }`}
                          >
                            {isSaving
                              ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />Updating...</>
                              : 'Update Password'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-8 border-2 border-red-200">
                    <h3 className="text-2xl font-bold text-red-600 mb-4">Danger Zone</h3>
                    <p className="text-gray-600 mb-6">
                      Deactivating your account will temporarily disable access. You can reactivate it anytime by logging in within 90 days.
                    </p>
                    <button
                      onClick={handleDeactivateAccount}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Deactivate Account
                    </button>
                  </div>
                </div>
              )}

              {/* ══ Sessions Tab ══ */}
              {activeTab === 'sessions' && (
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Active Sessions</h3>
                  <p className="text-gray-600 mb-6">Devices currently signed in to your account.</p>

                  {sessionError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{sessionError}</p>
                    </div>
                  )}

                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
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
                              isCurrent ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isCurrent ? 'bg-orange-200' : 'bg-gray-200'
                              }`}>
                                <Globe className={`w-5 h-5 ${isCurrent ? 'text-orange-700' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {session.device_info ?? 'Unknown device'}
                                  </p>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
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
        </main>
      </div>
    </>
  );
};

export default ProfileSettingsPage;