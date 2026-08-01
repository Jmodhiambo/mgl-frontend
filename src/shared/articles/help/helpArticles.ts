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
  // GETTING STARTED
  {
    id: '1',
    slug: 'creating-your-account',
    componentName: 'CreatingYourAccount',
    title: 'Creating Your MGLTickets Account',
    summary: 'Step-by-step guide to signing up and setting up your account',
    categoryId: 'getting-started',
    categoryName: 'Getting Started',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['account', 'signup', 'getting-started']
  },
  {
    id: '2',
    slug: 'how-to-browse-events',
    componentName: 'HowToBrowseEvents',
    title: 'How to Browse Events',
    summary: 'Discover events and use search filters effectively',
    categoryId: 'getting-started',
    categoryName: 'Getting Started',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['events', 'search', 'browse']
  },
  {
    id: '3',
    slug: 'understanding-event-pages',
    componentName: 'UnderstandingEventPages',
    title: 'Understanding Event Pages',
    summary: 'Navigate event details, dates, and ticket types',
    categoryId: 'getting-started',
    categoryName: 'Getting Started',
    readTime: 4,
    lastUpdated: '2026-07-20',
    tags: ['events', 'tickets', 'venue']
  },
  {
    id: '4',
    slug: 'account-settings-overview',
    componentName: 'AccountSettingsOverview',
    title: 'Account Settings Overview',
    summary: 'Manage your profile, preferences, and notifications',
    categoryId: 'getting-started',
    categoryName: 'Getting Started',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['account', 'settings', 'notifications']
  },

  // BUYING TICKETS
  {
    id: '5',
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
  {
    id: '7',
    slug: 'ticket-prices-and-fees',
    componentName: 'TicketPricesAndFees',
    title: 'Understanding Ticket Prices and Fees',
    summary: 'Breakdown of ticket costs and service fees',
    categoryId: 'buying-tickets',
    categoryName: 'Buying Tickets',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['pricing', 'fees', 'mpesa']
  },
  {
    id: '8',
    slug: 'accessing-your-digital-tickets',
    componentName: 'AccessingYourDigitalTickets',
    title: 'Accessing Your Digital Tickets',
    summary: 'Find and manage your tickets after purchase',
    categoryId: 'buying-tickets',
    categoryName: 'Buying Tickets',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['tickets', 'qr-code', 'my-tickets']
  },
  {
    id: '9',
    slug: 'transferring-tickets',
    componentName: 'TransferringTickets',
    title: 'Transferring Tickets to Others',
    summary: 'Share tickets with friends and family',
    categoryId: 'buying-tickets',
    categoryName: 'Buying Tickets',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['tickets', 'sharing', 'transfer']
  },
  {
    id: '10',
    slug: 'troubleshooting-missing-tickets',
    componentName: 'TroubleshootingMissingTickets',
    title: "What to Do If You Don't Receive Your Tickets",
    summary: 'Troubleshooting ticket delivery issues',
    categoryId: 'buying-tickets',
    categoryName: 'Buying Tickets',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['tickets', 'mpesa', 'support']
  },

  // PAYMENTS
  {
    id: '11',
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
  {
    id: '12',
    slug: 'accepted-payment-methods',
    componentName: 'AcceptedPaymentMethods',
    title: 'Accepted Payment Methods',
    summary: 'Learn about M-Pesa and other payment options',
    categoryId: 'payments',
    categoryName: 'Payments & Billing',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['mpesa', 'payment-methods', 'cards']
  },
  {
    id: '13',
    slug: 'payment-security-and-protection',
    componentName: 'PaymentSecurityAndProtection',
    title: 'Payment Security and Protection',
    summary: 'How we keep your payment information safe',
    categoryId: 'payments',
    categoryName: 'Payments & Billing',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['security', 'mpesa', 'fraud']
  },
  {
    id: '14',
    slug: 'troubleshooting-failed-payments',
    componentName: 'TroubleshootingFailedPayments',
    title: 'Troubleshooting Failed Payments',
    summary: 'Common payment issues and solutions',
    categoryId: 'payments',
    categoryName: 'Payments & Billing',
    readTime: 4,
    lastUpdated: '2026-07-20',
    tags: ['mpesa', 'troubleshooting', 'payment']
  },
  {
    id: '15',
    slug: 'understanding-service-fees',
    componentName: 'UnderstandingServiceFees',
    title: 'Understanding Service Fees',
    summary: "Why we charge fees and how they're calculated",
    categoryId: 'payments',
    categoryName: 'Payments & Billing',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['fees', 'pricing', 'mpesa']
  },
  {
    id: '16',
    slug: 'viewing-your-payment-history',
    componentName: 'ViewingYourPaymentHistory',
    title: 'Viewing Your Payment History',
    summary: 'Access your transaction records and receipts',
    categoryId: 'payments',
    categoryName: 'Payments & Billing',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['payment-history', 'receipts', 'orders']
  },

  // ORGANIZERS
  {
    id: '17',
    slug: 'creating-your-first-event',
    componentName: 'CreatingYourFirstEvent',
    title: 'Creating Your First Event',
    summary: 'Complete guide to event setup',
    categoryId: 'organizers',
    categoryName: 'For Event Organizers',
    readTime: 8,
    lastUpdated: '2026-07-20',
    tags: ['organizer', 'event', 'create']
  },
  {
    id: '18',
    slug: 'setting-up-ticket-types',
    componentName: 'SettingUpTicketTypes',
    title: 'Setting Up Ticket Types',
    summary: 'Configure pricing and ticket options',
    categoryId: 'organizers',
    categoryName: 'For Event Organizers',
    readTime: 4,
    lastUpdated: '2026-07-20',
    tags: ['organizer', 'ticket-types', 'pricing']
  },
  {
    id: '19',
    slug: 'managing-event-sales',
    componentName: 'ManagingEventSales',
    title: 'Managing Event Sales',
    summary: 'Track sales and manage bookings',
    categoryId: 'organizers',
    categoryName: 'For Event Organizers',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['organizer', 'sales', 'bookings']
  },
  {
    id: '20',
    slug: 'event-marketing-tools',
    componentName: 'EventMarketingTools',
    title: 'Event Marketing Tools',
    summary: 'Promote your event effectively',
    categoryId: 'organizers',
    categoryName: 'For Event Organizers',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['organizer', 'marketing', 'promotion']
  },
  {
    id: '21',
    slug: 'scanning-tickets-at-entry',
    componentName: 'ScanningTicketsAtEntry',
    title: 'Scanning Tickets at Entry',
    summary: 'Verify attendees on event day',
    categoryId: 'organizers',
    categoryName: 'For Event Organizers',
    readTime: 4,
    lastUpdated: '2026-07-20',
    tags: ['organizer', 'check-in', 'qr-code']
  },
  {
    id: '22',
    slug: 'organizer-dashboard-overview',
    componentName: 'OrganizerDashboardOverview',
    title: 'Organizer Dashboard Overview',
    summary: 'Navigate your organizer tools',
    categoryId: 'organizers',
    categoryName: 'For Event Organizers',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['organizer', 'dashboard']
  },

  // ACCOUNT MANAGEMENT
  {
    id: '23',
    slug: 'updating-your-profile',
    componentName: 'UpdatingYourProfile',
    title: 'Updating Your Profile Information',
    summary: 'Change your name, email, and contact details',
    categoryId: 'account',
    categoryName: 'Account Management',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['account', 'profile']
  },
  {
    id: '24',
    slug: 'changing-your-password',
    componentName: 'ChangingYourPassword',
    title: 'Changing Your Password',
    summary: 'Update your password for security',
    categoryId: 'account',
    categoryName: 'Account Management',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['account', 'password', 'security']
  },
  {
    id: '25',
    slug: 'resetting-forgotten-password',
    componentName: 'ResettingForgottenPassword',
    title: 'Resetting a Forgotten Password',
    summary: 'Recover access to your account',
    categoryId: 'account',
    categoryName: 'Account Management',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['account', 'password', 'recovery']
  },
  {
    id: '26',
    slug: 'email-verification',
    componentName: 'EmailVerification',
    title: 'Email Verification',
    summary: 'Verify your email address',
    categoryId: 'account',
    categoryName: 'Account Management',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['account', 'email', 'verification']
  },
  {
    id: '27',
    slug: 'managing-notification-preferences',
    componentName: 'ManagingNotificationPreferences',
    title: 'Managing Notification Preferences',
    summary: 'Control what emails and alerts you receive',
    categoryId: 'account',
    categoryName: 'Account Management',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['account', 'notifications']
  },
  {
    id: '28',
    slug: 'deactivating-your-account',
    componentName: 'DeactivatingYourAccount',
    title: 'Deactivating or Deleting Your Account',
    summary: 'Close your MGLTickets account',
    categoryId: 'account',
    categoryName: 'Account Management',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['account', 'deactivate', 'delete']
  },

  // EVENTS & ATTENDANCE
  {
    id: '29',
    slug: 'preparing-for-event-day',
    componentName: 'PreparingForEventDay',
    title: 'Preparing for Event Day',
    summary: 'What to bring and how to prepare',
    categoryId: 'events',
    categoryName: 'Events & Attendance',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['events', 'checklist']
  },
  {
    id: '30',
    slug: 'using-your-qr-code-at-entry',
    componentName: 'UsingYourQrCodeAtEntry',
    title: 'Using Your QR Code at Entry',
    summary: 'How ticket verification works',
    categoryId: 'events',
    categoryName: 'Events & Attendance',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['events', 'qr-code', 'check-in']
  },
  {
    id: '31',
    slug: 'what-if-my-event-is-cancelled',
    componentName: 'WhatIfMyEventIsCancelled',
    title: 'What If My Event is Cancelled',
    summary: 'Understanding cancellation policies and refunds',
    categoryId: 'events',
    categoryName: 'Events & Attendance',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['events', 'cancellation', 'refunds']
  },
  {
    id: '32',
    slug: 'rescheduled-events',
    componentName: 'RescheduledEvents',
    title: 'Rescheduled Events',
    summary: 'What happens when an event date changes',
    categoryId: 'events',
    categoryName: 'Events & Attendance',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['events', 'reschedule']
  },
  {
    id: '33',
    slug: 'contacting-event-organizers',
    componentName: 'ContactingEventOrganizers',
    title: 'Contacting Event Organizers',
    summary: 'Get in touch with event hosts',
    categoryId: 'events',
    categoryName: 'Events & Attendance',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['events', 'organizer', 'contact']
  },
  {
    id: '34',
    slug: 'lost-or-forgotten-tickets',
    componentName: 'LostOrForgottenTickets',
    title: 'Lost or Forgotten Tickets',
    summary: 'Retrieve your tickets on event day',
    categoryId: 'events',
    categoryName: 'Events & Attendance',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['events', 'tickets', 'recovery']
  },

  // REFUNDS & CANCELLATIONS
  {
    id: '35',
    slug: 'understanding-our-refund-policy',
    componentName: 'UnderstandingOurRefundPolicy',
    title: 'Understanding Our Refund Policy',
    summary: 'When and how refunds are processed',
    categoryId: 'refunds',
    categoryName: 'Refunds & Cancellations',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['refunds', 'policy']
  },
  {
    id: '36',
    slug: 'how-to-request-a-refund',
    componentName: 'HowToRequestARefund',
    title: 'How to Request a Refund',
    summary: 'Step-by-step refund request process',
    categoryId: 'refunds',
    categoryName: 'Refunds & Cancellations',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['refunds', 'request']
  },
  {
    id: '37',
    slug: 'refund-processing-times',
    componentName: 'RefundProcessingTimes',
    title: 'Refund Processing Times',
    summary: 'How long refunds take to complete',
    categoryId: 'refunds',
    categoryName: 'Refunds & Cancellations',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['refunds', 'mpesa', 'timing']
  },
  {
    id: '38',
    slug: 'event-cancellation-refunds',
    componentName: 'EventCancellationRefunds',
    title: 'Event Cancellation Refunds',
    summary: 'Automatic refunds for cancelled events',
    categoryId: 'refunds',
    categoryName: 'Refunds & Cancellations',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['refunds', 'cancellation']
  },
  {
    id: '39',
    slug: 'partial-refunds-and-fees',
    componentName: 'PartialRefundsAndFees',
    title: 'Partial Refunds and Fees',
    summary: 'Understanding refund amounts and deductions',
    categoryId: 'refunds',
    categoryName: 'Refunds & Cancellations',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['refunds', 'fees']
  },

  // SECURITY & PRIVACY
  {
    id: '40',
    slug: 'account-security-best-practices',
    componentName: 'AccountSecurityBestPractices',
    title: 'Account Security Best Practices',
    summary: 'Tips to protect your account',
    categoryId: 'security',
    categoryName: 'Security & Privacy',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['security', 'account']
  },
  {
    id: '41',
    slug: 'recognizing-fraudulent-tickets',
    componentName: 'RecognizingFraudulentTickets',
    title: 'Recognizing Fraudulent Tickets',
    summary: 'Avoid scams and fake tickets',
    categoryId: 'security',
    categoryName: 'Security & Privacy',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['security', 'fraud', 'tickets']
  },
  {
    id: '42',
    slug: 'two-factor-authentication',
    componentName: 'TwoFactorAuthentication',
    title: 'Two-Factor Authentication',
    summary: 'Add extra security to your account',
    categoryId: 'security',
    categoryName: 'Security & Privacy',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['security', '2fa']
  },
  {
    id: '43',
    slug: 'privacy-settings-and-data-protection',
    componentName: 'PrivacySettingsAndDataProtection',
    title: 'Privacy Settings and Data Protection',
    summary: 'Control your personal information',
    categoryId: 'security',
    categoryName: 'Security & Privacy',
    readTime: 3,
    lastUpdated: '2026-07-20',
    tags: ['security', 'privacy', 'data']
  },
  {
    id: '44',
    slug: 'reporting-suspicious-activity',
    componentName: 'ReportingSuspiciousActivity',
    title: 'Reporting Suspicious Activity',
    summary: 'What to do if you notice fraud',
    categoryId: 'security',
    categoryName: 'Security & Privacy',
    readTime: 2,
    lastUpdated: '2026-07-20',
    tags: ['security', 'fraud', 'report']
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