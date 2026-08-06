// src/apps/admin/pages/ArticleAnalytics.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Eye, Users, Search, ThumbsUp, Clock, AlertTriangle,
  TrendingUp, MousePointerClick, Loader2, RefreshCw,
} from 'lucide-react';
import {
  admin_getArticlesOverview,
  admin_getTopArticles,
  admin_getArticlesNeedingImprovement,
  admin_getPopularSearchTerms,
  admin_getSearchSummary,
} from '@admin/services/articleAnalyticsApi';
import type {
  ArticlesOverview,
  TopArticle,
  ArticleImprovementCandidate,
  PopularSearchTerm,
  SearchAnalyticsSummary,
} from '@admin/types/articleAnalyticsTypes';
import { formatPercent, formatSeconds } from '@shared/utils/format';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
] as const;

const slugToTitle = (slug: string): string =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// ─── Small building blocks ─────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string; // tailwind color stem, e.g. 'purple'
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-9 h-9 rounded-lg bg-${accent}-100 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4.5 h-4.5 text-${accent}-600`} />
      </div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="mb-4">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-xs text-gray-400 text-center py-8">{message}</p>
);

/** Horizontal ranked bar — used for top articles / popular search terms so the
 * relative sizes are visible at a glance without pulling in a chart library. */
const RankedBar: React.FC<{ label: string; value: number; maxValue: number; accent: string }> = ({
  label,
  value,
  maxValue,
  accent,
}) => {
  const pct = maxValue > 0 ? Math.max(4, Math.round((value / maxValue) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700 truncate pr-2">{label}</span>
        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-${accent}-500 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const ArticleAnalyticsPage: React.FC = () => {
  document.title = 'Article Analytics - MGLTickets Admin';

  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<ArticlesOverview | null>(null);
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [needingImprovement, setNeedingImprovement] = useState<ArticleImprovementCandidate[]>([]);
  const [popularTerms, setPopularTerms] = useState<PopularSearchTerm[]>([]);
  const [searchSummary, setSearchSummary] = useState<SearchAnalyticsSummary | null>(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [overviewRes, topRes, improvementRes, termsRes, searchRes] = await Promise.all([
        admin_getArticlesOverview(days),
        admin_getTopArticles(8, days),
        admin_getArticlesNeedingImprovement(0.5),
        admin_getPopularSearchTerms(8, days),
        admin_getSearchSummary(days),
      ]);
      setOverview(overviewRes);
      setTopArticles(topRes);
      setNeedingImprovement(improvementRes);
      setPopularTerms(termsRes);
      setSearchSummary(searchRes);
    } catch {
      setError('Failed to load Help Center analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const maxViews = Math.max(1, ...topArticles.map(a => a.view_count));
  const maxSearches = Math.max(1, ...popularTerms.map(t => t.search_count));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Help Center Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Article views, engagement, feedback, and search behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
            {DAY_RANGES.map(range => (
              <button
                key={range.value}
                onClick={() => setDays(range.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  days === range.value
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Eye} label="Article Views" value={(overview?.total_views ?? 0).toLocaleString()} accent="purple" />
        <StatCard icon={Users} label="Unique Visitors" value={(overview?.total_unique_sessions ?? 0).toLocaleString()} accent="blue" />
        <StatCard icon={Search} label="Searches" value={(overview?.total_searches ?? 0).toLocaleString()} accent="amber" />
        <StatCard icon={ThumbsUp} label="Helpful Rate" value={formatPercent(overview?.helpful_rate ?? null)} accent="emerald" />
        <StatCard icon={Clock} label="Avg. Time on Page" value={formatSeconds(overview?.avg_engagement_seconds ?? null)} accent="cyan" />
        <StatCard icon={AlertTriangle} label="Needs Improvement" value={(overview?.articles_needing_improvement ?? 0).toLocaleString()} accent="red" />
      </div>

      {/* Top articles + needing improvement */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Most Viewed Articles" subtitle={`Last ${days} days, ranked by views`}>
          {topArticles.length === 0 ? (
            <EmptyState message="No article views recorded in this period yet." />
          ) : (
            <div className="space-y-3">
              {topArticles.map(article => (
                <RankedBar
                  key={article.article_slug}
                  label={slugToTitle(article.article_slug)}
                  value={article.view_count}
                  maxValue={maxViews}
                  accent="purple"
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Articles Needing Improvement" subtitle="Helpfulness rate below 50%, all-time">
          {needingImprovement.length === 0 ? (
            <EmptyState message="No articles are currently flagged — nice work." />
          ) : (
            <div className="divide-y divide-gray-50">
              {needingImprovement.map(article => (
                <div key={article.article_slug} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-medium text-gray-800 truncate">{slugToTitle(article.article_slug)}</p>
                    <p className="text-[11px] text-gray-400">{article.total_feedback} feedback submissions</p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                    {formatPercent(article.helpful_rate)} helpful
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Search insights */}
      <SectionCard title="Search Performance" subtitle={`Last ${days} days`}>
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-[11px] text-gray-400 mb-1">Total Searches</p>
            <p className="text-lg font-bold text-gray-900">{(searchSummary?.total_searches ?? 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-1">Click-Through Rate</p>
            <p className="text-lg font-bold text-gray-900">{formatPercent(searchSummary?.click_through_rate ?? null)}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-1">Avg. Time to Click</p>
            <p className="text-lg font-bold text-gray-900">{formatSeconds(searchSummary?.avg_time_to_click ?? null)}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-1">Searches with No Clicks</p>
            <p className="text-lg font-bold text-gray-900">{(searchSummary?.searches_with_no_clicks ?? 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-xs font-semibold text-gray-600">Popular Search Terms</p>
          </div>
          {popularTerms.length === 0 ? (
            <EmptyState message="No searches recorded in this period yet." />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="px-2 py-2 font-medium">Query</th>
                    <th className="px-2 py-2 font-medium">Searches</th>
                    <th className="px-2 py-2 font-medium">Avg. Results</th>
                    <th className="px-2 py-2 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <MousePointerClick className="w-3 h-3" /> CTR
                      </span>
                    </th>
                    <th className="px-2 py-2 font-medium">Top Clicked Article</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {popularTerms.map(term => (
                    <tr key={term.query}>
                      <td className="px-2 py-2.5 font-medium text-gray-800">{term.query}</td>
                      <td className="px-2 py-2.5 text-gray-600">{term.search_count}</td>
                      <td className="px-2 py-2.5 text-gray-600">{term.avg_results.toFixed(1)}</td>
                      <td className="px-2 py-2.5 text-gray-600">{formatPercent(term.click_through_rate)}</td>
                      <td className="px-2 py-2.5 text-gray-500">
                        {term.most_clicked_article ? slugToTitle(term.most_clicked_article) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Reference bars for the same data, for a quicker at-a-glance read */}
          {popularTerms.length > 0 && (
            <div className="mt-5 space-y-3">
              {popularTerms.slice(0, 5).map(term => (
                <RankedBar
                  key={`bar-${term.query}`}
                  label={term.query}
                  value={term.search_count}
                  maxValue={maxSearches}
                  accent="amber"
                />
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default ArticleAnalyticsPage;