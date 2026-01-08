// src/components/articles/ArticleLayout.tsx
import React from 'react';

interface ArticleLayoutProps {
  children: React.ReactNode;
}

const ArticleLayout: React.FC<ArticleLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default ArticleLayout;