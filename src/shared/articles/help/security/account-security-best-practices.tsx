// src/shared/articles/help/security/account-security-best-practices.tsx
import React from 'react';
import { ShieldCheck, Lock, Mail, Smartphone, Info } from 'lucide-react';

const AccountSecurityBestPractices: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        A few simple habits go a long way toward keeping your MGLTickets account — and your
        tickets — secure.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-5">
          <Lock className="w-6 h-6 text-orange-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Use a Strong, Unique Password</h3>
          <p className="text-sm text-gray-600 m-0">
            Avoid reusing a password from another site, and don't use anything easily guessed.
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-5">
          <Mail className="w-6 h-6 text-orange-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Keep Your Email Secure</h3>
          <p className="text-sm text-gray-600 m-0">
            Your email is used for password resets, so secure it as carefully as your MGLTickets
            account itself.
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-5">
          <ShieldCheck className="w-6 h-6 text-orange-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Never Share Your M-Pesa PIN</h3>
          <p className="text-sm text-gray-600 m-0">
            MGLTickets will never ask for it. Only enter it on the official STK push prompt on
            your own device.
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-5">
          <Smartphone className="w-6 h-6 text-orange-600 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Sign Out on Shared Devices</h3>
          <p className="text-sm text-gray-600 m-0">
            Always sign out of your account if you use a shared or public computer.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Only Use the Official Platform</h2>
        <p className="text-gray-700 mb-4">
          Only buy tickets, make payments, or enter account details through the official
          MGLTickets website or app. Be cautious of links claiming to be MGLTickets sent through
          unofficial channels.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Noticed something suspicious with your account? See "Reporting Suspicious Activity"
            for how to flag it to us right away.
          </p>
        </div>
      </div>
    </article>
  );
};

export default AccountSecurityBestPractices;