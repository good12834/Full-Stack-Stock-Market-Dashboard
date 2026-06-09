import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  AlertCircle,
  Bookmark,
  Share2,
} from 'lucide-react';
import { finnhubAPI } from '../utils/api';

// Available news categories offered by Finnhub's /news endpoint.
const CATEGORIES = [
  { key: 'general', labelKey: 'news.categories.general' },
  { key: 'forex', labelKey: 'news.categories.forex' },
  { key: 'crypto', labelKey: 'news.categories.crypto' },
  { key: 'merger', labelKey: 'news.categories.merger' },
];

// Lightweight curated feed used as a fallback when the Finnhub API is
// not configured or returns no data (free-tier / missing key).
const FALLBACK_NEWS = {
  general: [
    {
      id: 'fb-1',
      headline: 'Tech stocks rally as markets rebound on strong earnings',
      summary:
        'Major technology companies posted better-than-expected quarterly results, lifting broader market sentiment and pushing the Nasdaq to a fresh high.',
      source: 'Market Wire',
      url: '#',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=60',
      category: 'general',
      datetime: Math.floor(Date.now() / 1000) - 60 * 25,
      related: 'AAPL,MSFT,NVDA',
    },
    {
      id: 'fb-2',
      headline: 'Federal Reserve signals patience on rate cuts',
      summary:
        'Policymakers indicated they want more evidence that inflation is moving sustainably toward the 2% target before adjusting the policy rate.',
      source: 'Reuters',
      url: '#',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=60',
      category: 'general',
      datetime: Math.floor(Date.now() / 1000) - 60 * 95,
      related: 'SPY,QQQ',
    },
    {
      id: 'fb-3',
      headline: 'Oil prices climb on supply concerns',
      summary:
        'Crude futures rose more than 1% after OPEC+ hinted at extending voluntary production cuts into the next quarter.',
      source: 'Bloomberg',
      url: '#',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=60',
      category: 'general',
      datetime: Math.floor(Date.now() / 1000) - 60 * 60 * 3,
      related: 'XOM,CVX',
    },
    {
      id: 'fb-4',
      headline: 'Retail sales beat expectations in latest report',
      summary:
        'Consumer spending remained resilient last month, suggesting the economy is on firmer footing heading into the holiday season.',
      source: 'CNBC',
      url: '#',
      image: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=60',
      category: 'general',
      datetime: Math.floor(Date.now() / 1000) - 60 * 60 * 5,
      related: 'WMT,AMZN,TGT',
    },
  ],
  forex: [
    {
      id: 'fx-1',
      headline: 'Dollar weakens as traders price in slower tightening',
      summary:
        'The US dollar index slipped to a multi-week low as traders dialed back expectations for further policy tightening.',
      source: 'FX Empire',
      url: '#',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=60',
      category: 'forex',
      datetime: Math.floor(Date.now() / 1000) - 60 * 40,
      related: 'DXY,EURUSD',
    },
    {
      id: 'fx-2',
      headline: 'Euro steadies ahead of ECB commentary',
      summary:
        'The euro held recent gains as investors awaited commentary from European Central Bank officials for fresh cues.',
      source: 'Reuters',
      url: '#',
      image: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=60',
      category: 'forex',
      datetime: Math.floor(Date.now() / 1000) - 60 * 60 * 2,
      related: 'EURUSD',
    },
  ],
  crypto: [
    {
      id: 'cr-1',
      headline: 'Bitcoin holds near key resistance level',
      summary:
        'BTC continues to consolidate below a major resistance zone as institutional inflows remain steady.',
      source: 'CoinDesk',
      url: '#',
      image: 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=800&q=60',
      category: 'crypto',
      datetime: Math.floor(Date.now() / 1000) - 60 * 18,
      related: 'BTC-USD',
    },
    {
      id: 'cr-2',
      headline: 'Ethereum upgrade draws developer interest',
      summary:
        'The latest network upgrade introduced optimizations that have already begun to be adopted by major dApps.',
      source: 'The Block',
      url: '#',
      image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=60',
      category: 'crypto',
      datetime: Math.floor(Date.now() / 1000) - 60 * 60 * 4,
      related: 'ETH-USD',
    },
  ],
  merger: [
    {
      id: 'mg-1',
      headline: 'Major tech merger clears regulatory hurdle',
      summary:
        'Regulators approved a long-awaited acquisition, paving the way for the deal to close in the coming months.',
      source: 'WSJ',
      url: '#',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=60',
      category: 'merger',
      datetime: Math.floor(Date.now() / 1000) - 60 * 50,
      related: 'M&A',
    },
  ],
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - timestamp);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return new Date(timestamp * 1000).toLocaleDateString();
};

const isBookmarked = (bookmarks, id) => bookmarks.some((b) => b.id === id);

const SentimentBadge = ({ value, t }) => {
  if (value === undefined || value === null) return null;
  if (value > 0.2) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        <TrendingUp className="w-3 h-3" /> {t('news.bullish', 'Bullish')}
      </span>
    );
  }
  if (value < -0.2) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
        <TrendingDown className="w-3 h-3" /> {t('news.bearish', 'Bearish')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
      {t('news.neutral', 'Neutral')}
    </span>
  );
};

const RelatedTickers = ({ related }) => {
  if (!related) return null;
  const tickers = String(related)
    .split(/[,\s;]+/)
    .filter((t) => t && t.length <= 8)
    .slice(0, 4);
  if (tickers.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tickers.map((t) => (
        <Link
          key={t}
          to={`/stock/${t}`}
          className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {t}
        </Link>
      ))}
    </div>
  );
};

const FeaturedArticle = ({ article, bookmarked, onBookmark, onShare, t }) => {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-56 md:h-full min-h-[14rem] overflow-hidden bg-gradient-to-br from-rose-500/20 to-orange-500/20">
          {article.image ? (
            <img
              src={article.image}
              alt={article.headline}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-rose-500 text-white">
              {t('news.featured', 'Featured')}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              {article.source || t('news.unknownSource', 'News')}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTimeAgo(article.datetime)}
            </span>
            <SentimentBadge value={article.sentiment} t={t} />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
            {article.headline}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
            {article.summary}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <RelatedTickers related={article.related} />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onBookmark(article)}
                title={bookmarked ? t('news.unbookmark', 'Remove bookmark') : t('news.bookmark', 'Bookmark')}
                className={`p-2 rounded-lg transition-colors ${
                  bookmarked
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => onShare(article)}
                title={t('news.share', 'Share')}
                className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {article.url && article.url !== '#' && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                >
                  {t('news.readMore', 'Read')} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

const ArticleCard = ({ article, bookmarked, onBookmark, onShare, t }) => {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
        {article.image ? (
          <img
            src={article.image}
            alt={article.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onBookmark(article)}
            title={bookmarked ? t('news.unbookmark', 'Remove bookmark') : t('news.bookmark', 'Bookmark')}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
              bookmarked
                ? 'text-amber-500 bg-white/80 dark:bg-slate-900/80'
                : 'text-white bg-black/30 hover:bg-black/50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate">
            {article.source || t('news.unknownSource', 'News')}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" /> {formatTimeAgo(article.datetime)}
          </span>
          <SentimentBadge value={article.sentiment} t={t} />
        </div>

        <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.headline}
        </h3>
        {article.summary && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <RelatedTickers related={article.related} />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onShare(article)}
              title={t('news.share', 'Share')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {article.url && article.url !== '#' && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={t('news.open', 'Open article')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const MarketNews = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState('general');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
    } catch (e) {
      return [];
    }
  });

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await finnhubAPI.getMarketNews(category, 0);
      const data = res?.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        setNews(data);
        setUsingFallback(false);
      } else {
        setNews(FALLBACK_NEWS[category] || FALLBACK_NEWS.general);
        setUsingFallback(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setNews(FALLBACK_NEWS[category] || FALLBACK_NEWS.general);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    localStorage.setItem('bookmarkedNews', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (article) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.id === article.id);
      if (exists) return prev.filter((b) => b.id !== article.id);
      return [{ ...article, bookmarkedAt: new Date().toISOString() }, ...prev];
    });
  };

  const handleShare = async (article) => {
    const shareData = {
      title: article.headline,
      text: article.summary,
      url: article.url || window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        /* user cancelled */
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(
          `${article.headline} - ${article.url || window.location.href}`
        );
      } catch (e) {
        /* ignore */
      }
    }
  };

  const filteredNews = useMemo(() => {
    if (!searchQuery) return news;
    const q = searchQuery.toLowerCase();
    return news.filter(
      (n) =>
        (n.headline || '').toLowerCase().includes(q) ||
        (n.summary || '').toLowerCase().includes(q) ||
        (n.source || '').toLowerCase().includes(q) ||
        (n.related || '').toLowerCase().includes(q)
    );
  }, [news, searchQuery]);

  const featured = filteredNews[0];
  const rest = filteredNews.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t('news.title', 'Market News')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('news.subtitle', 'Real-time financial news from global markets')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('news.search', 'Search news…')}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={fetchNews}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"
                title={t('common.refresh', 'Refresh')}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === c.key
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t(c.labelKey, c.key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {usingFallback && !loading && (
          <div className="mb-4 rounded-lg border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {t(
                'news.usingFallback',
                'Showing curated headlines. Configure FINNHUB_API_KEY on the server to enable live market news.'
              )}
            </span>
          </div>
        )}

        {error && !usingFallback && (
          <div className="mb-4 rounded-lg border border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading && news.length === 0 ? (
          <div className="space-y-4">
            <div className="h-64 rounded-2xl bg-slate-200/60 dark:bg-slate-700/40 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-xl bg-slate-200/60 dark:bg-slate-700/40 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {t('news.noResults', 'No articles match your search.')}
            </p>
          </div>
        ) : (
          <>
            {featured && (
              <FeaturedArticle
                article={featured}
                bookmarked={isBookmarked(bookmarks, featured.id)}
                onBookmark={toggleBookmark}
                onShare={handleShare}
                t={t}
              />
            )}

            {rest.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((article) => (
                  <ArticleCard
                    key={article.id || article.url || article.headline}
                    article={article}
                    bookmarked={isBookmarked(bookmarks, article.id)}
                    onBookmark={toggleBookmark}
                    onShare={handleShare}
                    t={t}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketNews;
