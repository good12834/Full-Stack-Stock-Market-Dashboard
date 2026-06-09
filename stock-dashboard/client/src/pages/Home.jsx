import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import MarketOverview from '../components/MarketOverview';
import TrendingStocks from '../components/TrendingStocks';
import LiveTicker from '../components/LiveTicker';
import ChartPanel from '../components/dashboard/ChartPanel';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { RefreshCw, Eye, BookOpen, Bell } from 'lucide-react';

const QuickStatCard = ({ label, value, sub, color = 'text-white/90' }) => (
  <div className="glass rounded-2xl p-4 card-glow transition-all">
    <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">{label}</div>
    <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
    {sub && <div className="text-[10px] text-white/35 mt-0.5">{sub}</div>}
  </div>
);

const StockGridCard = ({ stock, onClick }) => {
  const isUp = (stock.changePercent ?? 0) >= 0;
  return (
    <button
      onClick={() => onClick(stock.symbol)}
      className="glass rounded-2xl p-4 text-left hover:scale-[1.01] transition-all duration-200 card-glow group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-white/80 group-hover:text-white">
            {stock.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="text-sm font-bold text-white/90 group-hover:text-white">{stock.symbol}</div>
            <div className="text-[10px] text-white/40 truncate max-w-[80px]">{stock.name || stock.symbol}</div>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-500/12 text-emerald-400' : 'bg-red-500/12 text-red-400'}`}>
          {isUp ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
        </span>
      </div>
      <div className="text-xl font-bold tabular-nums text-white">
        ${stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
      </div>
      <div className={`text-xs mt-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp ? '+' : ''}{stock.change?.toFixed(2) ?? '0.00'} today
      </div>
    </button>
  );
};

const NewsPreview = ({ news = [] }) => {
  const navigate = useNavigate();
  if (!news.length) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/80">Latest News</h2>
          <button onClick={() => navigate('/news')} className="text-[10px] text-brand-300 hover:text-brand-200">View all →</button>
        </div>
        <p className="text-xs text-white/35">No news available</p>
      </div>
    );
  }
  return (
    <div className="glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-white/50" />
          <h2 className="text-sm font-semibold text-white/80">Market News</h2>
        </div>
        <button onClick={() => navigate('/news')} className="text-[10px] text-brand-300 hover:text-brand-200 transition">View all →</button>
      </div>
      <div className="space-y-3">
        {news.slice(0, 4).map((item, i) => (
          <a
            key={item.id || i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <p className="text-xs font-medium text-white/75 group-hover:text-white line-clamp-2 leading-relaxed transition">
              {item.headline || item.title}
            </p>
            <p className="text-[10px] text-white/35 mt-0.5">
              {item.source} · {item.datetime ? format(new Date(item.datetime * 1000), 'MMM d') : ''}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const {
    stocks,
    fetchStocks,
    connectWebSocket,
    disconnectWebSocket,
    fetchWatchlist,
    fetchMarketNews,
    isAuthenticated,
    connected,
    finnhubData,
  } = useStore();

  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await fetchStocks();
        await fetchMarketNews('general');
        if (isAuthenticated) await fetchWatchlist();
        connectWebSocket();
      } finally {
        if (mounted) setInitializing(false);
      }
    })();
    return () => {
      mounted = false;
      disconnectWebSocket();
    };
  }, [isAuthenticated]);

  const livePrice = useMemo(() => {
    if (!stocks?.length) return 65433.5;
    const btc = stocks.find((s) => String(s.symbol).toUpperCase() === 'BTC');
    if (btc?.price) return btc.price;
    return stocks[0]?.price ?? 65433.5;
  }, [stocks]);

  const news = finnhubData?.['news:general'] ?? [];

  const totalMarketCap = useMemo(() => {
    return stocks.reduce((acc, s) => acc + (s.price * 1e9 || 0), 0);
  }, [stocks]);

  const gainersCount = stocks.filter((s) => (s.changePercent ?? 0) > 0).length;

  return (
    <div className="starfield min-h-[calc(100vh-72px)]">
      {/* Live Ticker */}
      <LiveTicker />

      <div className="p-4 sm:p-5 max-w-[1600px] mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold gradient-text">Market Dashboard</h1>
            <p className="text-xs text-white/40 mt-0.5">
              {connected ? '● Live streaming' : '○ Offline snapshot'} ·{' '}
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/alerts')}
              className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white transition"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchStocks()}
              className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <QuickStatCard
            label="Tracked Stocks"
            value={stocks.length}
            sub="Updated live"
          />
          <QuickStatCard
            label="Advancing"
            value={gainersCount}
            sub={`${stocks.length - gainersCount} declining`}
            color="text-emerald-400"
          />
          <QuickStatCard
            label="Market Status"
            value={connected ? 'Open' : 'Closed'}
            sub="NYSE / NASDAQ"
            color={connected ? 'text-emerald-400' : 'text-red-400'}
          />
          <QuickStatCard
            label="Portfolio"
            value={isAuthenticated ? 'View →' : 'Sign in'}
            sub="Track positions"
          />
        </div>

        {/* Tab navigation */}
        <div className="seg mb-5">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'stocks', label: 'All Stocks' },
            { key: 'chart', label: 'Live Chart' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={activeTab === t.key ? 'active' : ''}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-12 gap-4">
            {/* Left column */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <MarketOverview liveStocks={stocks} />
              <NewsPreview news={news} />
            </div>

            {/* Center column — main chart */}
            <div className="col-span-12 lg:col-span-6">
              <div className="glass rounded-2xl overflow-hidden animate-slide-up">
                <ChartPanel symbol="BTC/USDT" basePrice={livePrice} />
              </div>
            </div>

            {/* Right column */}
            <div className="col-span-12 lg:col-span-3">
              <TrendingStocks stocks={stocks} />
            </div>
          </div>
        )}

        {/* All Stocks tab */}
        {activeTab === 'stocks' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {stocks.map((stock, i) => (
                <div key={stock.symbol} style={{ animationDelay: `${i * 0.04}s` }} className="animate-slide-up">
                  <StockGridCard stock={stock} onClick={(s) => navigate(`/stock/${s}`)} />
                </div>
              ))}
            </div>
            {initializing && stocks.length === 0 && (
              <div className="flex items-center justify-center h-48">
                <div className="glass px-5 py-3 rounded-xl text-sm text-white/50">Loading market data…</div>
              </div>
            )}
          </div>
        )}

        {/* Live Chart tab */}
        {activeTab === 'chart' && (
          <div className="glass rounded-2xl overflow-hidden">
            <ChartPanel symbol="BTC/USDT" basePrice={livePrice} />
          </div>
        )}
      </div>

      {/* Mobile padding for bottom nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
};

export default Home;
