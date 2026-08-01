// src/shared/articles/help/account/managing-notification-preferences.tsx
import React from 'react';
import { Bell, Mail, MessageSquare, Info } from 'lucide-react';

const ManagingNotificationPreferences: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Control which emails and SMS messages you receive from MGLTickets, without missing
        anything important about your own orders.
      </p>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Notifications</h2>
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-4">
            <Mail className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Transactional Emails</h3>
              <p className="text-sm text-gray-600 m-0">
                Order confirmations, tickets, and payment status updates. These are essential to
                using the platform and can't be turned off.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-4">
            <MessageSquare className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">SMS Alerts</h3>
              <p className="text-sm text-gray-600 m-0">
                Booking confirmations and event reminders sent to your phone. Reminders can be
                toggled off individually.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 border border-gray-200 rounded-lg p-4">
            <Bell className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Marketing Updates</h3>
              <p className="text-sm text-gray-600 m-0">
                New event recommendations and promotions. Fully optional and can be turned off
                at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Adjust Your Preferences</h2>
        <p className="text-gray-700 mb-4">
          Go to Account Settings, open "Notification Preferences," and toggle each category on
          or off. Changes take effect immediately.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Confirmations about your own purchases will always reach you, even with marketing
            notifications turned off, so you'll never miss your tickets.
          </p>
        </div>
      </div>
    </article>
  );
};

export default ManagingNotificationPreferences;