// src/organizer/pages/OrganizerContact.tsx
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Send, AlertCircle, CheckCircle, Clock, HelpCircle } from 'lucide-react';
import { executeRecaptcha, loadRecaptchaScript, RECAPTCHA_CONFIG } from '@shared/config/recaptcha';
import { WHATSAPP_URL, SUPPORT_PHONE_NUMBER, ORGANIZER_EMAIL } from '@shared/components/ENV';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  event_id: string;
}

const OrganizerContact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'event_management',
    message: '',
    event_id: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        await loadRecaptchaScript();
        setRecaptchaLoaded(true);
      } catch (error) {
        console.error('Failed to load reCAPTCHA:', error);
        setRecaptchaLoaded(false);
      }
    };
    initRecaptcha();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim() || formData.name.length < 2) {
      setErrorMessage('Please enter your name (at least 2 characters)');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!formData.subject.trim() || formData.subject.length < 3) {
      setErrorMessage('Please enter a subject (at least 3 characters)');
      return false;
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      setErrorMessage('Please enter a message (at least 10 characters)');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    if (!recaptchaLoaded) {
      setErrorMessage('Security verification not loaded. Please refresh the page.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const recaptchaToken = await executeRecaptcha(RECAPTCHA_CONFIG.action.contact);

      // TODO: Replace with actual API call
      // const response = await submitOrganizerContactMessage({
      //   ...formData,
      //   recaptcha_token: recaptchaToken
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockReferenceId = `ORG-${Date.now().toString().slice(-8)}`;

      setSubmitStatus('success');
      setReferenceId(mockReferenceId);
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: 'event_management',
        message: '',
        event_id: ''
      });

      setTimeout(() => {
        setSubmitStatus('idle');
        setReferenceId('');
      }, 150000);
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to send message. Please try again or contact us directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Organizer Support</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Need help managing your events? Our support team is here to assist you with any questions or issues.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm mb-3">Our team typically responds within 4 hours</p>
            <a href={`mailto:${ORGANIZER_EMAIL}`} className="text-blue-600 hover:text-blue-700 font-medium">
              {ORGANIZER_EMAIL}
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600 text-sm mb-3">Mon-Fri, 9:00 AM - 6:00 PM EAT</p>
            <a href={`tel:${SUPPORT_PHONE_NUMBER}`} className="text-blue-600 hover:text-blue-700 font-medium">
              {SUPPORT_PHONE_NUMBER}
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-gray-600 text-sm mb-3">Priority support for organizers</p>
            <a 
              href={WHATSAPP_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Contact Form and Info */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {submitStatus === 'success' && referenceId && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium mb-2">Message sent successfully!</p>
                    <p className="text-green-700 text-sm mb-3">
                      Our support team will get back to you within 4 hours during business hours.
                    </p>
                    <div className="bg-white border border-green-300 rounded p-3">
                      <p className="text-xs text-green-700 mb-1 font-medium">Your Reference Number:</p>
                      <p className="text-lg font-bold text-green-800 font-mono">{referenceId}</p>
                      <p className="text-xs text-green-600 mt-2">Please save this reference number for tracking.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Failed to send message</p>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="+254 700 000 000"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Support Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="event_management">Event Creation & Management</option>
                  <option value="ticket_sales">Ticket Sales & Bookings</option>
                  <option value="payouts">Payout & Billing Issues</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="co_organizers">Co-Organizer Management</option>
                  <option value="marketing">Marketing & Promotion</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="event_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Event ID (Optional)
                </label>
                <input
                  type="text"
                  id="event_id"
                  name="event_id"
                  value={formData.event_id}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., 12345"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If your inquiry is about a specific event, provide the Event ID for faster assistance.
                </p>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Please provide details about your inquiry..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length} characters (minimum 10)
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !recaptchaLoaded}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                This site is protected by reCAPTCHA and the Google{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                apply.
              </p>
            </div>
          </div>

          {/* Support Info */}
          <div className="space-y-6">
            {/* Response Time */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Response Time</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Priority Issues:</span>
                  <span className="text-blue-600 font-semibold">Within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">General Inquiries:</span>
                  <span>Within 4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Outside Business Hours:</span>
                  <span>Next business day</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    * Business hours: Monday-Friday, 9:00 AM - 6:00 PM EAT
                  </p>
                </div>
              </div>
            </div>

            {/* Common Topics */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Common Support Topics</h3>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Event Setup</h4>
                  <p className="text-sm text-gray-600">Creating events, ticket types, pricing</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Sales & Revenue</h4>
                  <p className="text-sm text-gray-600">Tracking sales, payout schedules</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Customer Management</h4>
                  <p className="text-sm text-gray-600">Bookings, refunds, attendee communication</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">Technical Issues</h4>
                  <p className="text-sm text-gray-600">Platform bugs, upload problems</p>
                </div>
              </div>
            </div>

            {/* Department Contacts */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Direct Department Contacts</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">Organizer Support</p>
                  <a href="mailto:organizers@mgltickets.com" className="opacity-90 hover:opacity-100">
                    organizers@mgltickets.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold">Billing & Payouts</p>
                  <a href="mailto:billing@mgltickets.com" className="opacity-90 hover:opacity-100">
                    billing@mgltickets.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold">Technical Support</p>
                  <a href="mailto:tech@mgltickets.com" className="opacity-90 hover:opacity-100">
                    tech@mgltickets.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold">Partnerships</p>
                  <a href="mailto:partnerships@mgltickets.com" className="opacity-90 hover:opacity-100">
                    partnerships@mgltickets.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerContact;