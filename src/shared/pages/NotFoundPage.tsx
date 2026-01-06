import React, { useState, useEffect } from 'react';
import { Search, Home, ArrowLeft, Mail, HelpCircle, FileText, Calendar } from 'lucide-react';
import { NotFoundSEO } from '@shared/components/SEO';

const NotFoundPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (autoRedirect && countdown === 0) {
      window.location.href = '/';
    }
  }, [countdown, autoRedirect]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const popularPages = [
    { name: 'Browse Events', path: '/browse-events', icon: Calendar },
    { name: 'Help Center', path: '/help', icon: HelpCircle },
    { name: 'Contact Us', path: '/contact', icon: Mail },
    { name: 'FAQ', path: '/faq', icon: FileText },
  ];

  return (
    <>
      <NotFoundSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Main Error Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center mb-8">
            {/* 404 Animation */}
            <div className="mb-6">
              <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mb-4">
                404
              </div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>

            {/* Auto-redirect Notice */}
            {autoRedirect && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-orange-800">
                  Redirecting to homepage in <span className="font-bold text-orange-600">{countdown}</span> seconds...
                </p>
                <button
                  onClick={() => setAutoRedirect(false)}
                  className="text-sm text-orange-600 hover:text-orange-700 underline mt-2"
                >
                  Cancel auto-redirect
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-3">Try searching for what you need:</p>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="/"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </a>
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </div>

            {/* Error Code Info */}
            <p className="text-xs text-gray-400">
              Error Code: 404 | Page Not Found
            </p>
          </div>

          {/* Popular Pages */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Popular Pages
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {popularPages.map((page) => {
                const Icon = page.icon;
                return (
                  <a
                    key={page.path}
                    href={page.path}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                      <Icon className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors text-sm">
                      {page.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Still can't find what you're looking for?{' '}
              <a href="/contact" className="text-orange-600 hover:text-orange-700 font-medium underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;