// src/shared/articles/help/security/reporting-suspicious-activity.tsx
import React from 'react';
import { Flag, Mail, AlertTriangle, Info } from 'lucide-react';

const ReportingSuspiciousActivity: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        If something feels off — an unfamiliar login, a suspicious message, or a ticket seller
        that doesn't seem legitimate — reporting it helps protect both you and the wider
        MGLTickets community.
      </p>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Report</h2>
        <ul className="space-y-2 mb-6 text-gray-700">
          <li>• Unrecognized activity or orders on your account</li>
          <li>• Messages or calls claiming to be MGLTickets asking for your PIN or payment outside the platform</li>
          <li>• Suspected fake or duplicated tickets being resold</li>
          <li>• An event listing that looks fraudulent or misleading</li>
        </ul>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Flag className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">How to Report</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Contact support with as much detail as you can — what happened, when, and any relevant
          screenshots, order numbers, or messages. The more context you provide, the faster we
          can investigate.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-8">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-900 font-medium m-0">If you think your account is compromised</p>
            <p className="text-yellow-800 text-sm m-0 mt-1">
              Change your password immediately using "Changing Your Password," then contact
              support so we can help secure your account further.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <Mail className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            You'll receive a response confirming we've received your report, along with any
            follow-up needed on your end.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            Reporting something doesn't guarantee a specific outcome, but it always helps us
            catch patterns of abuse and protect other users.
          </p>
        </div>
      </div>
    </article>
  );
};

export default ReportingSuspiciousActivity;