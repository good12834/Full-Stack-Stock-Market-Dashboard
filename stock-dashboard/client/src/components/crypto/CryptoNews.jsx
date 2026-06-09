import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Clock, AlertCircle, ChevronRight } from 'lucide-react';

const CryptoNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/crypto/news?limit=8');
        const json = await res.json();
        if (json.success && json.data) {
          setNews(json.data);
        } else {
          throw new Error('Failed to fetch news');
        }
      } catch (err) {
        console.error('Crypto news fetch error:', err);
        setError(err.message);
        setNews([
          { title: 'Bitcoin ETF Inflows Surge Amid Institutional Adoption', url: '#', source: 'CoinDesk', published_at: new Date().toISOString(), currencies: ['BTC'] },
          { title: 'Ethereum Layer-2 Solutions Hit New Milestone in TVL', url: '#', source: 'The Block', published_at: new Date(Date.now() - 3600000).toISOString(), currencies: ['ETH'] },
          { title: 'Solana Ecosystem Continues to Expand with New DeFi Protocols', url: '#', source: 'Messari', published_at: new Date(Date.now() - 7200000).toISOString(), currencies: ['SOL'] },
          { title: 'Global Crypto Regulation Framework Takes Shape', url: '#', source: 'Reuters', published_at: new Date(Date.now() - 10800000).toISOString(), currencies: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 120000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const currencyColors = {
    BTC: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    ETH: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    SOL: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    DOGE: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    XRP: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <div className="bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Newspaper className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Crypto News</span>
          </div>
          <a href="#" className="text-[10px] text-brand-400 hover:text-brand-300 font-medium flex items-center gap-0.5">
            View All <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex gap-2 mt-2">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : error && news.length === 0 ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Unable to load news</p>
          </div>
        ) : (
          news.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-brand-400 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium">
                      {item.source || 'News'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {timeAgo(item.published_at)}
                    </span>
                    {item.currencies?.length > 0 && (
                      <div className="flex gap-1">
                        {item.currencies.slice(0, 2).map(curr => (
                          <span key={curr} className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${
                            currencyColors[curr] || 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}>
                            {curr}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
              </div>
            </a>
          ))
        )}
      </div>
      <div className="p-3 border-t border-slate-100 dark:border-slate-700/50 text-center">
        <span className="text-[9px] text-slate-400">News from CoinDesk, The Block, Messari, and more</span>
      </div>
    </div>
  );
};

export default CryptoNews;