// src/apps/admin/services/articleAnalyticsApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Admin-only Help Center analytics API calls — backs the analytics dashboard.
// Distinct from the user-facing tracking calls in
// @shared/api/user/articleAnalyticsApi.ts (view/engagement/feedback/search
// tracking) — this file only reads aggregated data, all endpoints require
// require_admin on the backend.
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';
import type {
    ArticlesOverview,
    // CountBucket,
    // ViewsOverTimeEntry,
    ArticleStats,
    TopArticle,
    ArticleImprovementCandidate,
    ArticleSearchQueryLog,
    ArticleSearchClickLog,
    PopularSearchTerm,
    SearchAnalyticsSummary,
} from '@admin/types/articleAnalyticsTypes';

// ── Calls ──────────────────────────────────────────────────────────────────────

export const admin_getArticlesOverview = async (days = 30): Promise<ArticlesOverview> => {
  return (await api.get('/admin/analytics/articles/overview', { params: { days } })).data;
};

export const admin_getArticleStats = async (articleSlug: string): Promise<ArticleStats | null> => {
  return (await api.get(`/admin/analytics/articles/${articleSlug}/stats`)).data;
};

export const admin_getTopArticles = async (limit = 10, days = 30): Promise<TopArticle[]> => {
  return (await api.get('/admin/analytics/articles/top', { params: { limit, days } })).data;
};

export const admin_getArticlesNeedingImprovement = async (
  threshold = 0.5,
): Promise<ArticleImprovementCandidate[]> => {
  return (await api.get('/admin/analytics/articles/needing-improvement', { params: { threshold } })).data;
};

export const admin_getSearchQueries = async (limit = 10, days = 30): Promise<ArticleSearchQueryLog[]> => {
  return (await api.get('/admin/analytics/search-queries', { params: { limit, days } })).data;
};

export const admin_getPopularSearchTerms = async (limit = 10, days = 30): Promise<PopularSearchTerm[]> => {
  return (await api.get('/admin/analytics/search-terms', { params: { limit, days } })).data;
};

export const admin_getSearchClicks = async (days = 30, limit = 50): Promise<ArticleSearchClickLog[]> => {
  return (await api.get('/admin/analytics/search-clicks', { params: { days, limit } })).data;
};

export const admin_getSearchSummary = async (days = 30): Promise<SearchAnalyticsSummary> => {
  return (await api.get('/admin/analytics/search-summary', { params: { days } })).data;
};