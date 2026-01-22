// src/pages/help/HelpArticlePage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Mail, MessageCircle } from 'lucide-react';
import ArticleLayout from '@shared/components/layouts/ArticleLayout';
import ArticleFeedback from '@shared/components/articles/ArticleFeedback';
import RelatedArticles from '@shared/components/articles/RelatedArticles';
import { getArticleBySlug } from '@shared/data/helpArticles';
import { articleComponents } from '@shared/articles/help';
import api from '@shared/api/axiosConfig'; // Your configured axios instance

const HelpArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const startTimeRef = useRef<number>(Date.now());
  const [maxScrollDepth, setMaxScrollDepth] = useState<number>(0);
  const hasTrackedInitialView = useRef<boolean>(false);
  
  // Get article metadata
  const articleMeta = slug ? getArticleBySlug(slug) : undefined;

  // If article not found, redirect to help center
  if (!articleMeta) {
    return <Navigate to="/help" replace />;
  }

  // Get the article component
  const ArticleComponent = articleComponents[articleMeta.componentName];

  // Track scroll depth
  useEffect(() => {
    if (!slug) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Calculate scroll depth percentage
      const scrollDepth = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );
      
      // Update max scroll depth
      setMaxScrollDepth(prev => Math.max(prev, Math.min(scrollDepth, 100)));
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial calculation
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  // Track initial article view
  useEffect(() => {
    if (!slug || hasTrackedInitialView.current) return;

    const trackArticleView = async () => {
      try {
        // Get or create session ID
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('session_id', sessionId);
        }

        // Determine device type
        const deviceType = window.innerWidth < 768 ? 'mobile' : 
                          window.innerWidth < 1024 ? 'tablet' : 'desktop';

        // Track the initial view
        await api.post('/analytics/article-view', {
          article_slug: slug,
          session_id: sessionId,
          referrer: document.referrer || 'direct',
          device_type: deviceType,
          user_agent: navigator.userAgent,
          screen_width: window.innerWidth,
          screen_height: window.innerHeight
        });

        hasTrackedInitialView.current = true;
      } catch (error) {
        // Silent fail - don't disrupt user experience
        console.error('Failed to track article view:', error);
      }
    };

    // Track view after a short delay to ensure legitimate view
    const timeoutId = setTimeout(trackArticleView, 1000);

    return () => clearTimeout(timeoutId);
  }, [slug]);

  // Track time spent and scroll depth on page leave
  useEffect(() => {
    if (!slug) return;

    const trackEngagement = async () => {
      try {
        // Calculate time spent in seconds
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        // Only track if user spent at least 3 seconds
        if (timeSpent < 3) return;

        // Get session ID
        const sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) return;

        // Send engagement data
        await api.post('/analytics/article-engagement', {
          article_slug: slug,
          session_id: sessionId,
          time_spent_seconds: timeSpent,
          scroll_depth_percent: maxScrollDepth
        });
      } catch (error) {
        // Silent fail
        console.error('Failed to track engagement:', error);
      }
    };

    // Track on page unload/visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackEngagement();
      }
    };

    const handleBeforeUnload = () => {
      trackEngagement();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Also track periodically (every 30 seconds) for long reads
    const intervalId = setInterval(trackEngagement, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(intervalId);
      // Final tracking on unmount
      trackEngagement();
    };
  }, [slug, maxScrollDepth]);

  // Set page title
  useEffect(() => {
    if (articleMeta) {
      document.title = `${articleMeta.title} - MGLTickets Help Center`;
    }
  }, [articleMeta]);

  // If component doesn't exist, show coming soon
  if (!ArticleComponent) {
    return (
      <ArticleLayout>
        <Link 
          to="/help" 
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {articleMeta.title}
          </h1>
          <p className="text-gray-600 mb-6">
            This article is coming soon. We're working on creating comprehensive 
            content for this topic.
          </p>
          <Link
            to="/help"
            className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Browse Other Articles
          </Link>
        </div>
      </ArticleLayout>
    );
  }

  return (
    <ArticleLayout>
      {/* Breadcrumb */}
      <Link 
        to="/help" 
        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Help Center
      </Link>

      {/* Article Header */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Clock className="w-4 h-4" />
          <span>{articleMeta.readTime} min read</span>
          <span>•</span>
          <span>Updated {new Date(articleMeta.lastUpdated).toLocaleDateString()}</span>
          <span>•</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            {articleMeta.categoryName}
          </span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {articleMeta.title}
        </h1>
        <p className="text-xl text-gray-600">
          {articleMeta.summary}
        </p>
      </div>

      {/* Article Content */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <ArticleComponent />
      </div>

      {/* Feedback */}
      <ArticleFeedback articleSlug={slug!} />

      {/* Need Help CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white mb-6">
        <h3 className="text-2xl font-bold mb-3">Still Need Help?</h3>
        <p className="text-lg mb-6 opacity-90">
          Our support team is available 24/7 to assist you with any questions or issues.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/contact"
            className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-center flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </Link>
          <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Live Chat
          </button>
        </div>
      </div>

      {/* Related Articles */}
      <RelatedArticles 
        currentSlug={slug!}
        category={articleMeta.categoryId}
      />
    </ArticleLayout>
  );
};

export default HelpArticlePage;