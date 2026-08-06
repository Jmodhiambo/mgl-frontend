// src/shared/api/user/articleAnalyticsApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Article analytics API calls — view tracking, engagement tracking, feedback,
// and search tracking for the Help Center pages. Consolidated here so
// HelpArticlePage.tsx and HelpCenterPage.tsx don't each hand-roll their own
// axios calls and session-id bookkeeping.
// ─────────────────────────────────────────────────────────────────────────────

import api from '@shared/api/axiosConfig';

// ── Types (mirror the backend schemas in app/schemas/article_analytics.py) ────

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ArticleViewCreate {
  article_slug: string;
  session_id: string;
  referrer?: string | null;
  device_type?: DeviceType | null;
  user_agent?: string | null;
  screen_width?: number | null;
  screen_height?: number | null;
}

export interface ArticleEngagementCreate {
  article_slug: string;
  session_id: string;
  time_spent_seconds: number;
  scroll_depth_percent: number;
}

export interface ArticleSearchCreate {
  query: string;
  results_count: number;
  session_id?: string | null;
}

export interface ArticleSearchQueryOut {
  id: number;
  query: string;
  results_count: number;
  user_id: number | null;
  session_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface ArticleSearchClickCreate {
  search_query_id: number;
  clicked_article_slug: string;
  clicked_article_title?: string | null;
  result_position?: number | null;
  time_to_click_seconds?: number | null;
}

export type FeedbackValue = 'helpful' | 'not-helpful';

export interface ArticleFeedbackCreate {
  article_slug: string;
  feedback: FeedbackValue;
}

// ── Session/device helpers ─────────────────────────────────────────────────────

/** Get the anonymous analytics session id, creating one if this is a new tab session. */
export const getOrCreateSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const getDeviceType = (): DeviceType => {
  if (window.innerWidth < 768) return 'mobile';
  if (window.innerWidth < 1024) return 'tablet';
  return 'desktop';
};

// ── Tracking calls ──────────────────────────────────────────────────────────────
// All of these are fire-and-forget from the caller's perspective — failures
// should never disrupt the reading experience, so callers should still wrap
// these in their own try/catch (kept explicit at the call site rather than
// swallowed here, so a real bug isn't invisible in dev).

export const trackArticleView = async (articleSlug: string): Promise<void> => {
  const payload: ArticleViewCreate = {
    article_slug: articleSlug,
    session_id: getOrCreateSessionId(),
    referrer: document.referrer || 'direct',
    device_type: getDeviceType(),
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
  };
  await api.post('/analytics/article-view', payload);
};

export const trackArticleEngagement = async (
  articleSlug: string,
  timeSpentSeconds: number,
  scrollDepthPercent: number,
): Promise<void> => {
  const sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) return; // no view was ever tracked this session — nothing to attribute engagement to

  const payload: ArticleEngagementCreate = {
    article_slug: articleSlug,
    session_id: sessionId,
    time_spent_seconds: timeSpentSeconds,
    scroll_depth_percent: scrollDepthPercent,
  };
  await api.post('/analytics/article-engagement', payload);
};

export const submitArticleFeedback = async (
  articleSlug: string,
  feedback: FeedbackValue,
): Promise<void> => {
  const payload: ArticleFeedbackCreate = {
    article_slug: articleSlug,
    feedback,
  };
  await api.post('/analytics/article-feedback', payload);
};

/** Track a Help Center search. Returns the created search-query row —
 * hang on to `.id` if you want to attribute a later article click to it. */
export const trackArticleSearch = async (
  query: string,
  resultsCount: number,
): Promise<ArticleSearchQueryOut> => {
  const payload: ArticleSearchCreate = {
    query,
    results_count: resultsCount,
    session_id: sessionStorage.getItem('session_id'),
  };
  return (await api.post<ArticleSearchQueryOut>('/analytics/article-search', payload)).data;
};

export const trackArticleSearchClick = async (
  searchQueryId: number,
  clickedArticleSlug: string,
  clickedArticleTitle: string,
  resultPosition: number,
  timeToClickSeconds: number | null,
): Promise<void> => {
  const payload: ArticleSearchClickCreate = {
    search_query_id: searchQueryId,
    clicked_article_slug: clickedArticleSlug,
    clicked_article_title: clickedArticleTitle,
    result_position: resultPosition,
    time_to_click_seconds: timeToClickSeconds,
  };
  await api.post('/analytics/article-search-click', payload);
};