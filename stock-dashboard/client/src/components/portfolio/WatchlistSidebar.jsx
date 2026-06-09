import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const WatchlistSidebar = ({ watchlist = [], stocks = [] }) => {
  const navigate = useNavigate();

  const watchlistData = watchlist?.length
    ? watchlist.map(w => {
        const stock = stocks?.find(s => s.symbol === w.symbol) || {};
        return {
          symbol: w.symbol,
          price: stock.price || stock.currentPrice || 0,
          change: stock.change || stock.priceChange || 0,
          changePercent: stock.changePercent || stock.priceChangePercent || 0,
        };
      })
    : [
        { symbol: 'BTC', price: 108234, change: 2340, changePercent: 2.21 },
        { symbol: 'ETH', price: 3456, change: -89, changePercent: -2.51 },
        { symbol: 'AAPL', price: 212.5, change: 3.2, changePercent: 1.53 },
        { symbol: 'NVDA', price: 875.3, change: -12.4, changePercent: -1.4 },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass rounded-xl p-4 lg:p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Watchlist</h3>
        </div>
        <span className="text-[10px] text-white/40">{watchlistData.length} items</span>
      </div>

      <div className="space-y-2">
        {watchlistData.map((item, i) => {
          const isPositive = (item.change || 0) >= 0;
          return (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/stock/${item.symbol}`)}
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
                  {item.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{item.symbol}</p>
                  <p className="text-[9px] text-white/40">Watch</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white tabular-nums">
                  {formatCurrency(item.price, { compact: item.price > 1000 })}
                </p>
                <p className={`text-[9px] font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{formatPercent(item.changePercent || 0)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button className="w-full mt-3 py-2 text-[10px] font-medium text-white/40 hover:text-white/70 transition-colors border border-dashed border-white/10 rounded-lg hover:border-white/20">
        + Add to Watchlist
      </button>
    </motion.div>
  );
};

export default WatchlistSidebar;