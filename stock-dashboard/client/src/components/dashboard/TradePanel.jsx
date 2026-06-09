import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import useStore from '../../store/useStore';
import { formatCurrency, getInitials } from '../../utils/formatters';

const MOCK_USER = { name: 'Matthew Davis', username: 'matthew' };

const ORDER_TYPES = [
  { key: 'market', label: 'Market' },
  { key: 'limit', label: 'Limit' },
  { key: 'stop', label: 'Stop' },
];

const PCT_BTNS = [0.25, 0.5, 0.75, 1];

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-white/45">{label}</span>
    <span className="text-white/85 tabular-nums">{value}</span>
  </div>
);

const TradePanel = ({ symbol = 'BTC/USDT', price = 65433.5, balance = 1.34 }) => {
  const { user } = useStore();
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('limit');
  const [limitPrice, setLimitPrice] = useState(price.toFixed(2));
  const [amount, setAmount] = useState(price.toFixed(2));
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  useEffect(() => {
    if (orderType === 'limit') setLimitPrice(price.toFixed(2));
  }, [price, orderType]);

  const handlePct = (p) => {
    const usd = balance * (parseFloat(limitPrice) || price) * p;
    setAmount(usd.toFixed(2));
  };

  const orderValue = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const p = parseFloat(limitPrice) || price;
    return a * p;
  }, [amount, limitPrice, price]);

  const fee = useMemo(() => orderValue * 0.001, [orderValue]);

  const displayName = user?.username || user?.name || MOCK_USER.name;
  const baseSymbol = (symbol || '').split('/')[0] || 'BTC';
  const ctaLabel = side === 'buy' ? `Buy/Long ${baseSymbol}` : `Sell/Short ${baseSymbol}`;

  return (
    <section className="glass rounded-2xl p-4 flex flex-col gap-3 h-full">
      {/* User row */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br from-amber-400 to-pink-500 ring-2 ring-white/10">
          {getInitials(displayName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{displayName}</div>
          <div className="text-[10px] text-white/45 tracking-widest">VERIFIED</div>
        </div>
        <button
          className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/65 hover:text-white hover:border-white/15 transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>

      {/* Buy / Sell tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide('buy')}
          className={`py-2 rounded-xl text-sm font-medium transition ${
            side === 'buy'
              ? 'bg-gradient-to-r from-brand-500 to-blue-500 text-white shadow-glow'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Buy/Long
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`py-2 rounded-xl text-sm font-medium transition ${
            side === 'sell'
              ? 'bg-gradient-to-r from-bear-500 to-pink-500 text-white shadow-[0_0_24px_rgba(234,57,67,0.35)]'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Sell/Short
        </button>
      </div>

      {/* Order type */}
      <div className="seg w-fit">
        {ORDER_TYPES.map((o) => (
          <button
            key={o.key}
            onClick={() => setOrderType(o.key)}
            className={orderType === o.key ? 'active' : ''}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Limit price */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="trade-label">Limit price</span>
          <span className="text-[10px] text-white/45">Market ${price.toFixed(2)}</span>
        </div>
        <div className="relative">
          <input
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="trade-input w-full pr-14 tabular-nums"
            inputMode="decimal"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded">
            USDC
          </span>
        </div>
      </div>

      {/* Amount */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="trade-label">Amount</span>
          <span className="text-[10px] text-white/45">Available: {balance} {baseSymbol}</span>
        </div>
        <div className="relative">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="trade-input w-full pr-14 tabular-nums"
            inputMode="decimal"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded">
            USDC
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {PCT_BTNS.map((p) => (
            <button
              key={p}
              onClick={() => handlePct(p)}
              className="py-1.5 rounded-lg bg-white/5 text-[11px] text-white/65 hover:bg-white/10 transition"
            >
              {(p * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>

      {/* TP / SL */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="trade-label">Take profit / Stop loss</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/40" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="TP price"
            className="trade-input w-full placeholder-white/30"
          />
          <input
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="SL price"
            className="trade-input w-full placeholder-white/30"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-1.5 pt-1">
        <Row label="Order value" value={formatCurrency(orderValue, { decimals: 2 })} />
        <Row label="Fee (0.1%)" value={formatCurrency(fee, { decimals: 2 })} />
      </div>

      {/* CTA */}
      <button
        className={`mt-1 w-full py-3 rounded-xl text-sm font-semibold text-white transition ${
          side === 'buy'
            ? 'bg-gradient-to-r from-bull-500 to-bull-400 hover:brightness-110 shadow-[0_8px_24px_-6px_rgba(22,199,132,0.55)]'
            : 'bg-gradient-to-r from-bear-500 to-bear-400 hover:brightness-110 shadow-[0_8px_24px_-6px_rgba(234,57,67,0.55)]'
        }`}
      >
        {ctaLabel}
      </button>
    </section>
  );
};

export default TradePanel;
