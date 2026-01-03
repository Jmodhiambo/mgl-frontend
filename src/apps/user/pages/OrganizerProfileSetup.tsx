import React, { useState } from 'react';
import { User, Building2, Globe, Instagram, Facebook, Twitter, Linkedin, Plus, X, Upload, Check, ArrowLeft } from 'lucide-react';

interface OrganizerProfile {
  bio: string;
  organization_name: string;
  website_url: string;
  profile_picture_url: string;
  social_media_links: string[];
  area_of_expertise: string[];
}

const OrganizerProfileSetup: React.FC = () => {
  const [formData, setFormData] = useState<OrganizerProfile>({
    bio: '',
    organization_name: '',
    website_url: '',
    profile_picture_url: '',
    social_media_links: [],
    area_of_expertise: []
  });

  const [newSocialLink, setNewSocialLink] = useState<string>('');
  const [newExpertise, setNewExpertise] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const expertiseOptions = [
    'Music & Entertainment',
    'Technology & Innovation',
    'Food & Beverage',
    'Sports & Fitness',
    'Arts & Culture',
    'Business & Networking',
    'Education & Training',
    'Health & Wellness',
    'Fashion & Beauty',
    'Charity & Fundraising'
  ];

  const handleInputChange = (field: keyof OrganizerProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profile_picture: 'Please upload a valid image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profile_picture: 'Image size should be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, profile_picture_url: result }));
        setErrors(prev => ({ ...prev, profile_picture: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSocialLink = () => {
    if (newSocialLink.trim()) {
      // Basic URL validation
      try {
        new URL(newSocialLink);
        setFormData(prev => ({
          ...prev,
          social_media_links: [...prev.social_media_links, newSocialLink.trim()]
        }));
        setNewSocialLink('');
        setErrors(prev => ({ ...prev, social_link: '' }));
      } catch {
        setErrors(prev => ({ ...prev, social_link: 'Please enter a valid URL' }));
      }
    }
  };

  const handleRemoveSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      social_media_links: prev.social_media_links.filter((_, i) => i !== index)
    }));
  };

  const handleAddExpertise = (expertise: string) => {
    if (!formData.area_of_expertise.includes(expertise)) {
      setFormData(prev => ({
        ...prev,
        area_of_expertise: [...prev.area_of_expertise, expertise]
      }));
    }
  };

  const handleRemoveExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      area_of_expertise: prev.area_of_expertise.filter(e => e !== expertise)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.trim().length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (!formData.organization_name.trim()) {
      newErrors.organization_name = 'Organization name is required';
    }

    if (formData.website_url && formData.website_url.trim()) {
      try {
        new URL(formData.website_url);
      } catch {
        newErrors.website_url = 'Please enter a valid URL';
      }
    }

    if (formData.area_of_expertise.length === 0) {
      newErrors.area_of_expertise = 'Please select at least one area of expertise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Replace with actual API call
      // const response = await fetch('/api/users/me/organizer-profile', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/my-events';
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (url: string): React.ReactNode => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (lowerUrl.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return <Twitter className="w-4 h-4" />;
    if (lowerUrl.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile Updated!</h2>
          <p className="text-gray-600 mb-2">Your organizer profile has been successfully set up.</p>
          <p className="text-sm text-gray-500">Redirecting to My Events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.location.href = '/my-events'}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to My Events</span>
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Setup Organizer Profile</h2>
          <p className="text-gray-600">Complete your profile to start organizing events and access the organizer portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Profile Picture Section */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Profile Picture
              </h3>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-orange-500" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Upload a professional profile picture</p>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 5MB</p>
                  {errors.profile_picture && (
                    <p className="text-xs text-red-600 mt-2">{errors.profile_picture}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bio</h3>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself and your experience in event organizing..."
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none ${
                  errors.bio ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">{formData.bio.length} / 500 characters (minimum 50)</p>
                {errors.bio && <p className="text-xs text-red-600">{errors.bio}</p>}
              </div>
            </div>

            {/* Organization Details */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Organization Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organization_name}
                    onChange={(e) => handleInputChange('organization_name', e.target.value)}
                    placeholder="e.g., MGLTickets Events, John's Entertainment"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                      errors.organization_name ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.organization_name && (
                    <p className="text-xs text-red-600 mt-1">{errors.organization_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                      errors.website_url ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.website_url && (
                    <p className="text-xs text-red-600 mt-1">{errors.website_url}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-500" />
                Social Media Links
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newSocialLink}
                    onChange={(e) => setNewSocialLink(e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {errors.social_link && (
                  <p className="text-xs text-red-600">{errors.social_link}</p>
                )}

                {formData.social_media_links.length > 0 && (
                  <div className="space-y-2">
                    {formData.social_media_links.map((link, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                        {getSocialIcon(link)}
                        <span className="flex-1 text-sm text-gray-700 truncate">{link}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Areas of Expertise */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Areas of Expertise <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {expertiseOptions.map((expertise) => (
                  <button
                    key={expertise}
                    type="button"
                    onClick={() => {
                      if (formData.area_of_expertise.includes(expertise)) {
                        handleRemoveExpertise(expertise);
                      } else {
                        handleAddExpertise(expertise);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                      formData.area_of_expertise.includes(expertise)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {expertise}
                  </button>
                ))}
              </div>
              {errors.area_of_expertise && (
                <p className="text-xs text-red-600">{errors.area_of_expertise}</p>
              )}

              {/* Custom Expertise Input */}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="Add custom expertise..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newExpertise.trim()) {
                        handleAddExpertise(newExpertise.trim());
                        setNewExpertise('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newExpertise.trim()) {
                      handleAddExpertise(newExpertise.trim());
                      setNewExpertise('');
                    }
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => window.location.href = '/my-events'}
              className="flex-1 border-2 border-gray-200 text-gray-700 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Complete Profile Setup'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default OrganizerProfileSetup;