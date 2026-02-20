import React from 'react';
import { Cookie, AlertCircle, CheckCircle, XCircle, Settings, Eye, Shield } from 'lucide-react';

/**
 * CookieContent
 *
 * Pure content component — no SEO tags, no page-level layout.
 * Safe to render inside a modal or a full page.
 *
 * Used by:
 *   - CookiePolicy.tsx  (full page wrapper)
 *   - Any modal that needs to show cookie policy
 *
 * When you update cookie policy copy, edit ONLY this file.
 */
const CookieContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
          <Cookie className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Introduction */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <p className="text-gray-700 leading-relaxed mb-4">
          This Cookie Policy explains how MGLTickets ("we", "us", or "our") uses cookies and similar technologies when you visit our website at mgltickets.com and use our services. This policy provides you with clear and comprehensive information about the cookies we use and the purposes for using them.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Important:</span> By continuing to use our website, you consent to our use of cookies as described in this policy. You can manage your cookie preferences at any time through your browser settings.
          </p>
        </div>
      </div>

      {/* What Are Cookies */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Cookie className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What Are Cookies?</h2>
        </div>
        <div className="space-y-4 text-gray-700">
          <p>
            Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
          </p>
          <p>
            Cookies typically contain:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>The name of the server the cookie came from</li>
            <li>An expiration date (some cookies only last for the duration of your browsing session)</li>
            <li>A value — usually a randomly generated unique number</li>
          </ul>
        </div>
      </div>

      {/* How We Use Cookies */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">How We Use Cookies</h2>
        </div>
        <p className="text-gray-700 mb-4">
          We use cookies for several reasons. Some cookies are required for technical reasons for our website to operate ("Essential Cookies"). Other cookies enable us to track and target the interests of our users to enhance your experience ("Functional and Performance Cookies").
        </p>
      </div>

      {/* Types of Cookies */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>

        <div className="space-y-6">
          {/* Essential Cookies */}
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Essential Cookies (Strictly Necessary)</h3>
                <p className="text-gray-700 mb-3">
                  These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions you take, such as setting your privacy preferences, logging in, or filling in forms.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Authentication cookies (to keep you logged in)</li>
                    <li>• Security cookies (to protect against fraud)</li>
                    <li>• Session cookies (to remember your cart items)</li>
                    <li>• Load balancing cookies (to distribute website traffic)</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3 italic">
                    You cannot opt out of these cookies as they are essential for the website to work.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Functional Cookies */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-start gap-3 mb-3">
              <Settings className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Functional Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Language preference cookies</li>
                    <li>• Display preference cookies (dark mode, layout choices)</li>
                    <li>• Location cookies (to show relevant events near you)</li>
                    <li>• Notification preferences</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3 italic">
                    If you block these cookies, some or all of these features may not function properly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Cookies */}
          <div className="border-l-4 border-purple-500 pl-4">
            <div className="flex items-start gap-3 mb-3">
              <Eye className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Performance and Analytics Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us understand which pages are the most and least popular and see how visitors move around the site.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Google Analytics cookies (traffic analysis)</li>
                    <li>• Page view tracking</li>
                    <li>• Site performance monitoring</li>
                    <li>• Error tracking and reporting</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    All information these cookies collect is aggregated and anonymous. If you block these cookies, we won't know when you've visited our site.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Advertising Cookies */}
          <div className="border-l-4 border-orange-500 pl-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Advertising and Targeting Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant advertisements on other sites.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Facebook Pixel (retargeting)</li>
                    <li>• Google Ads cookies</li>
                    <li>• Interest-based advertising</li>
                    <li>• Conversion tracking</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3 italic">
                    If you block these cookies, you will not experience less advertising, just less personalized advertising.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third-Party Cookies */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            In addition to our own cookies, we use various third-party cookies to provide services and analyze traffic. These include:
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Google Analytics</h3>
              <p className="text-sm mb-2">Used to collect information about how visitors use our site. We use this information to compile reports and improve the site.</p>
              <p className="text-xs text-gray-600">
                Learn more: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline">Google Privacy Policy</a>
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Processors (M-Pesa/Safaricom)</h3>
              <p className="text-sm mb-2">Cookies set by our payment partners to securely process transactions and prevent fraud.</p>
              <p className="text-xs text-gray-600">These cookies are essential for completing payments and cannot be disabled.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Social Media Plugins</h3>
              <p className="text-sm mb-2">If you share content via social media buttons, those networks may set cookies on your device.</p>
              <p className="text-xs text-gray-600">
                We do not control these cookies. Check the relevant social network's privacy policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Managing Cookies */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">How to Manage Cookies</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Browser Settings</h3>
            <p className="text-gray-700 mb-3">
              Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. Here's how to manage cookies in common browsers:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Google Chrome:</span> <span className="text-sm text-gray-600">Settings → Privacy and security → Cookies</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Firefox:</span> <span className="text-sm text-gray-600">Settings → Privacy & Security → Cookies and Site Data</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Safari:</span> <span className="text-sm text-gray-600">Preferences → Privacy → Manage Website Data</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Microsoft Edge:</span> <span className="text-sm text-gray-600">Settings → Cookies and site permissions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Please note:</span> If you choose to block or delete cookies, some features of our website may not function properly, and you may not be able to access certain parts of the site.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Mobile Devices</h3>
            <p className="text-gray-700 mb-2">
              For mobile browsers, cookie management is typically found in the browser's settings menu. Refer to your device's help documentation for specific instructions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Opting Out of Interest-Based Advertising</h3>
            <p className="text-gray-700 mb-2">
              You can opt out of interest-based advertising by visiting:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-gray-700">
              <li>Network Advertising Initiative (NAI): <a href="http://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline">optout.networkadvertising.org</a></li>
              <li>Digital Advertising Alliance (DAA): <a href="http://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline">optout.aboutads.info</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cookie Duration */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookie Duration</h2>
        <div className="space-y-4 text-gray-700">
          <p>Cookies can be "session" or "persistent" cookies:</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Session Cookies</h3>
              <p className="text-sm">Temporary cookies that expire when you close your browser. Used for essential functions like maintaining your login state during a browsing session.</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Persistent Cookies</h3>
              <p className="text-sm">Remain on your device for a set period or until you delete them. Used to remember your preferences and settings across multiple visits.</p>
            </div>
          </div>

          <p className="text-sm">
            Our cookies typically remain on your device for periods ranging from a few hours to two years, depending on their purpose.
          </p>
        </div>
      </div>

      {/* Updates to Policy */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Updates to This Cookie Policy</h2>
        <p className="text-gray-700 mb-4">
          We may update this Cookie Policy from time to time to reflect changes in technology, legislation, our operations, or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last updated" date at the top.
        </p>
        <p className="text-gray-700">
          We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
        </p>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Questions About Cookies?</h2>
        <p className="mb-4">
          If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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

      {/* Additional Resources */}
      <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Related Policies</h3>
            <p className="text-gray-700 text-sm mb-3">
              For more information about how we protect your data, please also review:
            </p>
            <div className="space-y-1 text-sm">
              <p>• <a href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">Privacy Policy</a> - How we collect and use your personal information</p>
              <p>• <a href="/terms" className="text-orange-600 hover:text-orange-700 font-medium">Terms of Service</a> - Terms governing your use of MGLTickets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieContent;