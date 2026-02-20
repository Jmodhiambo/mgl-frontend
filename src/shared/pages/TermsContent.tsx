import React from 'react';
import { FileText, AlertCircle, CheckCircle, XCircle, Scale, ShieldAlert } from 'lucide-react';

/**
 * TermsContent
 *
 * Pure content component — no SEO tags, no page-level layout, no background,
 * no padding offsets. Safe to render inside a modal or a full page.
 *
 * Used by:
 *   - TermsOfService.tsx  (full page wrapper)
 *   - Checkout.tsx        (modal)
 *
 * When you update legal copy, edit ONLY this file.
 */
const TermsContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Introduction */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <p className="text-gray-700 leading-relaxed mb-4">
          Welcome to MGLTickets. These Terms of Service govern your use of our event ticketing platform and services. By accessing or using MGLTickets, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
        </p>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Important:</span> Please read these Terms carefully before using our platform. These Terms contain important information about your legal rights, remedies, and obligations.
          </p>
        </div>
      </div>

      {/* Acceptance of Terms */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
        </div>
        <p className="text-gray-700 mb-4">
          By creating an account, purchasing tickets, or using any part of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you are using our services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
        </p>
        <p className="text-gray-700">
          We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through a notice on our platform. Your continued use of MGLTickets after such modifications constitutes your acceptance of the updated Terms.
        </p>
      </div>

      {/* Eligibility */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Eligibility</h2>
        <p className="text-gray-700 mb-4">To use MGLTickets, you must:</p>
        <ul className="space-y-2 text-gray-700 ml-4">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Be at least 18 years old or have parental/guardian consent</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Provide accurate and complete registration information</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Have the legal capacity to enter into a binding contract</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Comply with all applicable laws and regulations</span>
          </li>
        </ul>
      </div>

      {/* Account Registration */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Registration and Security</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Account Creation</h3>
            <p>When you create an account with MGLTickets, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Account Responsibilities</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You must not share your account credentials with others</li>
              <li>You must notify us immediately of any unauthorized access to your account</li>
              <li>You are responsible for all activities conducted through your account</li>
              <li>You must keep your contact information up to date</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Account Termination</h3>
            <p>We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent or illegal activities. You may also close your account at any time by contacting our support team.</p>
          </div>
        </div>
      </div>

      {/* Ticket Purchases */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ticket Purchases and Bookings</h2>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Purchase Process</h3>
            <p>When you purchase tickets through MGLTickets, you enter into a contract directly with the event organizer. MGLTickets acts as an intermediary to facilitate the transaction. All ticket sales are subject to availability and the specific terms set by the event organizer.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>All payments are processed securely through M-Pesa</li>
              <li>Prices are displayed in Kenyan Shillings (KES)</li>
              <li>You agree to pay all applicable fees and charges</li>
              <li>Payment must be received before tickets are issued</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Ticket Delivery</h3>
            <p>Upon successful payment, you will receive your tickets via email and through your MGLTickets account. It is your responsibility to ensure that your contact information is accurate and that you can receive our communications.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Ticket Validity</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Tickets are valid only for the specified event, date, and time</li>
              <li>Each ticket has a unique QR code for verification</li>
              <li>Screenshots or photocopies of tickets may not be accepted</li>
              <li>Lost or stolen tickets cannot be replaced or refunded</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prohibited Activities */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Prohibited Activities</h2>
        </div>
        <p className="text-gray-700 mb-4">You agree not to engage in any of the following prohibited activities:</p>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><span>Reselling tickets without authorization from the event organizer</span></div>
          <div className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><span>Using automated systems (bots) to purchase tickets</span></div>
          <div className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><span>Creating multiple accounts to circumvent ticket limits</span></div>
          <div className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><span>Sharing, copying, or distributing ticket codes without permission</span></div>
          <div className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><span>Attempting to gain unauthorized access to our systems or data</span></div>
          <div className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><span>Engaging in fraudulent activities or payment disputes without valid reason</span></div>
          <div className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><span>Violating any applicable laws or regulations</span></div>
          <div className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><span>Harassing, threatening, or abusing other users or our staff</span></div>
        </div>
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-red-700">Warning:</span> Violation of these prohibitions may result in immediate account termination, ticket cancellation without refund, and potential legal action.
          </p>
        </div>
      </div>

      {/* Event Organizer Terms */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Organizer Terms</h2>
        <p className="text-gray-700 mb-4">If you are using MGLTickets as an event organizer, additional terms apply:</p>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Event Creation</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You must provide accurate and complete event information</li>
              <li>You are responsible for all content associated with your event</li>
              <li>Events must comply with all applicable laws and regulations</li>
              <li>MGLTickets reserves the right to reject or remove events that violate our policies</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Fees and Payments</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>MGLTickets charges a service fee for each ticket sold</li>
              <li>Payments are processed according to our payment schedule</li>
              <li>You are responsible for all taxes related to your event revenue</li>
              <li>Refunds and cancellations are subject to your refund policy and our terms</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Organizer Responsibilities</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You must honor all ticket sales and bookings</li>
              <li>You are responsible for managing event logistics and attendee experience</li>
              <li>You must comply with venue requirements and local regulations</li>
              <li>You agree to indemnify MGLTickets from claims arising from your event</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cancellations and Refunds */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cancellations and Refunds</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Event Cancellations</h3>
            <p>If an event is canceled by the organizer, ticket holders are entitled to a full refund. Refunds will be processed according to our Refund Policy and the event organizer's specific terms.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Customer-Initiated Cancellations</h3>
            <p>Refunds for customer-initiated cancellations are subject to the event organizer's refund policy and our general Refund Policy. Please review both policies before purchasing tickets.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Postponements and Changes</h3>
            <p>If an event is postponed or significantly changed, tickets typically remain valid for the rescheduled event. Refund eligibility in such cases depends on the specific circumstances and the organizer's policy.</p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            For detailed information about refunds, please see our <a href="/refund" className="text-orange-600 font-medium hover:text-orange-700">Refund Policy</a>.
          </p>
        </div>
      </div>

      {/* Intellectual Property */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Intellectual Property</h2>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Our Content</h3>
            <p>All content on MGLTickets, including text, graphics, logos, images, software, and design elements, is owned by or licensed to MGLTickets and is protected by copyright, trademark, and other intellectual property laws. You may not use, copy, reproduce, or distribute any content without our express written permission.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">User Content</h3>
            <p>Event organizers retain ownership of the content they upload to our platform. By uploading content, you grant MGLTickets a worldwide, non-exclusive, royalty-free license to use, display, and distribute that content in connection with operating and promoting our services.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Trademarks</h3>
            <p>MGLTickets and our logo are trademarks of MGLTickets. You may not use our trademarks without our prior written consent.</p>
          </div>
        </div>
      </div>

      {/* Limitation of Liability */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
        </div>
        <div className="space-y-4 text-gray-700">
          <p>To the maximum extent permitted by law, MGLTickets and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your use or inability to use our services</li>
            <li>Any unauthorized access to or use of our servers and/or personal information stored therein</li>
            <li>Any interruption or cessation of transmission to or from our services</li>
            <li>Any bugs, viruses, or the like that may be transmitted through our services by any third party</li>
            <li>Any errors or omissions in any content or for any loss or damage incurred as a result of your use of any content</li>
            <li>The conduct or content of any third party, including event organizers, on the services</li>
          </ul>
          <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
            <p className="text-sm">
              <span className="font-semibold">Important:</span> MGLTickets is a platform that connects ticket buyers with event organizers. We are not responsible for the quality, safety, or legality of events listed on our platform, nor are we responsible for the ability of organizers to honor their obligations to ticket holders.
            </p>
          </div>
        </div>
      </div>

      {/* Indemnification */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Indemnification</h2>
        <p className="text-gray-700">
          You agree to defend, indemnify, and hold harmless MGLTickets and its affiliates, officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from: (i) your use of and access to the services; (ii) your violation of any term of these Terms; (iii) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (iv) any claim that your content caused damage to a third party.
        </p>
      </div>

      {/* Dispute Resolution */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dispute Resolution</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Governing Law</h3>
            <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya, without regard to its conflict of law provisions.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Arbitration</h3>
            <p>Any dispute arising out of or relating to these Terms or the use of MGLTickets shall be resolved through binding arbitration in accordance with the Arbitration Act of Kenya, rather than in court, except that you may assert claims in small claims court if your claims qualify.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Informal Resolution</h3>
            <p>Before initiating arbitration, we encourage you to contact us at support@mgltickets.com to seek an informal resolution of any dispute.</p>
          </div>
        </div>
      </div>

      {/* Miscellaneous */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Miscellaneous</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Entire Agreement</h3>
            <p>These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and MGLTickets regarding the use of our services.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Severability</h3>
            <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Waiver</h3>
            <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Assignment</h3>
            <p>You may not assign or transfer these Terms, by operation of law or otherwise, without our prior written consent. We may assign these Terms without your consent.</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <p className="mb-4">If you have any questions about these Terms of Service, please contact us:</p>
        <div className="space-y-2">
          <p><span className="font-semibold">Email:</span> <a href="mailto:legal@mgltickets.com" className="underline hover:text-orange-100">legal@mgltickets.com</a></p>
          <p><span className="font-semibold">Phone:</span> +254 700 000 000</p>
          <p><span className="font-semibold">Address:</span> MGLTickets, Nairobi, Kenya</p>
        </div>
      </div>

      {/* Acknowledgment */}
      <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Acknowledgment</h3>
            <p className="text-gray-700 text-sm">
              By using MGLTickets, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, you must discontinue use of our services immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsContent;