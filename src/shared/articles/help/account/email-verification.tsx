// src/shared/articles/help/account/email-verification.tsx
import React from 'react';
import { MailCheck, AlertCircle, Info } from 'lucide-react';

const EmailVerification: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Verifying your email confirms it's genuinely yours, so we can safely send your tickets,
        receipts, and account notifications there.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <MailCheck className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">When Verification Is Needed</h2>
        </div>
        <ul className="space-y-2 mb-6 text-gray-700">
          <li>• When you first create your account</li>
          <li>• Any time you change your email address in account settings</li>
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Verify</h2>
        <p className="text-gray-700 mb-4">
          After signing up or changing your email, we'll send a verification link to that
          address. Open the email and click the link to confirm it. That's it — your account is
          instantly marked as verified.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-900 font-medium m-0">Link not arriving?</p>
            <p className="text-yellow-800 text-sm m-0 mt-1">
              Check your spam or promotions folder first. If it's still missing, go to account
              settings and click "Resend Verification Email" to get a new link.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            An unverified email can still receive your tickets, but verifying it helps protect
            your account and ensures you don't miss important updates about your orders.
          </p>
        </div>
      </div>
    </article>
  );
};

export default EmailVerification;