import React from 'react';
import { DollarSign, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Mail } from 'lucide-react';
import { RefundSEO } from '@shared/components/SEO';

const RefundPolicy: React.FC = () => {
  document.title = 'Refund Policy - MGLTickets';

  return (
    <>
      <RefundSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              At MGLTickets, we strive to provide a seamless ticketing experience for all users. This Refund Policy outlines the circumstances under which refunds are provided for ticket purchases made through our platform. Please read this policy carefully before purchasing tickets.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Important:</span> Refund eligibility depends on both MGLTickets' general policy and the specific refund policy set by each event organizer. Always review the event-specific refund terms before purchasing tickets.
              </p>
            </div>
          </div>

          {/* General Refund Policy */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">General Refund Policy</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Standard Refund Window</h3>
                <p className="text-gray-700 mb-3">
                  Unless otherwise specified by the event organizer, the following standard refund windows apply:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Full Refund</p>
                      <p className="text-sm text-gray-700">Available if cancellation is made more than 7 days before the event</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">50% Refund</p>
                      <p className="text-sm text-gray-700">Available if cancellation is made 3-7 days before the event</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">No Refund</p>
                      <p className="text-sm text-gray-700">No refunds available for cancellations made less than 3 days before the event</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Fees</h3>
                <p className="text-gray-700">
                  MGLTickets service fees are non-refundable except in cases where the event is canceled by the organizer. If you request a refund for reasons other than event cancellation, the service fee will be deducted from your refund amount.
                </p>
              </div>
            </div>
          </div>

          {/* Event Cancellation */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Event Cancellations by Organizer</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                If an event is canceled by the organizer, you are entitled to a full refund, including all service fees. The refund process works as follows:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-orange-600">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Notification</p>
                    <p className="text-sm">You will be notified via email and through your MGLTickets account about the cancellation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-orange-600">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Automatic Processing</p>
                    <p className="text-sm">Refunds are processed automatically to your original payment method</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-orange-600">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Timeline</p>
                    <p className="text-sm">Refunds typically appear in your M-Pesa account within 5-7 business days</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Note:</span> If you do not receive your refund within 7 business days of the cancellation notification, please contact our support team at <a href="mailto:support@mgltickets.com" className="text-orange-600 font-medium hover:text-orange-700">support@mgltickets.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Event Postponement */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Event Postponement or Rescheduling</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                If an event is postponed or rescheduled to a different date, time, or venue:
              </p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ticket Validity</h3>
                <p className="mb-2">Your tickets remain valid for the rescheduled event. You do not need to exchange or reprint your tickets.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Refund Eligibility</h3>
                <p className="mb-2">You may be eligible for a refund if:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>The new date conflicts with your schedule and you can provide reasonable justification</li>
                  <li>The venue change significantly affects your ability to attend</li>
                  <li>The event organizer offers a refund option for the rescheduled event</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Requesting a Refund</h3>
                <p>To request a refund for a postponed event, contact our support team within 14 days of the postponement announcement with your reason for requesting a refund. Each request will be reviewed on a case-by-case basis.</p>
              </div>
            </div>
          </div>

          {/* How to Request a Refund */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">How to Request a Refund</h2>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700">
                To request a refund for your ticket purchase, follow these steps:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Log In to Your Account</h3>
                    <p className="text-gray-700 text-sm">Access your MGLTickets account and navigate to "My Bookings"</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Select Your Booking</h3>
                    <p className="text-gray-700 text-sm">Find the booking you wish to cancel and click on "Request Refund"</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Provide Reason</h3>
                    <p className="text-gray-700 text-sm">Complete the refund request form, including your reason for cancellation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Review and Submit</h3>
                    <p className="text-gray-700 text-sm">Review the refund amount (based on timing and policies) and submit your request</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">5</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Await Confirmation</h3>
                    <p className="text-gray-700 text-sm">You'll receive an email confirmation once your refund is processed</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Alternative:</span> If you're unable to request a refund through your account, email us at <a href="mailto:refunds@mgltickets.com" className="text-orange-600 font-medium hover:text-orange-700">refunds@mgltickets.com</a> with your booking reference number, event details, and reason for the refund request.
                </p>
              </div>
            </div>
          </div>

          {/* Processing Times */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Refund Processing Times</h2>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Review Period</h3>
                  <p className="text-sm text-gray-700 mb-2">1-2 business days</p>
                  <p className="text-xs text-gray-600">Time for MGLTickets to review and approve your refund request</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Processing Time</h3>
                  <p className="text-sm text-gray-700 mb-2">3-5 business days</p>
                  <p className="text-xs text-gray-600">Time for the refund to be initiated to your M-Pesa account</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Total Processing Time</h3>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-bold text-orange-600">4-7 business days</span> from the date of refund request approval
                </p>
                <p className="text-xs text-gray-600">This timeline may vary during peak periods or due to payment processor delays</p>
              </div>
            </div>
          </div>

          {/* Non-Refundable Situations */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Non-Refundable Situations</h2>
            </div>

            <p className="text-gray-700 mb-4">Refunds will not be provided in the following situations:</p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Late Cancellations</p>
                  <p className="text-xs text-gray-700">Cancellations made less than 3 days before the event (unless otherwise specified)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">No-Shows</p>
                  <p className="text-xs text-gray-700">Failure to attend an event without prior cancellation</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Used Tickets</p>
                  <p className="text-xs text-gray-700">Tickets that have already been scanned or used for entry</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Non-Refundable Events</p>
                  <p className="text-xs text-gray-700">Events explicitly marked as "non-refundable" by the organizer</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Change of Mind</p>
                  <p className="text-xs text-gray-700">Simple change of plans or personal circumstances (outside the standard refund window)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Policy Violations</p>
                  <p className="text-xs text-gray-700">Account suspension or ticket cancellation due to Terms of Service violations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Circumstances */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Special Circumstances</h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Medical Emergencies</h3>
                <p className="mb-2">
                  If you're unable to attend an event due to a medical emergency, we may consider refund requests on a case-by-case basis. You will need to provide:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Medical documentation or doctor's note</li>
                  <li>Your booking reference number</li>
                  <li>Details of the circumstance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Force Majeure</h3>
                <p>
                  In cases of natural disasters, government restrictions, or other force majeure events that prevent you from attending, we will work with event organizers to determine appropriate refund or rescheduling options.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Fraudulent Purchases</h3>
                <p>
                  If you believe your account was compromised and tickets were purchased fraudulently, contact us immediately at <a href="mailto:security@mgltickets.com" className="text-orange-600 font-medium hover:text-orange-700">security@mgltickets.com</a>. We will investigate and process refunds for verified fraudulent transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Organizer-Specific Policies */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizer-Specific Refund Policies</h2>
            
            <p className="text-gray-700 mb-4">
              Event organizers may set their own refund policies that differ from our standard policy. These policies will be clearly displayed on the event page before you complete your purchase. Common variations include:
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">More Generous Policies</h3>
                <p className="text-xs text-gray-700">Some organizers may offer full refunds up to 24 hours before the event or provide flexible rescheduling options</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Stricter Policies</h3>
                <p className="text-xs text-gray-700">Some events may be marked as "non-refundable" due to limited capacity, exclusive nature, or specific event requirements</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Partial Refund Options</h3>
                <p className="text-xs text-gray-700">Some organizers may offer credits or vouchers instead of cash refunds</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Always Review:</span> The organizer-specific refund policy is binding and takes precedence over our standard policy. Make sure you understand and accept these terms before purchasing tickets.
              </p>
            </div>
          </div>

          {/* Disputes */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Disputes and Appeals</h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                If your refund request is denied and you believe this decision was made in error, you may appeal the decision by:
              </p>

              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Emailing <a href="mailto:disputes@mgltickets.com" className="text-orange-600 font-medium hover:text-orange-700">disputes@mgltickets.com</a> with your booking reference number</li>
                <li>Providing a detailed explanation of why you believe you should receive a refund</li>
                <li>Including any supporting documentation</li>
              </ol>

              <p>
                Our customer service team will review your appeal within 3-5 business days and respond with a final decision. All decisions made after an appeal are final and binding.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Need Help with a Refund?</h2>
            <p className="mb-4">
              If you have questions about our refund policy or need assistance with a refund request, our support team is here to help:
            </p>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">General Refunds:</span> <a href="mailto:refunds@mgltickets.com" className="underline hover:text-orange-100">refunds@mgltickets.com</a>
              </p>
              <p>
                <span className="font-semibold">Disputes:</span> <a href="mailto:disputes@mgltickets.com" className="underline hover:text-orange-100">disputes@mgltickets.com</a>
              </p>
              <p>
                <span className="font-semibold">Phone Support:</span> +254 700 000 000 (Mon-Fri, 9AM-5PM EAT)
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;