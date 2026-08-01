// src/shared/articles/help/security/privacy-settings-and-data-protection.tsx
import React from 'react';
import { Lock, Eye, Users, Info } from 'lucide-react';

const PrivacySettingsAndDataProtection: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Here's a straightforward look at what personal information MGLTickets holds, and how
        it's used.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">What We Collect</h2>
        </div>
        <ul className="space-y-2 mb-6 text-gray-700">
          <li>• Your name, email, and phone number, used to manage your account and deliver tickets</li>
          <li>• Order and payment records, needed for confirming purchases and handling refunds</li>
          <li>• Basic usage information, to help us keep the platform working reliably</li>
        </ul>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Who Can See What</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Event organizers can see the name and contact details of people who've booked their
          events, since this is needed to manage attendance and check-in. Organizers don't have
          access to your payment details or your activity on other organizers' events.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Payment Information</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Your M-Pesa PIN is never seen or stored by MGLTickets. We keep a record of the phone
          number and confirmation code for each transaction, used only to verify payments and
          resolve issues if they come up.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Want your data removed? See "Deactivating or Deleting Your Account" for what happens
            to your information when you close your account.
          </p>
        </div>
      </div>
    </article>
  );
};

export default PrivacySettingsAndDataProtection;