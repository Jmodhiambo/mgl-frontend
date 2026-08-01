// src/shared/articles/help/account/updating-your-profile.tsx
import React from 'react';
import { User, Mail, Phone, Info } from 'lucide-react';

const UpdatingYourProfile: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Keeping your profile up to date makes sure your tickets, receipts, and account
        notifications always reach the right place.
      </p>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What You Can Update</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <User className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Name</h3>
            <p className="text-sm text-gray-600">Updates instantly, applies to future tickets</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <Mail className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
            <p className="text-sm text-gray-600">Requires re-verification before it takes effect</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <Phone className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Phone Number</h3>
            <p className="text-sm text-gray-600">Used for SMS alerts and, separately, M-Pesa payments</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Update</h2>
        <p className="text-gray-700 mb-4">
          Go to your account settings, click "Edit Profile," make your changes, and save. Most
          updates apply immediately across the platform.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Changing your email won't affect tickets already issued — they stay tied to your
            account either way. Once you verify the new email, all future communication goes
            there.
          </p>
        </div>
      </div>
    </article>
  );
};

export default UpdatingYourProfile;