import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { User, Mail, Phone, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Save } from 'lucide-react';
import { ProfileSEO } from '@shared/components/SEO';
import { getCurrentUser, updateUserContact, changeUserPassword } from '@shared/api/user/usersApi';
import { deactivateUserAccount } from '@shared/api/auth/authApi';
import type { User as UserData, UserPasswordChange, UserUpdate } from '@shared/types/User';


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
  email?: string;
  phone_number?: string;
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
  general?: string;
}

type ActiveTab = 'profile' | 'security';

const ProfileSettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone_number: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState<ShowPasswordsState>({
    old: false,
    new: false,
    confirm: false
  });

  const navigate = useNavigate();

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
          phone_number: userData.phone_number
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const validateProfileForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!profileForm.name || profileForm.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    }

    if (!profileForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!profileForm.phone_number || !/^(\+254|0)[17]\d{8}$/.test(profileForm.phone_number.trim())) {
      newErrors.phone_number = 'Please enter a valid Kenyan phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!passwordForm.old_password) {
      newErrors.old_password = 'Current password is required';
    }

    if (!passwordForm.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordForm.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (passwordForm.old_password === passwordForm.new_password) {
      newErrors.new_password = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (): Promise<void> => {
    if (!validateProfileForm()) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');

    try {
      const updatedData: UserUpdate = {
        name: profileForm.name,
        phone_number: profileForm.phone_number
      };
      const updatedUser: UserData = await updateUserContact(updatedData);

      setUser(updatedUser);

      if (user) {
        setUser({ ...user, ...profileForm });
      }
      setSuccessMessage('Profile updated successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);

      // Proper axios error handling
      if (axios.isAxiosError(error) && error.response) {
        const detail = error.response.data.detail || error.response.data.message;
        setErrors({ general: detail });
      } else {
        setErrors({ general: 'Failed to update profile. Please try again.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (): Promise<void> => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');

    try {
      const passwordData: UserPasswordChange = {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      };  

      await changeUserPassword(passwordData);

      setPasswordForm({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      setSuccessMessage('Password changed successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);

      // Proper axios error handling
      if (axios.isAxiosError(error) && error.response) {
        const detail = error.response.data.detail || error.response.data.message;
        setErrors({ general: detail });
      } else {
        setErrors({ general: 'Failed to change password. Please try again.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = async (): Promise<void> => {
    if (!window.confirm('Are you sure you want to deactivate your account? You can reactivate it later by logging in.')) {
      return;
    }

    try {
      await deactivateUserAccount();
      await logout();
      alert('Your account has been deactivated. You can reactivate it by logging in again within 90 days.');
      navigate('/login');

    } catch (error) {
      console.error('Error deactivating account:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <ProfileSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Account Settings</h2>
            <p className="text-gray-600">Manage your profile and account preferences</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setErrors({});
                    setSuccessMessage('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                      : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setActiveTab('security');
                    setErrors({});
                    setSuccessMessage('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center ${
                    activeTab === 'security'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                      : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <Lock className="w-5 h-5 mr-3" />
                  Password
                </button>
              </div>

              {/* Account Status */}
              {user && (
                <div className="mt-6 bg-white rounded-xl shadow-md p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Account Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="flex items-center text-green-600 font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Verified:</span>
                      {emailVerified ? (
                        <span className="flex items-center text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Yes
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 font-medium">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          No
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Member since:</span>
                      <span className="text-gray-800 font-medium">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setProfileForm({ ...profileForm, name: e.target.value });
                            setErrors({ ...errors, name: undefined });
                          }}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={profileForm.phone_number}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setProfileForm({ ...profileForm, phone_number: e.target.value });
                            setErrors({ ...errors, phone_number: undefined });
                          }}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                            errors.phone_number ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+254712345678"
                        />
                      </div>
                      {errors.phone_number && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.phone_number}
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleProfileUpdate}
                        disabled={isSaving}
                        className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                          isSaving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="bg-white rounded-xl shadow-md p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPasswords.old ? 'text' : 'password'}
                            value={passwordForm.old_password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setPasswordForm({ ...passwordForm, old_password: e.target.value });
                              setErrors({ ...errors, old_password: undefined });
                            }}
                            className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                              errors.old_password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.old_password && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.old_password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordForm.new_password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setPasswordForm({ ...passwordForm, new_password: e.target.value });
                              setErrors({ ...errors, new_password: undefined });
                            }}
                            className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                              errors.new_password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.new_password && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.new_password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordForm.confirm_password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setPasswordForm({ ...passwordForm, confirm_password: e.target.value });
                              setErrors({ ...errors, confirm_password: undefined });
                            }}
                            className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                              errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.confirm_password && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.confirm_password}
                          </p>
                        )}
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={handlePasswordChange}
                          disabled={isSaving}
                          className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                            isSaving
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            'Update Password'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
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
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfileSettingsPage;