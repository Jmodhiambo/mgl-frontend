// src/shared/articles/help/getting-started/creating-your-account.tsx
import React from 'react';
import { CheckCircle, Info, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const CreatingYourAccount: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Creating an MGLTickets account takes less than a minute and unlocks faster checkout,
        a record of every ticket you've bought, and personalized event recommendations.
        Here's how to get set up.
      </p>

      {/* Step 1 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Start the Sign-Up Process</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Click "Sign Up" in the top navigation bar from any page on MGLTickets. You can also
          be prompted to create an account automatically when you try to purchase tickets
          without being signed in.
        </p>
      </div>

      {/* Step 2 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Enter Your Details</h2>
        </div>
        <p className="text-gray-700 mb-4">You'll need to provide a few basic details:</p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <UserIcon className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Full Name</h3>
            <p className="text-sm text-gray-600">Used on your tickets and receipts</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <Mail className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Email Address</h3>
            <p className="text-sm text-gray-600">Where your tickets and receipts are sent</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <Lock className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Password</h3>
            <p className="text-sm text-gray-600">A minimum of 8 characters, ideally mixed with numbers</p>
          </div>
        </div>

        <p className="text-gray-700 mb-4">
          A valid Kenyan phone number is also required. This is the number used for M-Pesa
          payments and for SMS booking confirmations, so make sure it's one you have access to.
        </p>
      </div>

      {/* Step 3 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Verify Your Email</h2>
        </div>
        <p className="text-gray-700 mb-4">
          After signing up, we'll send a verification link to the email address you provided.
          Click the link to confirm your account is genuinely yours.
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800 text-sm m-0">
              Can't find the email? Check your spam or promotions folder. If it still hasn't
              arrived after a few minutes, you can request a new verification link from your
              account settings.
            </p>
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            4
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">You're Ready to Go</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Once verified, you're free to browse events, buy tickets, and manage everything
          from your account dashboard.
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Save events you're interested in</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>View every ticket you've ever purchased under "My Tickets"</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Check out faster next time, since your details are already saved</span>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium m-0">Planning to host events instead?</p>
            <p className="text-blue-800 text-sm m-0 mt-1">
              You can create the same MGLTickets account and apply for organizer access from
              your dashboard — no need to sign up separately.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CreatingYourAccount;