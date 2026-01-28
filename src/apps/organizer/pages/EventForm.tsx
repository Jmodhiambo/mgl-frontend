import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, FileText, Upload, X, Save, ArrowLeft } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  venue: string;
  start_time: string;
  end_time: string;
  flyer: File | null;
}

interface EventFormProps {
  eventId?: number;
  mode: 'create' | 'edit';
}

const EventForm: React.FC<EventFormProps> = ({ eventId, mode = 'create' }) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    venue: '',
    start_time: '',
    end_time: '',
    flyer: null
  });

  const [flyerPreview, setFlyerPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (mode === 'edit' && eventId) {
      loadEventData();
    }
  }, [eventId, mode]);

  const loadEventData = async () => {
    // TODO: Fetch event data for editing
    // const event = await getEventById(eventId);
    // setFormData({
    //   title: event.title,
    //   description: event.description || '',
    //   venue: event.venue,
    //   start_time: event.start_time,
    //   end_time: event.end_time,
    //   flyer: null
    // });
    // setFlyerPreview(event.flyer_url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, flyer: 'File size must be less than 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, flyer: 'Please upload an image file' }));
        return;
      }

      setFormData(prev => ({ ...prev, flyer: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlyerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (errors.flyer) {
        setErrors(prev => ({ ...prev, flyer: '' }));
      }
    }
  };

  const removeFlyerPreview = () => {
    setFormData(prev => ({ ...prev, flyer: null }));
    setFlyerPreview('');
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    if (formData.start_time && formData.end_time) {
      const startDate = new Date(formData.start_time);
      const endDate = new Date(formData.end_time);
      
      if (endDate <= startDate) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    if (mode === 'create' && !formData.flyer) {
      newErrors.flyer = 'Event flyer is required';
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
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('venue', formData.venue);
      formDataToSend.append('start_time', formData.start_time);
      formDataToSend.append('end_time', formData.end_time);
      if (formData.flyer) {
        formDataToSend.append('flyer', formData.flyer);
      }

      // TODO: API call to create/update event
      // if (mode === 'create') {
      //   await createEvent(formDataToSend);
      // } else {
      //   await updateEvent(eventId, formDataToSend);
      // }

      // Navigate back to events list
      // navigate('/organizer/events');
      
      console.log('Form submitted:', formData);
      alert(`Event ${mode === 'create' ? 'created' : 'updated'} successfully!`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center text-gray-600 hover:text-orange-600 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Events
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Fill in the details below to create your event' 
              : 'Update your event information'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Event Title */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Summer Music Festival 2025"
              className={`w-full px-4 py-3 border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              placeholder="Tell people about your event..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <p className="mt-2 text-sm text-gray-500">
              {formData.description.length} / 1000 characters
            </p>
          </div>

          {/* Venue */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Venue *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="e.g., Kasarani Stadium, Nairobi"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.venue ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              />
            </div>
            {errors.venue && (
              <p className="mt-2 text-sm text-red-600">{errors.venue}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.start_time ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
                {errors.start_time && (
                  <p className="mt-2 text-sm text-red-600">{errors.start_time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.end_time ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
                {errors.end_time && (
                  <p className="mt-2 text-sm text-red-600">{errors.end_time}</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Flyer */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Flyer {mode === 'create' && '*'}
            </label>
            
            {flyerPreview ? (
              <div className="relative">
                <img
                  src={flyerPreview}
                  alt="Flyer preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeFlyerPreview}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
                <input
                  type="file"
                  id="flyer"
                  accept="image/*"
                  onChange={handleFlyerChange}
                  className="hidden"
                />
                <label
                  htmlFor="flyer"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="p-4 bg-orange-100 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">
                    Click to upload event flyer
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG or WEBP (MAX. 5MB)
                  </p>
                </label>
              </div>
            )}
            
            {errors.flyer && (
              <p className="mt-2 text-sm text-red-600">{errors.flyer}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {mode === 'create' ? 'Create Event' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;