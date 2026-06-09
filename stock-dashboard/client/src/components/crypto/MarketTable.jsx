import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Search, ArrowUpDown, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCryptoImage, getFallbackImage } from '../../utils/cryptoImages';

const MarketTable = ({ coins = [], onToggleWatch, watchlist = [] }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('market_cap_rank');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'market_cap_rank' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
    return (
      <ArrowUpDown className={`w-3 h-3 ${sortDir === 'asc' ? 'text-brand-400 rotate-180' : 'text-brand-400'}`} />
    );
  };

  const filtered = useMemo(() => {
    let items = [...coins];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.symbol?.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    return items;
  }, [coins, search, sortField, sortDir]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return '—';
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.001) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
  };

  const formatLarge = (num) => {
    if (!num) return '—';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${(num).toLocaleString()}`;
  };

  const formatVolume = (num) => {
    if (!num) return '—';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${(num).toLocaleString()}`;
  };

  return (
    <div className="bg-white dark:bg-ink-700/50 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-ink-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/50">
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('market_cap_rank')} className="flex items-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-slate-300">
                  # <SortIcon field="market_cap_rank" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-slate-300">
                  Name <SortIcon field="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort('current_price')} className="flex items-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-slate-300 ml-auto">
                  Price <SortIcon field="current_price" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort('price_change_percentage_24h')} className="flex items-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-slate-300 ml-auto">
                  24h <SortIcon field="price_change_percentage_24h" />
                </button>
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-right">
                <button onClick={() => handleSort('market_cap')} className="flex items-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-slate-300 ml-auto">
                  Market Cap <SortIcon field="market_cap" />
                </button>
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-right">
                <button onClick={() => handleSort('total_volume')} className="flex items-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-slate-300 ml-auto">
                  Volume (24h) <SortIcon field="total_volume" />
                </button>
              </th>
              <th className="hidden xl:table-cell px-4 py-3 text-right">
                <button onClick={() => handleSort('circulating_supply')} className="flex items-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-slate-300 ml-auto">
                  Supply <SortIcon field="circulating_supply" />
                </button>
              </th>
              <th className="px-4 py-3 text-center w-12">⭐</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((coin, idx) => {
              const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
              const isWatched = watchlist.includes(coin.symbol);
              const imgSrc = coin.image || getCryptoImage(coin.symbol);

              return (
                <tr
                  key={coin.symbol || idx}
                  className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="px-4 py-3.5 text-xs text-slate-400 font-medium">
                    {coin.market_cap_rank || idx + 1}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={imgSrc}
                        alt=""
                        className="w-7 h-7 rounded-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getFallbackImage(coin.symbol, '8b5cf6', 28);
                        }}
                      />
                      <div>
                        <Link
                          to={`/stock/${coin.symbol}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-brand-400 transition-colors"
                        >
                          {coin.symbol}
                        </Link>
                        <span className="text-xs text-slate-400 ml-1.5 hidden sm:inline">
                          {coin.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-900 dark:text-white">
                    {formatPrice(coin.current_price)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                      isPositive
                        ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                        : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3.5 text-right text-sm text-slate-600 dark:text-slate-300">
                    {formatLarge(coin.market_cap)}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3.5 text-right text-sm text-slate-600 dark:text-slate-300">
                    {formatVolume(coin.total_volume)}
                  </td>
                  <td className="hidden xl:table-cell px-4 py-3.5 text-right text-xs text-slate-500">
                    {coin.circulating_supply
                      ? `${(coin.circulating_supply / 1e6).toFixed(1)}M ${coin.symbol}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => onToggleWatch?.(coin.symbol)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        isWatched ? 'opacity-100' : ''
                      }`}
                    >
                      <Star className={`w-4 h-4 ${
                        isWatched
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-slate-400 hover:text-yellow-500'
                      }`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center">
          <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No coins found</p>
        </div>
      )}
    </div>
  );
};

export default MarketTable;