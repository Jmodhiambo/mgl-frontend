// src/components/articles/RelatedArticles.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getArticlesByCategory, ArticleMetadata } from '@shared/data/helpArticles';

interface RelatedArticlesProps {
  currentSlug: string;
  category: string;
  limit?: number;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ 
  currentSlug, 
  category,
  limit = 3 
}) => {
  const relatedArticles = getArticlesByCategory(category)
    .filter((article: ArticleMetadata) => article.slug !== currentSlug)
    .slice(0, limit);

  if (relatedArticles.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {relatedArticles.map((article: ArticleMetadata) => (
          <Link
            key={article.slug}
            to={`/help/articles/${article.slug}`}
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
              {article.title}
            </h4>
            <p className="text-sm text-gray-600">{article.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;