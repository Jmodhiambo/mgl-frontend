// src/pages/help/HelpCenterPage.tsx (Fixed with proper analytics tracking)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Ticket, CreditCard, User, Calendar, Shield, Settings, ChevronRight, Mail, MessageCircle, Phone } from 'lucide-react';
import { articleRegistry, getAllCategories, searchArticles } from '@shared/data/helpArticles';
import api from '@shared/api/axiosConfig';

const HelpCenterPage: React.FC = () => {

  document.title = 'Help Center - MGLTickets';

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof articleRegistry>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchId, setLastSearchId] = useState<number | null>(null);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);

  const categories = getAllCategories();

  // Category icon mapping
  const categoryIcons: Record<string, React.ElementType> = {
    'getting-started': BookOpen,
    'buying-tickets': Ticket,
    'payments': CreditCard,
    'account': User,
    'events': Calendar,
    'refunds': Settings,
    'organizers': Calendar,
    'security': Shield,
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    
    if (query.trim().length > 0) {
      setIsSearching(true);
      setSearchStartTime(Date.now());
      
      const results = searchArticles(query);
      setSearchResults(results);
      
      // Track the search query
      try {
        const response = await api.post('/analytics/article-search', {
          query: query.trim(),
          results_count: results.length,
          // Optional: include session_id for anonymous users
          session_id: sessionStorage.getItem('session_id') || null
        });
        
        // Store the search ID for click tracking
        if (response.data?.search_query_id) {
          setLastSearchId(response.data.search_query_id);
        }
      } catch (error) {
        console.error('Failed to track search:', error);
        // Don't block UI if analytics fails
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
      setLastSearchId(null);
      setSearchStartTime(null);
    }
  };

  const handleArticleClick = async (articleSlug: string, articleTitle: string, position: number) => {
    // Calculate time to click if we have a search start time
    const timeToClick = searchStartTime 
      ? Math.floor((Date.now() - searchStartTime) / 1000)
      : null;

    // Track which article was clicked from search results
    if (lastSearchId && isSearching) {
      try {
        await api.post('/analytics/article-search-click', {
          search_query_id: lastSearchId,
          clicked_article_slug: articleSlug,
          clicked_article_title: articleTitle,
          result_position: position + 1,  // Convert to 1-indexed
          time_to_click_seconds: timeToClick
        });
      } catch (error) {
        console.error('Failed to track search click:', error);
        // Don't block navigation if analytics fails
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="mt-4 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
                  : 'No results found'}
              </h2>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((article, index) => (
                    <Link
                      key={article.slug}
                      to={`/help/articles/${article.slug}`}
                      onClick={() => handleArticleClick(article.slug, article.title, index)}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded-full">
                              {article.categoryName}
                            </span>
                            <span>•</span>
                            <span>{article.readTime} min read</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 ml-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">
                    No articles found for "{searchTerm}". Try different keywords.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories Grid - Only show when not searching */}
        {!isSearching && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {categories.map((category) => {
                const Icon = categoryIcons[category.id] || BookOpen;
                const categoryArticles = articleRegistry.filter(
                  (article) => article.categoryId === category.id
                );

                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        {category.count} article{category.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {category.name}
                    </h3>

                    <div className="space-y-2">
                      {categoryArticles.slice(0, 3).map((article) => (
                        <Link
                          key={article.slug}
                          to={`/help/articles/${article.slug}`}
                          className="block text-sm text-gray-600 hover:text-orange-600 transition-colors"
                        >
                          → {article.title}
                        </Link>
                      ))}
                      {categoryArticles.length > 3 && (
                        <button
                          onClick={() => handleSearch(category.name)}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          View all {categoryArticles.length} articles →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Popular Articles - Only show when not searching */}
        {!isSearching && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {articleRegistry.slice(0, 6).map((article) => (
                <Link
                  key={article.slug}
                  to={`/help/articles/${article.slug}`}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{article.summary}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{article.readTime} min read</span>
                        <span>•</span>
                        <span>{article.categoryName}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Contact Support Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-8 text-center text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-lg mb-6 opacity-90">
            Can't find what you're looking for? Our support team is ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </Link>
            <a
              href="https://wa.me/254799602055"
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

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/faq"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
              FAQ
            </h3>
            <p className="text-sm text-gray-600">Quick answers to common questions</p>
          </Link>
          <Link
            to="/refund-policy"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
              Refund Policy
            </h3>
            <p className="text-sm text-gray-600">Learn about refunds and cancellations</p>
          </Link>
          <Link
            to="/terms"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
              Terms of Service
            </h3>
            <p className="text-sm text-gray-600">Read our terms and conditions</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;