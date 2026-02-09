import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Globe, Upload, X, Save, Edit, Trash2 } from 'lucide-react';

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

const OrganizerProfile: React.FC = () => {
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    bio: '',
    organization_name: '',
    website_url: '',
    social_media_links: [''],
    area_of_expertise: ['']
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    // const response = await getOrganizerProfile();
    
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
        area_of_expertise: ['Music Festivals', 'Corporate Events', 'Conferences']
      }
    };

    setProfile(mockProfile);
    setFormData({
      name: mockProfile.name,
      phone_number: mockProfile.phone_number,
      bio: mockProfile.organizer_info?.bio || '',
      organization_name: mockProfile.organizer_info?.organization_name || '',
      website_url: mockProfile.organizer_info?.website_url || '',
      social_media_links: mockProfile.organizer_info?.social_media_links || [''],
      area_of_expertise: mockProfile.organizer_info?.area_of_expertise || ['']
    });
    setProfilePicturePreview(mockProfile.organizer_info?.profile_picture_url || '');
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayInputChange = (index: number, value: string, field: 'social_media_links' | 'area_of_expertise') => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayField = (field: 'social_media_links' | 'area_of_expertise') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index: number, field: 'social_media_links' | 'area_of_expertise') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: 'File size must be less than 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: 'Please upload an image file' }));
        return;
      }

      setProfilePicture(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (errors.profilePicture) {
        setErrors(prev => ({ ...prev, profilePicture: '' }));
      }
    }
  };

  const removeProfilePicture = async () => {
    // TODO: API call to delete profile picture
    // await deleteOrganizerProfilePicture();
    
    setProfilePicture(null);
    setProfilePicturePreview('');
    alert('Profile picture removed successfully');
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('phone_number', formData.phone_number);
      updateData.append('bio', formData.bio);
      updateData.append('organization_name', formData.organization_name);
      updateData.append('website_url', formData.website_url);
      updateData.append('social_media_links', JSON.stringify(formData.social_media_links.filter(link => link)));
      updateData.append('area_of_expertise', JSON.stringify(formData.area_of_expertise.filter(area => area)));
      
      if (profilePicture) {
        updateData.append('profile_picture', profilePicture);
      }

      // TODO: API call to update profile
      // await updateOrganizerProfile(updateData);

      console.log('Profile updated:', formData);
      alert('Profile updated successfully!');
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your organizer profile and information</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Picture */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {editing && profilePicturePreview && (
                <button
                  type="button"
                  onClick={removeProfilePicture}
                  className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {editing && (
              <div className="flex-1">
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePicture"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Picture
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG or WEBP (MAX. 5MB)</p>
                {errors.profilePicture && (
                  <p className="text-sm text-red-600 mt-1">{errors.profilePicture}</p>
                )}
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
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-4 py-3 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profile?.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-4 py-3 border ${
                  errors.phone_number ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600`}
              />
              {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!editing}
                rows={4}
                placeholder="Tell us about yourself and your organization..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Social Media Links</h2>
          <div className="space-y-3">
            {formData.social_media_links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => handleArrayInputChange(index, e.target.value, 'social_media_links')}
                  disabled={!editing}
                  placeholder="https://twitter.com/yourhandle"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
                {editing && formData.social_media_links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField(index, 'social_media_links')}
                    className="px-3 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button
                type="button"
                onClick={() => addArrayField('social_media_links')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
              >
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
                <input
                  type="text"
                  value={area}
                  onChange={(e) => handleArrayInputChange(index, e.target.value, 'area_of_expertise')}
                  disabled={!editing}
                  placeholder="e.g., Music Festivals, Corporate Events"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
                {editing && formData.area_of_expertise.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField(index, 'area_of_expertise')}
                    className="px-3 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button
                type="button"
                onClick={() => addArrayField('area_of_expertise')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
              >
                + Add Area of Expertise
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                loadProfile();
              }}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerProfile;