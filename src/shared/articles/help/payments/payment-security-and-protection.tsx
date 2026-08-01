// src/shared/articles/help/payments/payment-security-and-protection.tsx
import React from 'react';
import { ShieldCheck, Lock, Eye, AlertTriangle, Info } from 'lucide-react';

const PaymentSecurityAndProtection: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Handling payments safely is one of the most important things a ticketing platform does.
        Here's how MGLTickets protects your money and your information.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Your PIN Never Touches MGLTickets</h2>
        </div>
        <p className="text-gray-700 mb-4">
          When you pay with M-Pesa, your PIN is entered directly into the STK push prompt on
          your own phone through Safaricom's systems. MGLTickets never sees, stores, or has
          access to your M-Pesa PIN at any point in the process.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Payments Are Verified, Not Assumed</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Tickets are only issued once a payment is genuinely confirmed by Safaricom — either
          through an instant callback or, if that's delayed, through a follow-up check we run
          automatically. This means a payment can never be double-charged or issue duplicate
          tickets, even if you refresh the page or retry.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">What We Store</h2>
        </div>
        <p className="text-gray-700 mb-4">
          We keep a record of your transaction details — amount, phone number, and M-Pesa
          confirmation code — so we can match your payment to your order and help you if
          anything goes wrong. We don't store card numbers, since we don't process cards, and we
          never ask for your PIN outside of the official M-Pesa prompt on your own device.
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-medium m-0">If someone asks for your PIN, it's a scam</p>
            <p className="text-red-800 text-sm m-0 mt-1">
              MGLTickets staff, whether by phone, email, or chat, will never ask you to share
              your M-Pesa PIN or send payment outside of the official checkout flow. Only enter
              your PIN when prompted directly on your own phone by an STK push you initiated.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            If you ever suspect fraudulent activity on your account, contact support immediately
            with details of what happened.
          </p>
        </div>
      </div>
    </article>
  );
};

export default PaymentSecurityAndProtection;