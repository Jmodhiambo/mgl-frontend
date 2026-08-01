// src/shared/articles/help/account/deactivating-your-account.tsx
import React from 'react';
import { UserX, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const DeactivatingYourAccount: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        If you no longer want to use MGLTickets, you can close your account. Here's what that
        involves and what happens to your data.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <UserX className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">How to Close Your Account</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Go to Account Settings and select "Deactivate or Delete Account" at the bottom of the
          page. You'll be asked to confirm your decision, since this action can't be undone
          casually.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What Happens Next</h2>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>You'll immediately lose access to sign in</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Records of past orders and financial transactions are retained, since they're required for accounting and dispute resolution</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Your profile information is removed from anywhere it's publicly visible</span>
          </li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-900 font-medium m-0">Before you close your account</p>
            <p className="text-yellow-800 text-sm m-0 mt-1">
              Make sure you don't have tickets for an upcoming event, since you'll lose easy
              access to "My Tickets." Download or screenshot any tickets you'll still need first.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Changed your mind, or closed your account by mistake? Contact support as soon as
            possible — we may be able to help, depending on how long it's been.
          </p>
        </div>
      </div>
    </article>
  );
};

export default DeactivatingYourAccount;