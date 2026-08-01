// src/pages/help/HelpCategoryPage.tsx
import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  BookOpen,
  Ticket,
  CreditCard,
  User,
  Calendar,
  Shield,
  Settings,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { getArticlesByCategory, getAllCategories } from '@shared/articles/help/helpArticles';

const categoryIcons: Record<string, React.ElementType> = {
  'getting-started': BookOpen,
  'buying-tickets': Ticket,
  payments: CreditCard,
  account: User,
  events: Calendar,
  refunds: Settings,
  organizers: Calendar,
  security: Shield,
};

const HelpCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  if (!categoryId) {
    return <Navigate to="/help" replace />;
  }

  const articles = getArticlesByCategory(categoryId);
  const category = getAllCategories().find((c) => c.id === categoryId);

  document.title = category ? `${category.name} - Help Center - MGLTickets` : 'Help Center - MGLTickets';

  if (!category || articles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find any articles for this category.
          </p>
          <Link
            to="/help"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  const Icon = categoryIcons[category.id] || BookOpen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/help"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Help Center
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600">
              {category.count} article{category.count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/help/articles/${article.slug}`}
              className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{article.summary}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{article.readTime} min read</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 ml-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpCategoryPage;