import React from 'react';
import { ArrowLeft, Smartphone, AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react';

const HowToPayWithMpesa: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a 
          href="/help" 
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </a>

        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>📖 5 min read</span>
            <span>•</span>
            <span>Updated Jan 6, 2025</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How to Pay with M-Pesa
          </h1>
          <p className="text-xl text-gray-600">
            Complete guide to making secure payments using M-Pesa on MGLTickets
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <article className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-8">
              <div className="flex gap-4">
                <Smartphone className="w-8 h-8 text-green-700 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-green-900 m-0 mb-2">
                    M-Pesa: Kenya's Leading Mobile Payment Solution
                  </h3>
                  <p className="text-green-800 m-0">
                    M-Pesa is the most convenient and secure way to purchase tickets on MGLTickets. 
                    With instant confirmation and no need for credit cards, it's the preferred 
                    payment method for thousands of our customers.
                  </p>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Before You Start</h2>
            <p className="text-gray-700 mb-4">Make sure you have the following:</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 m-0">Active M-Pesa Account</h3>
                </div>
                <p className="text-sm text-gray-600 m-0">
                  Your Safaricom line must be registered for M-Pesa services
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 m-0">Sufficient Balance</h3>
                </div>
                <p className="text-sm text-gray-600 m-0">
                  Ensure you have enough funds to cover the ticket cost plus M-Pesa transaction fees
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 m-0">Phone Nearby</h3>
                </div>
                <p className="text-sm text-gray-600 m-0">
                  Keep your phone ready to receive and respond to the STK push prompt
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 m-0">Know Your PIN</h3>
                </div>
                <p className="text-sm text-gray-600 m-0">
                  Have your M-Pesa PIN ready (never share this with anyone)
                </p>
              </div>
            </div>

            {/* Step-by-Step Guide */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step-by-Step Payment Process</h2>

            {/* Step 1 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 m-0">Select M-Pesa as Payment Method</h3>
              </div>
              <p className="text-gray-700 ml-13">
                After selecting your tickets and proceeding to checkout, choose "M-Pesa" 
                as your payment method from the available options.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 m-0">Enter Your Phone Number</h3>
              </div>
              <p className="text-gray-700 ml-13 mb-4">
                Enter your M-Pesa registered phone number in the format: 
                <code className="bg-gray-100 px-2 py-1 rounded text-sm mx-2">07XXXXXXXX</code> or 
                <code className="bg-gray-100 px-2 py-1 rounded text-sm mx-2">254XXXXXXXXX</code>
              </p>
              <div className="ml-13 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-sm m-0">
                    <strong>Important:</strong> Use the exact phone number registered with your M-Pesa account. 
                    Using a different number will cause the payment to fail.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 m-0">Click "Pay Now"</h3>
              </div>
              <p className="text-gray-700 ml-13">
                Review your order summary one final time, then click the "Pay Now" or 
                "Complete Payment" button to initiate the M-Pesa transaction.
              </p>
            </div>

            {/* Step 4 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 m-0">Receive STK Push Notification</h3>
              </div>
              <p className="text-gray-700 ml-13 mb-4">
                Within a few seconds, you'll receive an M-Pesa STK push notification on your phone. 
                The notification will show:
              </p>
              <ul className="ml-13 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>The merchant name (MGLTickets or Paybill number)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>The exact amount to be paid</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>A reference number for the transaction</span>
                </li>
              </ul>
            </div>

            {/* Step 5 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <h3 className="text-xl font-bold text-gray-900 m-0">Enter Your M-Pesa PIN</h3>
              </div>
              <p className="text-gray-700 ml-13 mb-4">
                Open the M-Pesa prompt on your phone and carefully enter your 4-digit M-Pesa PIN 
                to authorize the payment.
              </p>
              <div className="ml-13 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-900 font-medium m-0">Security Notice</p>
                    <p className="text-red-800 text-sm m-0 mt-1">
                      Never share your M-Pesa PIN with anyone, including MGLTickets staff. 
                      We will never call or message you asking for your PIN.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <h3 className="text-xl font-bold text-gray-900 m-0">Wait for Confirmation</h3>
              </div>
              <p className="text-gray-700 ml-13 mb-4">
                After entering your PIN, please wait for confirmation. This usually takes 10-30 seconds. You'll receive:
              </p>
              <ul className="ml-13 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>M-Pesa SMS:</strong> Confirmation message from M-Pesa with transaction details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Screen Confirmation:</strong> Success message on the MGLTickets website</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Email Receipt:</strong> Detailed receipt and tickets sent to your email</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>SMS Notification:</strong> Booking confirmation with ticket details</span>
                </li>
              </ul>
            </div>

            {/* Transaction Fees */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900 m-0 mb-2">M-Pesa Transaction Fees</h3>
                  <p className="text-blue-800 text-sm m-0 mb-3">
                    M-Pesa charges a small transaction fee based on the amount being transferred. 
                    This fee is separate from the ticket price and is charged by Safaricom, not MGLTickets.
                  </p>
                  <p className="text-blue-800 text-sm m-0">
                    <strong>Example:</strong> For a KES 1,000 ticket purchase, you might pay approximately 
                    KES 15-28 in M-Pesa fees, depending on your transaction tier.
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting Common Issues</h2>
            
            <div className="space-y-6 mb-8">
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">❌ "No STK push received"</h3>
                <p className="text-gray-700 text-sm mb-2">
                  If you don't receive the STK push within 30 seconds:
                </p>
                <ul className="text-gray-700 text-sm space-y-1 ml-4">
                  <li>• Check if your phone has network coverage</li>
                  <li>• Verify you entered the correct phone number</li>
                  <li>• Try restarting your phone</li>
                  <li>• Dial *234# to check if your SIM card is registered</li>
                  <li>• Contact Safaricom if the issue persists</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">❌ "Insufficient balance"</h3>
                <p className="text-gray-700 text-sm">
                  Ensure you have enough balance to cover both the ticket price and M-Pesa transaction fees. 
                  You can check your M-Pesa balance by dialing *234# or via the M-Pesa app.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">❌ "Wrong PIN entered"</h3>
                <p className="text-gray-700 text-sm mb-2">
                  If you enter the wrong PIN:
                </p>
                <ul className="text-gray-700 text-sm space-y-1 ml-4">
                  <li>• You'll have 2 more attempts before your account is locked</li>
                  <li>• If locked, visit any Safaricom shop with your ID to unlock</li>
                  <li>• You can reset your PIN by dialing *234*6# (requires ID number)</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">❌ "Payment timeout"</h3>
                <p className="text-gray-700 text-sm">
                  The STK push expires after 60 seconds. If you miss it, simply go back 
                  and initiate the payment again. Your order will be held for 10 minutes.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">❌ "Money deducted but no tickets received"</h3>
                <p className="text-gray-700 text-sm">
                  This rarely happens, but if it does:
                </p>
                <ul className="text-gray-700 text-sm space-y-1 ml-4">
                  <li>• Wait 5 minutes and check your email/account again</li>
                  <li>• Check your spam/junk folder</li>
                  <li>• Contact our support with your M-Pesa transaction code</li>
                  <li>• We'll verify the payment and issue your tickets within 1 hour</li>
                </ul>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-8 h-8 text-red-700 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-red-900 m-0 mb-3">M-Pesa Security Tips</h3>
                  <ul className="space-y-2 text-red-900 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold min-w-[20px]">1.</span>
                      <span>Never share your M-Pesa PIN with anyone for any reason</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold min-w-[20px]">2.</span>
                      <span>Always verify the merchant name and amount before entering your PIN</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold min-w-[20px]">3.</span>
                      <span>Only make payments through official MGLTickets website or app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold min-w-[20px]">4.</span>
                      <span>Be wary of calls/messages claiming to be from MGLTickets asking for payments outside the platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold min-w-[20px]">5.</span>
                      <span>Save all M-Pesa transaction messages until you receive your tickets</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white mb-6">
          <h3 className="text-2xl font-bold mb-3">Need Help with M-Pesa Payment?</h3>
          <p className="text-lg mb-6 opacity-90">
            Our support team is ready to assist you with any payment-related questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/contact"
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-center"
            >
              Contact Support
            </a>
            <a
              href="tel:254700000000"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors text-center"
            >
              Call Us
            </a>
          </div>
        </div>

        {/* Related Articles */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/help/articles/how-to-purchase-tickets"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all"
            >
              <h4 className="font-semibold text-gray-900 mb-1">How to Purchase Tickets</h4>
              <p className="text-sm text-gray-600">Complete ticket buying guide</p>
            </a>
            <a
              href="/help/articles/troubleshooting-failed-payments"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Troubleshooting Failed Payments</h4>
              <p className="text-sm text-gray-600">Fix common payment issues</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPayWithMpesa;