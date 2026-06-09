import React, { useState } from 'react';
import { BellOff, Bell, Filter, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import AlertCard from './AlertCard';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Alerts' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'triggered', label: 'Triggered' },
];

const ActiveAlerts = ({ alerts, onDelete, onToggle, loading }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    // Filter by status
    if (filter === 'active' && alert.isActive === false) return false;
    if (filter === 'paused' && alert.isActive !== false) return false;
    if (filter === 'triggered' && !alert.isTriggered) return false;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const symbol = (alert.assetSymbol || alert.symbol || '').toLowerCase();
      const email = (alert.email || '').toLowerCase();
      if (!symbol.includes(q) && !email.includes(q)) return false;
    }

    return true;
  });

  const activeCount = alerts.filter((a) => a.isActive !== false).length;
  const triggeredCount = alerts.filter((a) => a.isTriggered).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-slate-800/30 rounded-xl border border-slate-700/30 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Active Alerts</h2>
            <p className="text-xs text-slate-400">
              {alerts.length} total · {activeCount} active · {triggeredCount} triggered
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition ${
            showFilters
              ? 'bg-brand-500/10 text-brand-400'
              : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Search + Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900/70 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>

          <div className="flex gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  filter === opt.value
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:border-slate-500/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alert cards */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert._id || alert.id}
              alert={alert}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <BellOff className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-400 mb-1">
            {searchQuery || filter !== 'all'
              ? 'No matching alerts'
              : 'No alerts yet'}
          </h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first alert above to start monitoring the markets'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveAlerts;