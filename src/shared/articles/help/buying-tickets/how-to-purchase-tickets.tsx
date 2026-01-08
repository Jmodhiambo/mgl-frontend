// src/shared/articles/help/buying-tickets/how-to-purchase-tickets.tsx
import React from 'react';
import { CheckCircle, AlertCircle, Info, Calendar, CreditCard, Smartphone } from 'lucide-react';

const HowToPurchaseTickets: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Purchasing tickets on MGLTickets is quick, secure, and straightforward. 
        This comprehensive guide will walk you through every step of the process, 
        from finding your event to receiving your digital tickets.
      </p>

      {/* Step 1 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Find Your Event</h2>
        </div>
        
        <p className="text-gray-700 mb-4">
          Start by browsing or searching for events on the MGLTickets platform. 
          There are several ways to discover events:
        </p>

        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Use the search bar at the top of any page to find specific events by name</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Browse by category (Music, Sports, Arts, Business, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Filter events by date, location, or price range</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span>Check the "Featured Events" section on the homepage</span>
          </li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 font-medium m-0">Pro Tip</p>
              <p className="text-blue-800 text-sm m-0 mt-1">
                Use filters to narrow down your search. You can filter by price range, 
                date, venue, and event type to find exactly what you're looking for.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Review Event Details</h2>
        </div>

        <p className="text-gray-700 mb-4">
          Click on an event to view its complete details page. Here's what you should review:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <Calendar className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Date & Time</h3>
            <p className="text-sm text-gray-600">
              Verify the event date, start time, and duration
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <Info className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Venue Details</h3>
            <p className="text-sm text-gray-600">
              Check location, address, and any parking information
            </p>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Select Your Tickets</h2>
        </div>

        <p className="text-gray-700 mb-4">
          Choose the ticket type and quantity that best suits your needs:
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Common Ticket Types:</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="font-semibold text-orange-600 min-w-[80px]">VIP:</span>
              <span className="text-gray-700">Premium seating, exclusive access, complimentary drinks</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-semibold text-orange-600 min-w-[80px]">Regular:</span>
              <span className="text-gray-700">Standard admission to the event</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-semibold text-orange-600 min-w-[80px]">Student:</span>
              <span className="text-gray-700">Discounted tickets for students</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-semibold text-orange-600 min-w-[80px]">Early Bird:</span>
              <span className="text-gray-700">Discounted tickets for early purchasers</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Step 4 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            4
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Complete Payment</h2>
        </div>

        <p className="text-gray-700 mb-4">
          MGLTickets offers secure payment options including M-Pesa:
        </p>

        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-8 h-8 text-green-700" />
            <h3 className="font-bold text-green-900 text-xl m-0">M-Pesa Payment Steps</h3>
          </div>
          <ol className="space-y-2 text-green-900">
            <li className="flex gap-3">
              <span className="font-bold min-w-[20px]">1.</span>
              <span>Enter your M-Pesa registered phone number</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[20px]">2.</span>
              <span>You'll receive an STK push notification on your phone</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[20px]">3.</span>
              <span>Enter your M-Pesa PIN to authorize the payment</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[20px]">4.</span>
              <span>Wait for payment confirmation (usually within 30 seconds)</span>
            </li>
          </ol>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-medium m-0">Important</p>
              <p className="text-red-800 text-sm m-0 mt-1">
                All ticket sales are final. Please review your order carefully before 
                completing payment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 5 */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            5
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Receive Your Tickets</h2>
        </div>

        <p className="text-gray-700 mb-4">
          Once payment is confirmed, you'll receive your tickets immediately:
        </p>

        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span><strong>Email:</strong> Check your inbox for the confirmation email with ticket attachments</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span><strong>Account:</strong> View and download tickets from "My Tickets" in your account</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span><strong>Mobile App:</strong> Access tickets anytime via the MGLTickets mobile app</span>
          </li>
        </ul>
      </div>
    </article>
  );
};

export default HowToPurchaseTickets;