// src/data/helpArticles.ts

export interface ArticleMetadata {
  id: string;
  slug: string;
  componentName: string;
  title: string;
  summary: string;
  categoryId: string;
  categoryName: string;
  readTime: number;
  lastUpdated: string;
  tags: string[];
}

export const articleRegistry: ArticleMetadata[] = [
  // BUYING TICKETS
  {
    id: '1',
    slug: 'how-to-purchase-tickets',
    componentName: 'HowToPurchaseTickets',
    title: 'How to Purchase Tickets',
    summary: 'Complete guide to buying tickets on MGLTickets',
    categoryId: 'buying-tickets',
    categoryName: 'Buying Tickets',
    readTime: 5,
    lastUpdated: '2025-01-08',
    tags: ['tickets', 'purchase', 'buying']
  },
  {
    id: '6',
    slug: 'selecting-ticket-types',
    componentName: 'SelectingTicketTypes',
    title: 'Selecting Ticket Types and Quantities',
    summary: 'Choose the right tickets for your needs',
    categoryId: 'buying-tickets',
    categoryName: 'Buying Tickets',
    readTime: 3,
    lastUpdated: '2025-01-08',
    tags: ['tickets', 'types', 'vip']
  },

  // PAYMENTS
  {
    id: '12',
    slug: 'how-to-pay-with-mpesa',
    componentName: 'HowToPayWithMpesa',
    title: 'How to Pay with M-Pesa',
    summary: 'Step-by-step M-Pesa payment guide',
    categoryId: 'payments',
    categoryName: 'Payments & Billing',
    readTime: 5,
    lastUpdated: '2025-01-08',
    tags: ['mpesa', 'payment', 'mobile-money']
  },

  // ORGANIZERS
  {
    id: '34',
    slug: 'creating-your-first-event',
    componentName: 'CreatingYourFirstEvent',
    title: 'Creating Your First Event',
    summary: 'Complete guide to event setup',
    categoryId: 'organizers',
    categoryName: 'For Event Organizers',
    readTime: 8,
    lastUpdated: '2025-01-08',
    tags: ['organizer', 'event', 'create']
  },

  // Add more articles here as you create them...
];

// Helper functions
export const getArticleBySlug = (slug: string): ArticleMetadata | undefined => {
  return articleRegistry.find(article => article.slug === slug);
};

export const getArticlesByCategory = (categoryId: string): ArticleMetadata[] => {
  return articleRegistry.filter(article => article.categoryId === categoryId);
};

export const searchArticles = (query: string): ArticleMetadata[] => {
  const lowerQuery = query.toLowerCase();
  return articleRegistry.filter(article => 
    article.title.toLowerCase().includes(lowerQuery) ||
    article.summary.toLowerCase().includes(lowerQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getAllCategories = (): Array<{ id: string; name: string; count: number }> => {
  const categories = new Map<string, { id: string; name: string; count: number }>();
  
  articleRegistry.forEach(article => {
    if (categories.has(article.categoryId)) {
      categories.get(article.categoryId)!.count++;
    } else {
      categories.set(article.categoryId, {
        id: article.categoryId,
        name: article.categoryName,
        count: 1
      });
    }
  });
  
  return Array.from(categories.values());
};