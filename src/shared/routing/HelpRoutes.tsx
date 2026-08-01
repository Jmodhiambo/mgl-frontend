// src/routes/helpRoutes.tsx
import { RouteObject } from 'react-router-dom';
import HelpCenterPage from '@shared/pages/help/HelpCenterPage';
import HelpArticlePage from '@shared/pages/help/HelpArticlePage';
import HelpCategoryPage from '@shared/pages/help/HelpCategoryPage';

export const helpRoutes: RouteObject[] = [
  {
    path: '/help',
    element: <HelpCenterPage />
  },
  {
    path: '/help/categories/:categoryId',
    element: <HelpCategoryPage />
  },
  {
    path: '/help/articles/:slug',
    element: <HelpArticlePage />
  }
];