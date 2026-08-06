// src/apps/admin/types/articleAnalyticsTypes.ts
// ── Types (mirror app/schemas/article_analytics.py) ────────────────────────────

export interface ArticlesOverview {
  total_views: number;
  total_unique_sessions: number;
  total_searches: number;
  total_feedback: number;
  helpful_rate: number | null;
  avg_engagement_seconds: number | null;
  articles_needing_improvement: number;
}

export interface CountBucket {
  label: string | null;
  count: number;
}

export interface ViewsOverTimeEntry {
  viewed_at: string;
  count: number;
}

export interface ArticleStats {
  total_views: number;
  unique_sessions: number;
  average_time_spent: number | null;
  average_scroll_depth: number | null;
  max_time_spent: number | null;
  max_scroll_depth: number | null;
  device_breakdown: CountBucket[];
  top_referrers: CountBucket[];
  top_user_agents: CountBucket[];
  views_over_time: ViewsOverTimeEntry[];
  total_feedback: number;
  helpful_count: number;
  not_help_count: number;
}

export interface TopArticle {
  article_slug: string;
  view_count: number;
  unique_sessions: number;
}

export interface ArticleImprovementCandidate {
  article_slug: string;
  total_feedback: number;
  helpful_count: number;
  helpful_rate: number;
}

export interface ArticleSearchQueryLog {
  id: number;
  query: string;
  results_count: number;
  user_id: number | null;
  session_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface ArticleSearchClickLog {
  id: number;
  search_query_id: number;
  clicked_article_slug: string;
  clicked_article_title: string | null;
  result_position: number | null;
  time_to_click_seconds: number | null;
  created_at: string;
}

export interface PopularSearchTerm {
  query: string;
  search_count: number;
  avg_results: number;
  click_through_rate: number;
  most_clicked_article: string | null;
}

export interface SearchAnalyticsSummary {
  total_searches: number;
  total_clicks: number;
  click_through_rate: number;
  avg_results_per_search: number;
  avg_time_to_click: number | null;
  most_searched_terms: [string, number][];
  most_clicked_articles: [string, number][];
  searches_with_no_clicks: number;
}