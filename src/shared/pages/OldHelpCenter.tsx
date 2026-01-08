import React, { useState } from 'react';
import { BookOpen, Search, Ticket, CreditCard, User, Calendar, Shield, Settings, ChevronRight, MessageCircle, Mail, Phone } from 'lucide-react';
import { HelpCenterSEO } from '@shared/components/SEO';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  summary: string;
}

const OldHelpCenterPage: React.FC = () => {
  document.title = 'Help Center - MGLTickets';

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using MGLTickets',
      icon: BookOpen,
      articles: [
        { id: '1', title: 'Creating Your MGLTickets Account', summary: 'Step-by-step guide to signing up and setting up your account' },
        { id: '2', title: 'How to Browse Events', summary: 'Discover events and use search filters effectively' },
        { id: '3', title: 'Understanding Event Pages', summary: 'Navigate event details, dates, and ticket types' },
        { id: '4', title: 'Account Settings Overview', summary: 'Manage your profile, preferences, and notifications' },
      ]
    },
    {
      id: 'buying-tickets',
      title: 'Buying Tickets',
      description: 'Everything about purchasing tickets',
      icon: Ticket,
      articles: [
        { id: '5', title: 'How to Purchase Tickets', summary: 'Complete guide to buying tickets on MGLTickets' },
        { id: '6', title: 'Selecting Ticket Types and Quantities', summary: 'Choose the right tickets for your needs' },
        { id: '7', title: 'Understanding Ticket Prices and Fees', summary: 'Breakdown of ticket costs and service fees' },
        { id: '8', title: 'Accessing Your Digital Tickets', summary: 'Find and manage your tickets after purchase' },
        { id: '9', title: 'Transferring Tickets to Others', summary: 'Share tickets with friends and family' },
        { id: '10', title: 'What to Do If You Don\'t Receive Your Tickets', summary: 'Troubleshooting ticket delivery issues' },
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      description: 'Payment methods and billing information',
      icon: CreditCard,
      articles: [
        { id: '11', title: 'Accepted Payment Methods', summary: 'Learn about M-Pesa and other payment options' },
        { id: '12', title: 'How to Pay with M-Pesa', summary: 'Step-by-step M-Pesa payment guide' },
        { id: '13', title: 'Payment Security and Protection', summary: 'How we keep your payment information safe' },
        { id: '14', title: 'Troubleshooting Failed Payments', summary: 'Common payment issues and solutions' },
        { id: '15', title: 'Understanding Service Fees', summary: 'Why we charge fees and how they\'re calculated' },
        { id: '16', title: 'Viewing Your Payment History', summary: 'Access your transaction records and receipts' },
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      description: 'Manage your account settings and profile',
      icon: User,
      articles: [
        { id: '17', title: 'Updating Your Profile Information', summary: 'Change your name, email, and contact details' },
        { id: '18', title: 'Changing Your Password', summary: 'Update your password for security' },
        { id: '19', title: 'Resetting a Forgotten Password', summary: 'Recover access to your account' },
        { id: '20', title: 'Email Verification', summary: 'Verify your email address' },
        { id: '21', title: 'Managing Notification Preferences', summary: 'Control what emails and alerts you receive' },
        { id: '22', title: 'Deactivating or Deleting Your Account', summary: 'Close your MGLTickets account' },
      ]
    },
    {
      id: 'events',
      title: 'Events & Attendance',
      description: 'Information about attending events',
      icon: Calendar,
      articles: [
        { id: '23', title: 'Preparing for Event Day', summary: 'What to bring and how to prepare' },
        { id: '24', title: 'Using Your QR Code at Entry', summary: 'How ticket verification works' },
        { id: '25', title: 'What If My Event is Cancelled', summary: 'Understanding cancellation policies and refunds' },
        { id: '26', title: 'Rescheduled Events', summary: 'What happens when an event date changes' },
        { id: '27', title: 'Contacting Event Organizers', summary: 'Get in touch with event hosts' },
        { id: '28', title: 'Lost or Forgotten Tickets', summary: 'Retrieve your tickets on event day' },
      ]
    },
    {
      id: 'refunds',
      title: 'Refunds & Cancellations',
      description: 'Learn about our refund policies',
      icon: Settings,
      articles: [
        { id: '29', title: 'Understanding Our Refund Policy', summary: 'When and how refunds are processed' },
        { id: '30', title: 'How to Request a Refund', summary: 'Step-by-step refund request process' },
        { id: '31', title: 'Refund Processing Times', summary: 'How long refunds take to complete' },
        { id: '32', title: 'Event Cancellation Refunds', summary: 'Automatic refunds for cancelled events' },
        { id: '33', title: 'Partial Refunds and Fees', summary: 'Understanding refund amounts and deductions' },
      ]
    },
    {
      id: 'organizers',
      title: 'For Event Organizers',
      description: 'Guides for hosting events on MGLTickets',
      icon: Calendar,
      articles: [
        { id: '34', title: 'Creating Your First Event', summary: 'Complete guide to event setup' },
        { id: '35', title: 'Setting Up Ticket Types', summary: 'Configure pricing and ticket options' },
        { id: '36', title: 'Managing Event Sales', summary: 'Track sales and manage bookings' },
        { id: '37', title: 'Event Marketing Tools', summary: 'Promote your event effectively' },
        { id: '38', title: 'Scanning Tickets at Entry', summary: 'Verify attendees on event day' },
        { id: '39', title: 'Organizer Dashboard Overview', summary: 'Navigate your organizer tools' },
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Keep your account safe and secure',
      icon: Shield,
      articles: [
        { id: '40', title: 'Account Security Best Practices', summary: 'Tips to protect your account' },
        { id: '41', title: 'Recognizing Fraudulent Tickets', summary: 'Avoid scams and fake tickets' },
        { id: '42', title: 'Two-Factor Authentication', summary: 'Add extra security to your account' },
        { id: '43', title: 'Privacy Settings and Data Protection', summary: 'Control your personal information' },
        { id: '44', title: 'Reporting Suspicious Activity', summary: 'What to do if you notice fraud' },
      ]
    },
  ];

  const filteredCategories = categories.filter(category => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = category.title.toLowerCase().includes(searchLower);
    const descMatch = category.description.toLowerCase().includes(searchLower);
    const articleMatch = category.articles.some(article => 
      article.title.toLowerCase().includes(searchLower) ||
      article.summary.toLowerCase().includes(searchLower)
    );
    
    return titleMatch || descMatch || articleMatch;
  });

  return (
    <>
      <HelpCenterSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find answers, guides, and resources to help you make the most of MGLTickets
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-md p-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          {!selectedCategory && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                        <Icon className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <p className="text-sm text-orange-600 font-medium">
                      {category.articles.length} articles
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Category Detail View */}
          {selectedCategory && (
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-6"
              >
                ← Back to all categories
              </button>

              {categories
                .filter((cat) => cat.id === selectedCategory)
                .map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id}>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
                          <p className="text-gray-600">{category.description}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {category.articles.map((article) => (
                          <div
                            key={article.id}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                  {article.title}
                                </h3>
                                <p className="text-gray-600 text-sm">{article.summary}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 ml-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">
                We couldn't find any help articles matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Contact Support Section */}
          {!selectedCategory && (
            <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
              <p className="text-lg mb-6 opacity-90">
                Can't find what you're looking for? Our support team is ready to assist you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Contact Support
                </a>
                <a
                  href="https://wa.me/254700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Us
                </a>
                <a
                  href="tel:+254700000000"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
              </div>
            </div>
          )}

          {/* Quick Links */}
          {!selectedCategory && (
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <a
                href="/faq"
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
              >
                <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
                <p className="text-sm text-gray-600">Quick answers to common questions</p>
              </a>
              <a
                href="/refund"
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Refund Policy</h3>
                <p className="text-sm text-gray-600">Learn about refunds and cancellations</p>
              </a>
              <a
                href="/terms"
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Terms of Service</h3>
                <p className="text-sm text-gray-600">Read our terms and conditions</p>
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OldHelpCenterPage;