// src/shared/articles/help/getting-started/account-settings-overview.tsx
import React from 'react';
import { User, Bell, Lock, Smartphone, Info } from 'lucide-react';

const AccountSettingsOverview: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Your account settings page is where you manage everything about your MGLTickets
        profile. Here's a quick tour of what you'll find there.
      </p>

      <div className="space-y-6 mb-8">
        <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-5">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Profile Information</h3>
            <p className="text-sm text-gray-600 m-0">
              Update your name, email address, and phone number. Changing your email or phone
              requires re-verification for security.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-5">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Password & Security</h3>
            <p className="text-sm text-gray-600 m-0">
              Change your password at any time. We recommend using a unique password you don't
              reuse on other sites.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-5">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Notification Preferences</h3>
            <p className="text-sm text-gray-600 m-0">
              Choose which emails and SMS alerts you receive — booking confirmations are always
              on, but marketing updates and event reminders can be turned off individually.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-5">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Payment Details</h3>
            <p className="text-sm text-gray-600 m-0">
              Your M-Pesa phone number used for payments. You can update this at any time, and
              it can be different from the phone number on your account profile.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium m-0">Where to find it</p>
            <p className="text-blue-800 text-sm m-0 mt-1">
              Click your profile icon in the top right corner of any page, then select
              "Account Settings" from the dropdown menu.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default AccountSettingsOverview;