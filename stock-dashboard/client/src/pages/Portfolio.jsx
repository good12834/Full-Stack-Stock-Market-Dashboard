import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import useStore from '../store/useStore';
import { portfolioAPI } from '../utils/api';
import {
  PortfolioSummary,
  PortfolioChart,
  AssetAllocation,
  HoldingsTable,
  Transactions,
  PortfolioInsights,
  RiskAnalysis,
  WatchlistSidebar,
} from '../components/portfolio';

const Portfolio = () => {
  const navigate = useNavigate();
  const { portfolio, fetchPortfolio, isAuthenticated, loading, watchlist, stocks } = useStore();
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [extraLoading, setExtraLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch performance history and transactions
  const fetchExtraData = useCallback(async () => {
    try {
      const [perfRes, txRes] = await Promise.allSettled([
        portfolioAPI.getPerformance(),
        portfolioAPI.getTransactions(),
      ]);

      if (perfRes.status === 'fulfilled') {
        setPerformanceHistory(perfRes.value.data.data || []);
      }
      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value.data.data || []);
      }
    } catch (err) {
      // Silently handle - components have mock fallbacks
    } finally {
      setExtraLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchPortfolio();
    fetchExtraData();
  }, [isAuthenticated, fetchPortfolio, fetchExtraData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPortfolio(), fetchExtraData()]);
    setTimeout(() => setRefreshing(false), 500);
  };

  if (!isAuthenticated) {
    return null;
  }

  // Show loading state
  if ((loading && !portfolio) || (extraLoading && !portfolio)) {
    return (
      <div className="min-h-screen bg-[#05070d]">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  const portfolioData = portfolio || {};
  const positions = portfolioData.positions || [];

  return (
    <div className="min-h-screen bg-[#05070d]">
      {/* Main Content Area */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary portfolio={portfolioData} />

        {/* Main Grid Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Left Column - Chart & Holdings */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            {/* Performance Chart */}
            <PortfolioChart performanceHistory={performanceHistory} />

            {/* Asset Allocation & Holdings Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <AssetAllocation positions={positions} />
              <RiskAnalysis positions={positions} totalValue={portfolioData.totalValue} />
            </div>

            {/* Holdings Table */}
            <HoldingsTable positions={positions} loading={loading} />

            {/* Transactions */}
            <Transactions transactions={transactions} />

            {/* AI Portfolio Insights */}
            <PortfolioInsights
              positions={positions}
              totalValue={portfolioData.totalValue}
              availableBalance={portfolioData.availableBalance}
            />
          </div>

          {/* Right Sidebar - Watchlist */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <WatchlistSidebar watchlist={watchlist} stocks={stocks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;