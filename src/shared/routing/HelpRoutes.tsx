// src/routes/helpRoutes.tsx
import { RouteObject } from 'react-router-dom';
import HelpCenterPage from '@shared/pages/help/HelpCenterPage';
import HelpArticlePage from '@shared/pages/help/HelpArticlePage';

export const helpRoutes: RouteObject[] = [
  {
    path: '/help',
    element: <HelpCenterPage />
  },
  {
    path: '/help/articles/:slug',
    element: <HelpArticlePage />
  }
];