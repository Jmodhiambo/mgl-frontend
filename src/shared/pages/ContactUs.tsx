import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, User, AlertCircle, CheckCircle, MessageCircle } from 'lucide-react';
import { ContactSEO } from '@shared/components/SEO';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  recaptchaToken: string;
}

interface SubmitResponse {
  success: boolean;
  referenceId?: string;
  message?: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: '',
    recaptchaToken: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [referenceId, setReferenceId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Get reCAPTCHA token (if you have it set up)
      // For now, we'll use a placeholder
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: 'placeholder_token' // Replace with actual reCAPTCHA token
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setSubmitStatus('error');
        setErrorMessage(data.detail || 'Too many requests. Please try again later.');
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send message');
      }

      // Success
      setSubmitStatus('success');
      setReferenceId(data.reference_id);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: 'general',
        message: '',
        recaptchaToken: ''
      });

      // Reset after 10 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setReferenceId('');
      }, 10000);
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
    <>
      <ContactSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Have a question or need assistance? We're here to help! Reach out to us through any of the channels below.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm mb-3">Our team typically responds within 24 hours</p>
              <a href="mailto:support@mgltickets.com" className="text-orange-600 hover:text-orange-700 font-medium">
                support@mgltickets.com
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-3">Mon-Fri, 9:00 AM - 6:00 PM EAT</p>
              <a href="tel:+254700000000" className="text-orange-600 hover:text-orange-700 font-medium">
                +254 700 000 000
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-600 text-sm mb-3">Quick response, available 24/7</p>
              <a 
                href="https://wa.me/254799602055" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm mb-3">MGLTickets Office</p>
              <p className="text-orange-600 font-medium">
                Nairobi, Kenya
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              
              {submitStatus === 'success' && referenceId && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-green-800 font-medium mb-2">Message sent successfully!</p>
                      <p className="text-green-700 text-sm mb-3">
                        We've received your message and will get back to you within 24 hours.
                      </p>
                      <div className="bg-white border border-green-300 rounded p-3">
                        <p className="text-xs text-green-700 mb-1 font-medium">Your Reference Number:</p>
                        <p className="text-lg font-bold text-green-800 font-mono">{referenceId}</p>
                        <p className="text-xs text-green-600 mt-2">Please save this reference number for tracking your inquiry.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="refund">Refund Request</option>
                    <option value="organizer">Event Organizer Support</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="feedback">Feedback & Suggestions</option>
                  </select>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Brief description of your inquiry"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Please provide details about your inquiry..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length} characters (minimum 10)
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday:</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday:</span>
                    <span>Closed</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      * Email support is available 24/7. We aim to respond within 24 hours.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <a href="/faq" className="block text-orange-600 hover:text-orange-700 font-medium">
                    → Frequently Asked Questions
                  </a>
                  <a href="/help" className="block text-orange-600 hover:text-orange-700 font-medium">
                    → Help Center
                  </a>
                  <a href="/refund" className="block text-orange-600 hover:text-orange-700 font-medium">
                    → Refund Policy
                  </a>
                  <a href="/terms" className="block text-orange-600 hover:text-orange-700 font-medium">
                    → Terms of Service
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Department Contacts</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold">General Support</p>
                    <a href="mailto:support@mgltickets.com" className="opacity-90 hover:opacity-100">
                      support@mgltickets.com
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold">Event Organizers</p>
                    <a href="mailto:organizers@mgltickets.com" className="opacity-90 hover:opacity-100">
                      organizers@mgltickets.com
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold">Billing & Refunds</p>
                    <a href="mailto:billing@mgltickets.com" className="opacity-90 hover:opacity-100">
                      billing@mgltickets.com
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold">Partnerships</p>
                    <a href="mailto:partnerships@mgltickets.com" className="opacity-90 hover:opacity-100">
                      partnerships@mgltickets.com
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold">Press & Media</p>
                    <a href="mailto:press@mgltickets.com" className="opacity-90 hover:opacity-100">
                      press@mgltickets.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;