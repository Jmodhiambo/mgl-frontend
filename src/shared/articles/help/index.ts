// Help Center Articles
// src/shared/articles/help/index.ts

// Export all article categories
export * from './buying-tickets';
export * from './payments';
// export * from './organizers';
// Add more as you create them
// export * from './getting-started';
// export * from './account';
// export * from './events';
// export * from './refunds';
// export * from './security';

// Create a registry for dynamic imports
export const articleComponents: Record<string, React.ComponentType> = {};

// Import and register components
import { HowToPurchaseTickets } from './buying-tickets';
articleComponents['HowToPurchaseTickets'] = HowToPurchaseTickets;

// Import and register payment articles
import { HowToPayWithMpesa } from './payments';
articleComponents['HowToPayWithMpesa'] = HowToPayWithMpesa;

// Add more imports and registrations as you create new articles
// import { SelectingTicketTypes } from './buying-tickets';
// articleComponents['SelectingTicketTypes'] = SelectingTicketTypes;