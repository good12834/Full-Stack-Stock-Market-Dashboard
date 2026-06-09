import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Activity,
  Zap,
  Mail,
  Smartphone,
  Globe,
  BellRing,
  MessageCircle,
  Check,
  X,
  AlertCircle,
  Info,
} from 'lucide-react';

const ASSET_TYPE_OPTIONS = [
  { value: 'stock', label: 'Stock' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'forex', label: 'Forex' },
  { value: 'index', label: 'Index' },
];

const CONDITION_OPTIONS = [
  { value: 'above', label: 'Price Above', icon: TrendingUp, color: 'text-green-500' },
  { value: 'below', label: 'Price Below', icon: TrendingDown, color: 'text-red-500' },
  { value: 'percent_change', label: '% Change', icon: Percent, color: 'text-blue-500' },
  { value: 'volume_spike', label: 'Volume Spike', icon: Activity, color: 'text-purple-500' },
  { value: 'rsi', label: 'RSI Alert', icon: Zap, color: 'text-amber-500' },
];

const NOTIFICATION_OPTIONS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'push', label: 'Push', icon: BellRing },
  { value: 'sms', label: 'SMS', icon: Smartphone },
  { value: 'browser', label: 'Browser', icon: Globe },
  { value: 'telegram', label: 'Telegram', icon: MessageCircle },
];

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Once' },
  { value: 'every_5_minutes', label: 'Every 5 min' },
  { value: 'every_15_minutes', label: 'Every 15 min' },
  { value: 'every_hour', label: 'Every hour' },
  { value: 'daily', label: 'Daily' },
];

const POPULAR_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet', type: 'stock' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto' },
];

const CreateAlertForm = ({ onCreateAlert, loading }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    symbol: '',
    assetType: 'stock',
    condition: 'above',
    targetPrice: '',
    targetPercent: '',
    rsiThreshold: '70',
    volumeMultiplier: '2',
    notificationType: ['email'],
    frequency: 'once',
    email: '',
    phone: '',
  });
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  const assetRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (assetRef.current && !assetRef.current.contains(e.target)) {
        setShowAssetDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredAssets = POPULAR_ASSETS.filter(
    (a) =>
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectAsset = (asset) => {
    setForm((prev) => ({
      ...prev,
      symbol: asset.symbol,
      assetType: asset.type,
    }));
    setShowAssetDropdown(false);
    setSearchQuery('');
    setErrors((prev) => ({ ...prev, symbol: null }));
  };

  const toggleNotification = (value) => {
    setForm((prev) => ({
      ...prev,
      notificationType: prev.notificationType.includes(value)
        ? prev.notificationType.filter((v) => v !== value)
        : [...prev.notificationType, value],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.symbol.trim()) newErrors.symbol = 'Asset symbol is required';
    if (['above', 'below'].includes(form.condition) && (!form.targetPrice || isNaN(form.targetPrice))) {
      newErrors.targetPrice = 'Valid target price required';
    }
    if (form.condition === 'percent_change' && (!form.targetPercent || isNaN(form.targetPercent))) {
      newErrors.targetPercent = 'Valid percentage required';
    }
    if (form.notificationType.length === 0) {
      newErrors.notification = 'At least one notification method required';
    }
    if (form.notificationType.includes('email') && !form.email) {
      newErrors.email = 'Email required for email notifications';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const alertData = {
      symbol: form.symbol.toUpperCase().trim(),
      assetSymbol: form.symbol.toUpperCase().trim(),
      assetType: form.assetType,
      condition: form.condition,
      notificationType: form.notificationType,
      frequency: form.frequency,
      email: form.email || undefined,
      phone: form.phone || undefined,
    };

    // Add condition-specific fields
    if (['above', 'below'].includes(form.condition)) {
      alertData.targetPrice = parseFloat(form.targetPrice);
    } else if (form.condition === 'percent_change') {
      alertData.targetPercent = parseFloat(form.targetPercent);
    } else if (form.condition === 'volume_spike') {
      alertData.volumeMultiplier = parseFloat(form.volumeMultiplier);
    } else if (form.condition === 'rsi') {
      alertData.rsiThreshold = parseFloat(form.rsiThreshold);
    }

    await onCreateAlert(alertData);

    // Reset form
    setForm({
      symbol: '',
      assetType: 'stock',
      condition: 'above',
      targetPrice: '',
      targetPercent: '',
      rsiThreshold: '70',
      volumeMultiplier: '2',
      notificationType: ['email'],
      frequency: 'once',
      email: form.email,
      phone: '',
    });
    setStep(1);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl shadow-black/20">
      {/* Header with steps */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Smart Alert</h2>
              <p className="text-xs text-slate-400">Get notified on market movements</p>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s
                    ? 'bg-gradient-to-br from-brand-500 to-blue-500 text-white shadow-lg shadow-brand-500/20'
                    : 'bg-slate-700/50 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 rounded-full transition-all ${
                    step > s ? 'bg-brand-500' : 'bg-slate-700/50'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-500">Asset</span>
          <span className="text-[10px] text-slate-500">Condition</span>
          <span className="text-[10px] text-slate-500">Notify</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Step 1: Select Asset */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label className="block text-sm font-medium text-slate-300">
              Select Asset <span className="text-red-400">*</span>
            </label>

            <div className="relative" ref={assetRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAssetDropdown(true);
                  }}
                  onFocus={() => setShowAssetDropdown(true)}
                  placeholder="Search stocks, crypto..."
                  className={`w-full pl-10 pr-4 py-3 bg-slate-900/70 border ${
                    errors.symbol ? 'border-red-500/50' : 'border-slate-600/50'
                  } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition`}
                />
                {form.symbol && (
                  <button
                    onClick={() => {
                      setForm((prev) => ({ ...prev, symbol: '' }));
                      setErrors((prev) => ({ ...prev, symbol: null }));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {showAssetDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600/50 rounded-xl overflow-hidden shadow-xl z-50">
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setForm((prev) => ({ ...prev, symbol: searchQuery.toUpperCase() }));
                        setShowAssetDropdown(false);
                        setErrors((prev) => ({ ...prev, symbol: null }));
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition text-left border-b border-slate-700/50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/20 to-blue-500/20 flex items-center justify-center">
                        <Search className="w-4 h-4 text-brand-400" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">{searchQuery.toUpperCase()}</span>
                        <span className="text-xs text-slate-500 ml-2">Custom asset</span>
                      </div>
                    </button>
                  )}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredAssets.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => selectAsset(asset)}
                        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition ${
                          form.symbol === asset.symbol ? 'bg-brand-500/10 border-l-2 border-brand-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            asset.type === 'crypto'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {asset.symbol.slice(0, 2)}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-white">{asset.symbol}</div>
                            <div className="text-xs text-slate-500">{asset.name}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          asset.type === 'crypto'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {asset.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errors.symbol && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.symbol}
              </p>
            )}

            <div className="flex gap-2 flex-wrap">
              {POPULAR_ASSETS.slice(0, 6).map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => selectAsset(asset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    form.symbol === asset.symbol
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:border-slate-500/50'
                  }`}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Condition */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label className="block text-sm font-medium text-slate-300">
              Condition <span className="text-red-400">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CONDITION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = form.condition === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setForm((prev) => ({ ...prev, condition: opt.value }))}
                    className={`relative p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500/30 shadow-lg shadow-brand-500/5'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-700/30'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? opt.color : 'text-slate-400'}`} />
                    <div className="text-xs font-medium text-white">{opt.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Condition-specific inputs */}
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-3">
              {['above', 'below'].includes(form.condition) && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Target Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={form.targetPrice}
                      onChange={(e) => setForm((prev) => ({ ...prev, targetPrice: e.target.value }))}
                      placeholder="e.g. 110000"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border ${
                        errors.targetPrice ? 'border-red-500/50' : 'border-slate-600/50'
                      } rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50`}
                    />
                  </div>
                  {errors.targetPrice && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.targetPrice}
                    </p>
                  )}
                </div>
              )}

              {form.condition === 'percent_change' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Target Change (%)
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={form.targetPercent}
                      onChange={(e) => setForm((prev) => ({ ...prev, targetPercent: e.target.value }))}
                      placeholder="e.g. 5 for +5%, -10 for -10%"
                      step="0.1"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border ${
                        errors.targetPercent ? 'border-red-500/50' : 'border-slate-600/50'
                      } rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50`}
                    />
                  </div>
                  {errors.targetPercent && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.targetPercent}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Use positive for gain, negative for drop
                  </p>
                </div>
              )}

              {form.condition === 'volume_spike' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Volume Multiplier (x normal)
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={form.volumeMultiplier}
                      onChange={(e) => setForm((prev) => ({ ...prev, volumeMultiplier: e.target.value }))}
                      placeholder="e.g. 2"
                      step="0.5"
                      min="1"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    2x means volume is 2x the average
                  </p>
                </div>
              )}

              {form.condition === 'rsi' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    RSI Threshold
                  </label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={form.rsiThreshold}
                      onChange={(e) => setForm((prev) => ({ ...prev, rsiThreshold: e.target.value }))}
                      placeholder="70"
                      min="0"
                      max="100"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Above 70 = overbought, Below 30 = oversold
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Alert Frequency
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-600/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  How often to check and re-trigger this alert
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Notification */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label className="block text-sm font-medium text-slate-300">
              Notification Method <span className="text-red-400">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {NOTIFICATION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = form.notificationType.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleNotification(opt.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500/30 shadow-lg shadow-brand-500/5'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1.5 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                    <div className="text-xs font-medium text-white">{opt.label}</div>
                  </button>
                );
              })}
            </div>

            {errors.notification && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.notification}
              </p>
            )}

            <div className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border ${
                      errors.email ? 'border-red-500/50' : 'border-slate-600/50'
                    } rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Phone Number (for SMS)
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 555-123-4567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-brand-500/5 to-blue-500/5 rounded-xl border border-brand-500/10">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-400" />
                Alert Summary
              </h4>
              <div className="space-y-1 text-xs text-slate-400">
                <p>
                  <span className="text-slate-300">Asset:</span> {form.symbol || '—'}
                </p>
                <p>
                  <span className="text-slate-300">Condition:</span>{' '}
                  {CONDITION_OPTIONS.find((c) => c.value === form.condition)?.label || form.condition}
                  {form.targetPrice && ` @ $${parseFloat(form.targetPrice).toLocaleString()}`}
                  {form.targetPercent && ` @ ${form.targetPercent}%`}
                </p>
                <p>
                  <span className="text-slate-300">Notify via:</span>{' '}
                  {form.notificationType.join(', ') || '—'}
                </p>
                <p>
                  <span className="text-slate-300">Frequency:</span>{' '}
                  {FREQUENCY_OPTIONS.find((f) => f.value === form.frequency)?.label}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                onClick={() => setStep((prev) => prev + 1)}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Create Alert
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAlertForm;