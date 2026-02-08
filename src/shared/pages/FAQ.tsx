import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Ticket, CreditCard, Calendar, User, Shield, RefreshCw } from 'lucide-react';
import { FAQSEO } from '@shared/components/SEO';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  document.title = 'FAQ - MGLTickets';

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'tickets', name: 'Buying Tickets', icon: Ticket },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'account', name: 'Account', icon: User },
    { id: 'refunds', name: 'Refunds', icon: RefreshCw },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const faqs: FAQItem[] = [
    // Buying Tickets
    {
      category: 'tickets',
      question: 'How do I purchase tickets on MGLTickets?',
      answer: 'To purchase tickets: 1) Browse events and select the one you want to attend, 2) Choose your ticket type and quantity, 3) Click "Buy Tickets" and create an account or log in, 4) Complete payment via M-Pesa, 5) Receive your tickets instantly via email and in your account. It\'s that simple!'
    },
    {
      category: 'tickets',
      question: 'Will I receive a physical ticket?',
      answer: 'No, MGLTickets uses digital ticketing. After purchase, you\'ll receive an email with your ticket containing a unique QR code. You can also access your tickets anytime through your MGLTickets account. Simply show the QR code on your phone at the event entrance.'
    },
    {
      category: 'tickets',
      question: 'Can I buy tickets for someone else?',
      answer: 'Yes! When purchasing tickets, you can enter the attendee\'s information if it\'s different from yours. You can also forward the ticket email to the person attending, or share it directly from your MGLTickets account.'
    },
    {
      category: 'tickets',
      question: 'Is there a limit to how many tickets I can buy?',
      answer: 'Ticket purchase limits vary by event. Some organizers set maximum purchase quantities to ensure fair access. Any limits will be clearly displayed on the event page before you complete your purchase.'
    },
    {
      category: 'tickets',
      question: 'What if I don\'t receive my ticket email?',
      answer: 'First, check your spam/junk folder. If you still can\'t find it, log into your MGLTickets account where your tickets are always accessible. If you continue to have issues, contact our support team at support@mgltickets.com with your booking reference number.'
    },

    // Payments
    {
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa as our primary payment method. This allows for secure, instant payment processing. Simply enter your M-Pesa phone number, and you\'ll receive an STK push to complete the payment.'
    },
    {
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Absolutely! We use industry-standard encryption and security protocols. We never store your full payment details. All M-Pesa transactions are processed through Safaricom\'s secure payment gateway, and we comply with PCI DSS security standards.'
    },
    {
      category: 'payments',
      question: 'Why was my payment declined?',
      answer: 'Common reasons include: insufficient M-Pesa balance, incorrect PIN entry, network issues, or your M-Pesa account may need activation. Check your M-Pesa balance and ensure you have enough funds including the transaction fee. If the problem persists, contact Safaricom customer service.'
    },
    {
      category: 'payments',
      question: 'I was charged but didn\'t receive my tickets. What do I do?',
      answer: 'Don\'t worry! First, check your email (including spam) and your MGLTickets account. If your tickets aren\'t there, contact us immediately at support@mgltickets.com with your M-Pesa transaction code. We\'ll investigate and resolve the issue within 24 hours.'
    },
    {
      category: 'payments',
      question: 'Do you charge any booking fees?',
      answer: 'Yes, a small service fee is added to each ticket purchase. This fee covers payment processing, platform maintenance, and customer support. The total amount including all fees is clearly displayed before you complete your purchase.'
    },

    // Events
    {
      category: 'events',
      question: 'How do I find events near me?',
      answer: 'Use the search and filter features on our homepage. You can filter by location, date, category, and price. We also have a "Near Me" feature that shows events in your area based on your location. Sign up for our newsletter to get personalized event recommendations!'
    },
    {
      category: 'events',
      question: 'Can I get notifications about upcoming events?',
      answer: 'Yes! Once you create an account, you can enable notifications in your settings. We\'ll send you email updates about new events matching your interests, upcoming events you\'ve favorited, and reminders for events you\'ve purchased tickets for.'
    },
    {
      category: 'events',
      question: 'What happens if an event is cancelled?',
      answer: 'If an event is cancelled by the organizer, you\'ll receive an automatic email notification and a full refund including all service fees. Refunds are processed to your M-Pesa account within 5-7 business days. You can track the refund status in your account.'
    },
    {
      category: 'events',
      question: 'What if an event is postponed?',
      answer: 'If an event is postponed, your tickets remain valid for the new date. You\'ll receive an email with the updated event details. If you can\'t attend the new date, you may request a refund according to the organizer\'s refund policy. Check your email for specific instructions.'
    },
    {
      category: 'events',
      question: 'How do I contact the event organizer?',
      answer: 'Event organizer contact information is available on the event page. You can also reach out to them through our platform by clicking "Contact Organizer" on the event page. For urgent matters, contact our support team and we\'ll help facilitate communication.'
    },

    // Account
    {
      category: 'account',
      question: 'How do I create an MGLTickets account?',
      answer: 'Click "Sign Up" at the top of the page. Enter your name, email, phone number, and create a password. You\'ll receive a verification email - click the link to activate your account. Then you\'re ready to start booking tickets!'
    },
    {
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Login" then "Forgot Password". Enter your email address and we\'ll send you a password reset link. Click the link in the email and create a new password. If you don\'t receive the email, check your spam folder or contact support.'
    },
    {
      category: 'account',
      question: 'Can I change my account information?',
      answer: 'Yes! Log into your account and go to "Account Settings" or "Profile". There you can update your name, email, phone number, and password. Make sure to save your changes. Some changes may require email verification for security.'
    },
    {
      category: 'account',
      question: 'How do I view my past tickets and bookings?',
      answer: 'Log into your account and navigate to "My Bookings" or "My Tickets". Here you\'ll see all your current and past ticket purchases, including ticket details, event information, and booking history. You can also download or resend tickets from this page.'
    },
    {
      category: 'account',
      question: 'Can I delete my account?',
      answer: 'Yes, you can deactivate your account in Account Settings. Note that this will cancel any unused tickets and you may forfeit refunds. If you have active bookings, we recommend waiting until after your events. Contact support@mgltickets.com if you need assistance.'
    },

    // Refunds
    {
      category: 'refunds',
      question: 'What is your refund policy?',
      answer: 'Our standard refund policy: Full refund if cancelled 7+ days before the event, 50% refund if cancelled 3-7 days before, no refund if cancelled less than 3 days before. However, individual events may have different policies - always check the specific event\'s refund terms before purchasing.'
    },
    {
      category: 'refunds',
      question: 'How do I request a refund?',
      answer: 'Log into your account, go to "My Bookings", select the booking you want to cancel, and click "Request Refund". Fill out the form explaining your reason, and submit. You\'ll receive an email confirmation and updates on your refund status. Processing typically takes 5-7 business days.'
    },
    {
      category: 'refunds',
      question: 'How long does it take to receive a refund?',
      answer: 'Once your refund is approved, it takes 5-7 business days to process back to your M-Pesa account. You\'ll receive email notifications when your refund is approved and when it\'s been processed. Check your M-Pesa transaction history for the refund.'
    },
    {
      category: 'refunds',
      question: 'Are service fees refundable?',
      answer: 'Service fees are only refundable if the event is cancelled by the organizer. For customer-initiated cancellations, service fees are non-refundable as they cover the cost of payment processing and platform services already rendered.'
    },
    {
      category: 'refunds',
      question: 'Can I get a refund for a no-show?',
      answer: 'Unfortunately, no. If you purchase a ticket but don\'t attend the event, you\'re not eligible for a refund unless there were extenuating circumstances. We recommend cancelling in advance if you know you can\'t attend, subject to the event\'s refund policy.'
    },

    // Security
    {
      category: 'security',
      question: 'How do I know my tickets are authentic?',
      answer: 'Every MGLTickets ticket has a unique QR code that can only be scanned once. The ticket includes security features, event details, and is linked to your account. Event organizers verify tickets at the entrance using our secure scanning system. Beware of tickets from unofficial sources!'
    },
    {
      category: 'security',
      question: 'What should I do if I lose my ticket?',
      answer: 'Don\'t panic! Your tickets are always accessible in your MGLTickets account. Log in and go to "My Tickets" to view and download them again. You can also check your email for the original ticket. The QR code remains valid even if you download it multiple times.'
    },
    {
      category: 'security',
      question: 'Can someone else use my ticket?',
      answer: 'This depends on the event organizer\'s policy. Some events allow ticket transfers while others require the original purchaser to attend. Check the event\'s terms. If transfers are allowed, you can share the ticket via email or directly from your account. Each ticket can only be used once.'
    },
    {
      category: 'security',
      question: 'Is it safe to buy tickets through MGLTickets?',
      answer: 'Absolutely! We use bank-level encryption to protect your data, secure payment processing through M-Pesa, and strict verification for event organizers. We never share your payment information with organizers. Our platform is regularly audited for security compliance.'
    },
    {
      category: 'security',
      question: 'What if I suspect fraudulent activity on my account?',
      answer: 'Contact us immediately at security@mgltickets.com. Change your password right away. We\'ll investigate suspicious activity and take appropriate action. We have fraud detection systems in place, but always review your account regularly and use a strong, unique password.'
    },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <FAQSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 text-lg">Find answers to common questions about MGLTickets</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-orange-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-5 pt-2 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">
                  We couldn't find any FAQs matching your search. Try different keywords or browse by category.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Still Need Help */}
          <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-lg mb-6 opacity-90">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/help"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
              >
                Visit Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;