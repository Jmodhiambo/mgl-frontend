// src/pages/help/HelpArticlePage.tsx
import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Mail, MessageCircle } from 'lucide-react';
import ArticleLayout from '@shared/components/layouts/ArticleLayout';
import ArticleFeedback from '@shared/components/articles/ArticleFeedback';
import RelatedArticles from '@shared/components/articles/RelatedArticles';
import { getArticleBySlug } from '@shared/data/helpArticles';
import { articleComponents } from '@shared/articles/help';

const HelpArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Get article metadata
  const articleMeta = slug ? getArticleBySlug(slug) : undefined;

  // If article not found, redirect to help center
  if (!articleMeta) {
    return <Navigate to="/help" replace />;
  }

  // Get the article component
  const ArticleComponent = articleComponents[articleMeta.componentName];

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

  // Set page title
  useEffect(() => {
    document.title = `${articleMeta.title} - MGLTickets Help Center`;
  }, [articleMeta]);

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