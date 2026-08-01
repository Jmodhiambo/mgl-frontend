// src/shared/articles/help/account/changing-your-password.tsx
import React from 'react';
import { Lock, ShieldCheck, Info } from 'lucide-react';

const ChangingYourPassword: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        It's good practice to update your password periodically, especially if you use it
        anywhere else. Here's how to change it on MGLTickets.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Steps to Change Your Password</h2>
        </div>
        <ol className="space-y-2 mb-6 text-gray-700">
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">1.</span>
            <span>Go to Account Settings and open the "Password & Security" section</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">2.</span>
            <span>Enter your current password to confirm it's you</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">3.</span>
            <span>Enter and confirm your new password</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold min-w-[20px]">4.</span>
            <span>Save — you'll stay signed in on this device, but other sessions may be signed out for security</span>
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Choosing a Strong Password</h2>
        </div>
        <ul className="space-y-2 mb-6 text-gray-700">
          <li>• Use at least 8 characters, mixing letters, numbers, and symbols</li>
          <li>• Avoid reusing a password from another site</li>
          <li>• Avoid anything easily guessed, like your name or phone number</li>
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Forgotten your current password entirely? See "Resetting a Forgotten Password"
            instead — you won't need your old one for that process.
          </p>
        </div>
      </div>
    </article>
  );
};

export default ChangingYourPassword;