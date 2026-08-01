// src/shared/articles/help/security/two-factor-authentication.tsx
import React from 'react';
import { ShieldCheck, KeyRound, Info } from 'lucide-react';

const TwoFactorAuthentication: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Two-factor authentication (2FA) adds a second layer of protection to an account beyond
        just a password. Here's where things stand on MGLTickets today.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Not Yet Available</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Two-factor authentication isn't currently offered as an account setting on MGLTickets.
          This article will be updated as soon as it becomes available.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">In the Meantime</h2>
        </div>
        <p className="text-gray-700 mb-4">
          The strongest protection available today is a unique, strong password that you don't
          reuse elsewhere, combined with keeping your email account secure — since email is what
          password resets rely on. See "Account Security Best Practices" for a fuller checklist.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Every M-Pesa payment already requires your PIN, entered directly on your own phone —
            this acts as an extra layer of protection specifically around payments, even without
            account-level 2FA.
          </p>
        </div>
      </div>
    </article>
  );
};

export default TwoFactorAuthentication;