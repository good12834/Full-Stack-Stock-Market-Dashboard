import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Search, ArrowUpDown, Layers } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const HoldingsTable = ({ positions = [], loading }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('value');
  const [sortDir, setSortDir] = useState('desc');

  const filteredPositions = useMemo(() => {
    let list = positions?.length ? [...positions] : [];

    if (search) {
      const q = search.toUpperCase();
      list = list.filter(p => p.symbol?.includes(q));
    }

    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'symbol': return dir * (a.symbol || '').localeCompare(b.symbol || '');
        case 'quantity': return dir * ((a.quantity || 0) - (b.quantity || 0));
        case 'value': return dir * ((a.value || 0) - (b.value || 0));
        case 'gain': return dir * ((a.gain || 0) - (b.gain || 0));
        case 'gainPercent': return dir * ((a.gainPercent || 0) - (b.gainPercent || 0));
        default: return dir * ((a.value || 0) - (b.value || 0));
      }
    });

    return list;
  }, [positions, search, sortBy, sortDir]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const SortHeader = ({ field, label, className = '' }) => (
    <th
      className={`px-3 py-3 text-xs font-medium text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 transition-colors ${className}`}
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === field && (
          <ArrowUpDown className={`w-3 h-3 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
        )}
      </div>
    </th>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-4 lg:p-6 border-b border-white/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Holdings</h3>
              <p className="text-[10px] text-white/40">{filteredPositions.length} assets</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white/5 rounded-lg border border-white/5 text-white placeholder-white/30 focus:outline-none focus:border-brand-500/40 w-32 lg:w-40"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredPositions.length === 0 ? (
        <div className="p-8 text-center">
          <Layers className="w-10 h-10 mx-auto text-white/20 mb-3" />
          <p className="text-sm text-white/40">
            {search ? 'No assets match your search' : 'No holdings yet. Start trading to build your portfolio.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <SortHeader field="symbol" label="Asset" className="text-left" />
                <SortHeader field="quantity" label="Quantity" className="text-right" />
                <SortHeader field="value" label="Avg Buy" className="text-right" />
                <SortHeader field="value" label="Current" className="text-right" />
                <SortHeader field="gain" label="Value" className="text-right" />
                <SortHeader field="gainPercent" label="P&L" className="text-right" />
                <SortHeader field="gain" label="Profit/Loss" className="text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPositions.map((p, i) => {
                const isGainPositive = (p.gain || 0) >= 0;
                return (
                  <motion.tr
                    key={p.symbol}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/stock/${p.symbol}`)}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          {p.symbol?.slice(0, 2)}
                        </div>
                        <span className="text-sm font-semibold text-white">{p.symbol}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-white/70 tabular-nums">
                      {p.quantity?.toFixed(4)}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-white/70 tabular-nums">
                      {formatCurrency(p.avgCost)}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-white tabular-nums font-medium">
                      {formatCurrency(p.currentPrice)}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-white tabular-nums font-semibold">
                      {formatCurrency(p.value)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        isGainPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isGainPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(Math.abs(p.gainPercent || 0))}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`text-sm font-semibold tabular-nums ${
                        isGainPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isGainPositive ? '+' : ''}{formatCurrency(p.gain)}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default HoldingsTable;