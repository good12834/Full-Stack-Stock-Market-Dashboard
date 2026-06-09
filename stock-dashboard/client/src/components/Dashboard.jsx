











import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import StockCard from './StockCard';
import StatCard from './StatCard';
import useStore from '../store/useStore';
import { formatVolume } from '../utils/dashboardUtils';

const Dashboard = () => {
  const { stocks, isAuthenticated, watchlist, loading, error } = useStore();

  // Memoize calculations
  const stats = useMemo(() => {
    const gainers = stocks.filter((s) => s.change >= 0).length;
    const losers = stocks.filter((s) => s.change < 0).length;
    const totalVolume = stocks.reduce((acc, s) => acc + (s.volume || 0), 0);

    return {
      total: stocks.length,
      gainers,
      losers,
      volume: formatVolume(totalVolume),
    };
  }, [stocks]);

  // Separate stocks into watchlist and others
  const { watchlistStocks, otherStocks } = useMemo(() => {
    if (!isAuthenticated) return { watchlistStocks: [], otherStocks: stocks };

    const watchlistSymbols = new Set(watchlist.map((s) => s.symbol));
    return {
      watchlistStocks: stocks.filter((s) => watchlistSymbols.has(s.symbol)),
      otherStocks: stocks.filter((s) => !watchlistSymbols.has(s.symbol)),
    };
  }, [stocks, watchlist, isAuthenticated]);

  if (loading && stocks.length === 0) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Market Overview
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Real-time stock prices and market data
        </p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Stocks"
          value={stats.total}
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label="Gainers"
          value={stats.gainers}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="up"
        />
        <StatCard
          label="Losers"
          value={stats.losers}
          icon={<TrendingDown className="w-5 h-5" />}
          trend="down"
        />
        <StatCard
          label="Total Volume"
          value={stats.volume}
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* Watchlist Section */}
      {isAuthenticated && watchlistStocks.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Watchlist
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {watchlistStocks.length} stocks
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {watchlistStocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </section>
      )}

      {/* All Stocks Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            All Stocks
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {otherStocks.length} stocks available
          </p>
        </div>

        {otherStocks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otherStocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="space-y-2">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
        >
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// Empty State
const EmptyState = () => (
  <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-12 text-center">
    <Activity className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
    <p className="text-slate-600 dark:text-slate-400 font-medium">
      No stocks available
    </p>
    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
      Try refreshing or check back later
    </p>
  </div>
);

// Error State
const ErrorState = ({ message }) => (
  <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
    <div className="flex items-start gap-3">
      <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="font-semibold text-red-900 dark:text-red-300">
          Unable to load stocks
        </h3>
        <p className="text-sm text-red-700 dark:text-red-400 mt-1">{message}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
