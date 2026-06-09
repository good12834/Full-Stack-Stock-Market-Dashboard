import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Transactions = ({ transactions = [] }) => {
  const [filter, setFilter] = useState('ALL');

  const filteredTxs = useMemo(() => {
    let list = transactions?.length ? [...transactions] : [];
    if (!list.length) {
      // Generate mock transactions for demo
      const mock = [];
      const symbols = ['AAPL', 'BTC', 'ETH', 'TSLA', 'NVDA', 'GOOGL', 'MSFT'];
      const now = Date.now();
      for (let i = 0; i < 10; i++) {
        const isBuy = Math.random() > 0.4;
        const sym = symbols[Math.floor(Math.random() * symbols.length)];
        const price = Math.random() * 500 + 50;
        const qty = Math.random() * 10 + 0.1;
        mock.push({
          type: isBuy ? 'BUY' : 'SELL',
          symbol: sym,
          quantity: qty,
          price,
          total: price * qty,
          date: new Date(now - i * Math.random() * 24 * 60 * 60 * 1000),
        });
      }
      list = mock;
    }

    if (filter !== 'ALL') {
      list = list.filter(t => t.type === filter);
    }

    return list.slice(0, 20);
  }, [transactions, filter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-4 lg:p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
              <p className="text-[10px] text-white/40">Your trading activity</p>
            </div>
          </div>
          <div className="seg">
            {['ALL', 'BUY', 'SELL'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={filter === f ? 'active' : ''}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTxs.length === 0 ? (
        <div className="p-8 text-center">
          <Clock className="w-10 h-10 mx-auto text-white/20 mb-3" />
          <p className="text-sm text-white/40">No transactions yet</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {filteredTxs.map((tx, i) => {
            const isBuy = tx.type === 'BUY';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 lg:p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isBuy ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {isBuy
                      ? <ArrowDownRight className={`w-4 h-4 text-green-400`} />
                      : <ArrowUpRight className={`w-4 h-4 text-red-400`} />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{tx.symbol}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isBuy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      {tx.quantity?.toFixed(4)} @ {formatCurrency(tx.price)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                    {isBuy ? '-' : '+'}{formatCurrency(tx.total)}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {formatDate(tx.date, { withTime: true })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Transactions;