// src/shared/articles/help/account/resetting-forgotten-password.tsx
import React from 'react';
import { KeyRound, Mail, AlertCircle, Info } from 'lucide-react';

const ResettingForgottenPassword: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Locked out of your account? You can regain access in a couple of minutes using your
        email address — no need to remember your old password.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Reset Steps</h2>
        </div>
        <ol className="space-y-2 mb-6 text-gray-700">
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">1.</span>
            <span>On the sign-in page, click "Forgot Password?"</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">2.</span>
            <span>Enter the email address associated with your account</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">3.</span>
            <span>Check your inbox for a password reset link</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">4.</span>
            <span>Click the link and choose a new password</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">5.</span>
            <span>Sign in with your new password</span>
          </li>
        </ol>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-900 font-medium m-0">Didn't get the email?</p>
            <p className="text-yellow-800 text-sm m-0 mt-1">
              Check your spam or promotions folder. If it still hasn't arrived after a few
              minutes, double-check you entered the correct email address and try again.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">No Longer Have Access to Your Email?</h2>
        </div>
        <p className="text-gray-700 mb-4">
          If you can't access the email address on your account at all, contact support — we'll
          verify your identity and help you regain access another way.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            For your security, reset links expire after a short time. If yours has expired,
            simply request a new one.
          </p>
        </div>
      </div>
    </article>
  );
};

export default ResettingForgottenPassword;