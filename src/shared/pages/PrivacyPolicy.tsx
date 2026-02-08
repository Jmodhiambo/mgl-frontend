import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Mail, Calendar } from 'lucide-react';
import { PrivacySEO } from '@shared/components/SEO';

const PrivacyPolicy: React.FC = () => {
  document.title = 'Privacy Policy - MGLTickets';
  
  return (
    <>
      <PrivacySEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              At MGLTickets, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our event ticketing platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-700 mb-3">
                  We collect personal information that you voluntarily provide when you register on the platform, make a purchase, or contact us. This may include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Payment information (processed securely through M-Pesa)</li>
                  <li>Account credentials (username and password)</li>
                  <li>Profile information (for event organizers)</li>
                  <li>Event preferences and booking history</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                <p className="text-gray-700 mb-3">
                  When you access our platform, we may automatically collect certain information about your device and usage patterns:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>IP address and browser type</li>
                  <li>Operating system and device information</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Referring website addresses</li>
                  <li>Clickstream data and usage patterns</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>

            <p className="text-gray-700 mb-4">
              We use the information we collect in the following ways:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>To process your ticket purchases and manage your bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>To send you order confirmations, tickets, and event updates</span>
              </li>
              <li className="flex items-start gap-2">
                <UserCheck className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>To create and manage your account</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>To improve our services and user experience</span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>To personalize your experience and provide relevant event recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>To communicate with you about promotions, upcoming events, and platform updates (with your consent)</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>To detect, prevent, and address technical issues or fraudulent activity</span>
              </li>
            </ul>
          </div>

          {/* Information Sharing */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information Sharing and Disclosure</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>We may share your information in the following circumstances:</p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">With Event Organizers</h3>
                <p>When you purchase tickets, we share your name and contact information with the event organizer so they can manage attendance and communicate important event details.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">With Service Providers</h3>
                <p>We may share your information with third-party service providers who perform services on our behalf, such as payment processing (M-Pesa), email delivery, and data analysis. These providers are contractually obligated to protect your information.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">For Legal Reasons</h3>
                <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities, or to protect our rights, privacy, safety, or property.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>

            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Secure payment processing through trusted providers</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection practices</li>
            </ul>
            <p className="text-gray-700 mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
            </p>
          </div>

          {/* Your Rights */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Privacy Rights</h2>
            
            <div className="space-y-4 text-gray-700">
              <p>You have the following rights regarding your personal information:</p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Access and Portability</h3>
                <p>You have the right to request access to the personal information we hold about you and receive it in a portable format.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Correction</h3>
                <p>You can update or correct your personal information through your account settings or by contacting us.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Deletion</h3>
                <p>You may request deletion of your personal information, subject to certain legal obligations and legitimate business interests.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Opt-Out</h3>
                <p>You can opt out of receiving promotional emails by clicking the unsubscribe link in any marketing email or adjusting your account preferences.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Withdraw Consent</h3>
                <p>Where we process your information based on consent, you have the right to withdraw that consent at any time.</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-700">
                To exercise any of these rights, please contact us at <a href="mailto:privacy@mgltickets.com" className="text-orange-600 font-medium hover:text-orange-700">privacy@mgltickets.com</a>
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies and Tracking Technologies</h2>
            
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small data files stored on your device that help us:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our platform</li>
              <li>Improve our services and user experience</li>
              <li>Deliver relevant advertising (if applicable)</li>
            </ul>
            <p className="text-gray-700">
              You can control cookie settings through your browser preferences. However, disabling cookies may affect your ability to use certain features of our platform.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately so we can delete such information.
            </p>
          </div>

          {/* International Users */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">International Users</h2>
            <p className="text-gray-700">
              MGLTickets operates primarily in Kenya. If you are accessing our platform from outside Kenya, please be aware that your information may be transferred to, stored, and processed in Kenya where our servers are located. By using our platform, you consent to the transfer of your information to Kenya and the processing of your information in accordance with this Privacy Policy.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Email:</span> <a href="mailto:privacy@mgltickets.com" className="underline hover:text-orange-100">privacy@mgltickets.com</a>
              </p>
              <p>
                <span className="font-semibold">Phone:</span> +254 700 000 000
              </p>
              <p>
                <span className="font-semibold">Address:</span> MGLTickets, Nairobi, Kenya
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;