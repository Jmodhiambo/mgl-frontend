// src/components/articles/ArticleFeedback.tsx
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ArticleFeedbackProps {
  articleSlug: string;
}

const ArticleFeedback: React.FC<ArticleFeedbackProps> = ({ articleSlug }) => {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  const handleFeedback = async (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    
    // Optional: Send to backend
    try {
      await fetch('/api/analytics/article-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          article_slug: articleSlug,
          is_helpful: type === 'helpful'
        })
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Was this article helpful?</h3>
      {feedback ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            ✓ Thank you for your feedback!
          </p>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => handleFeedback('helpful')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            <ThumbsUp className="w-5 h-5" />
            Yes, helpful
          </button>
          <button
            onClick={() => handleFeedback('not-helpful')}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <ThumbsDown className="w-5 h-5" />
            No, not helpful
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleFeedback;