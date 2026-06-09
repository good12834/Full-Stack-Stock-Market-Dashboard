import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, RefreshCw, LayoutGrid, List, TrendingUp, TrendingDown } from 'lucide-react';
import MarketOverview from '../components/crypto/MarketOverview';
import CryptoCard from '../components/crypto/CryptoCard';
import CryptoChart from '../components/crypto/CryptoChart';
import MarketTable from '../components/crypto/MarketTable';
import PortfolioTracker from '../components/crypto/PortfolioTracker';
import Watchlist from '../components/crypto/Watchlist';
import AIInsights from '../components/crypto/AIInsights';
import CryptoNews from '../components/crypto/CryptoNews';
import GainersLosers from '../components/crypto/GainersLosers';

const Crypto = () => {
  const { t } = useTranslation();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [watchlist, setWatchlist] = useState(['BTC', 'ETH', 'SOL']);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'gainers' | 'losers'

  const fetchCryptoData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crypto');
      const json = await res.json();
      if (json.success && json.data) {
        setCoins(json.data);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error('Failed to fetch crypto data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  const handleToggleWatch = (symbol) => {
    setWatchlist(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const filteredCoins = coins.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topCoins = coins.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#05070d] dark:to-ink-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 dark:border-white/5 bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">
                  Cryptocurrency
                </h1>
                <p className="text-[10px] text-slate-400">Real-time crypto market data</p>
              </div>
              {/* Tabs */}
              <div className="hidden md:flex items-center gap-1 ml-6 bg-slate-100 dark:bg-ink-800 rounded-lg p-0.5">
                {[
                  { key: 'all', label: 'All Coins' },
                  { key: 'gainers', label: 'Gainers' },
                  { key: 'losers', label: 'Losers' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeTab === tab.key
                        ? 'bg-white dark:bg-ink-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search coins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-ink-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                />
              </div>
              {/* View toggle */}
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-ink-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white dark:bg-ink-700 text-brand-400 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'table' ? 'bg-white dark:bg-ink-700 text-brand-400 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={fetchCryptoData}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Market Overview */}
        <MarketOverview />

        {/* Loading State */}
        {loading && coins.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-ink-700/50 border border-white/10 dark:border-white/5 rounded-xl p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && coins.length === 0 && (
          <div className="bg-white dark:bg-ink-700/50 border border-red-500/20 rounded-xl p-8 text-center">
            <TrendingDown className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Failed to Load Data</h3>
            <p className="text-sm text-slate-400 mb-4">{error}</p>
            <button
              onClick={fetchCryptoData}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Featured Crypto Cards */}
        {coins.length > 0 && viewMode === 'grid' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(activeTab === 'all' ? filteredCoins : 
                activeTab === 'gainers' ? [...filteredCoins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)) :
                [...filteredCoins].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
              ).slice(0, 8).map(coin => (
                <CryptoCard
                  key={coin.symbol}
                  coin={coin}
                  onToggleWatch={handleToggleWatch}
                  isWatched={watchlist.includes(coin.symbol)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Market Table View */}
        {coins.length > 0 && viewMode === 'table' && (
          <MarketTable
            coins={activeTab === 'all' ? filteredCoins :
              activeTab === 'gainers' ? [...filteredCoins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)) :
              [...filteredCoins].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
            }
            onToggleWatch={handleToggleWatch}
            watchlist={watchlist}
          />
        )}

        {/* Side by Side: Chart + Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Chart Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Live Chart */}
            <CryptoChart
              coinId="bitcoin"
              coinName="Bitcoin"
              coinSymbol="BTC"
            />

            {/* Gainers & Losers */}
            <GainersLosers coins={coins} />

            {/* All Coins Grid (if not already shown) */}
            {viewMode === 'grid' && filteredCoins.length > 8 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">All Coins</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCoins.slice(8).map(coin => (
                    <CryptoCard
                      key={coin.symbol}
                      coin={coin}
                      onToggleWatch={handleToggleWatch}
                      isWatched={watchlist.includes(coin.symbol)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <Watchlist
              coins={coins}
              watchlist={watchlist}
              onToggleWatch={handleToggleWatch}
              allCoins={coins}
            />

            <PortfolioTracker coins={coins} />

            <AIInsights coins={coins} />

            <CryptoNews />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crypto;