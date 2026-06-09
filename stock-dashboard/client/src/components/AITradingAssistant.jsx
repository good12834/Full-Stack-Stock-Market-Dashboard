import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Send, User, Sparkles, TrendingUp, LineChart, BarChart3, X, Zap } from 'lucide-react';
import useStore from '../store/useStore';

const AITradingAssistant = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('ai.greeting') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { stocks, fetchFinnhubData } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const analyzeStock = async (symbol) => {
    const cleanSymbol = symbol.toUpperCase().trim();
    
    const [quote, profile, financials, recs, peers, news] = await Promise.all([
      fetchFinnhubData('getQuote', [cleanSymbol]),
      fetchFinnhubData('getProfile2', [cleanSymbol]),
      fetchFinnhubData('getBasicFinancials', [cleanSymbol, 'all']),
      fetchFinnhubData('getRecommendationTrends', [cleanSymbol]),
      fetchFinnhubData('getPeers', [cleanSymbol]),
      fetchFinnhubData('getCompanyNews', [cleanSymbol, 
        new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      ]),
    ]);

    if (!quote) {
      return `I couldn't find data for symbol **${cleanSymbol}**. Please check the symbol and try again.`;
    }

    let analysis = `## 📊 Analysis: ${cleanSymbol}\n\n`;
    
    if (profile) {
      analysis += `**${profile.name}** (${profile.country}) - ${profile.finnhubIndustry || 'N/A'}\n\n`;
    }

    analysis += `### Current Price: **$${quote.c?.toFixed(2) || 'N/A'}**\n`;
    analysis += `- Day Range: $${quote.l?.toFixed(2)} - $${quote.h?.toFixed(2)}\n`;
    analysis += `- Open: $${quote.o?.toFixed(2)}\n`;
    analysis += `- Previous Close: $${quote.pc?.toFixed(2)}\n`;
    analysis += `- Change: **${quote.d?.toFixed(2)} (${quote.dp?.toFixed(2)}%)**\n\n`;

    if (financials?.metric) {
      const m = financials.metric;
      analysis += `### 📈 Key Metrics\n`;
      if (m['52WeekHigh']) analysis += `- 52-Week High: $${m['52WeekHigh']?.toFixed(2)}\n`;
      if (m['52WeekLow']) analysis += `- 52-Week Low: $${m['52WeekLow']?.toFixed(2)}\n`;
      if (m['peTTM']) analysis += `- P/E Ratio (TTM): ${m['peTTM']?.toFixed(2)}\n`;
      if (m['epsTTM']) analysis += `- EPS (TTM): $${m['epsTTM']?.toFixed(2)}\n`;
      if (m['dividendYieldIndicatedAnnual']) analysis += `- Dividend Yield: ${(m['dividendYieldIndicatedAnnual'] * 100)?.toFixed(2)}%\n`;
      if (m['marketCapitalization']) analysis += `- Market Cap: $${(m['marketCapitalization'] / 1e9)?.toFixed(2)}B\n`;
      analysis += '\n';
    }

    if (recs && recs.length > 0) {
      const latest = recs[0];
      analysis += `### 🎯 Analyst Recommendations\n`;
      analysis += `- Strong Buy: ${latest.strongBuy} | Buy: ${latest.buy}\n`;
      analysis += `- Hold: ${latest.hold} | Sell: ${latest.sell} | Strong Sell: ${latest.strongSell}\n`;
      analysis += `- Period: ${latest.period}\n\n`;
    }

    if (peers && peers.length > 0) {
      analysis += `### 👥 Peer Companies\n`;
      analysis += peers.slice(0, 5).join(', ') + '\n\n';
    }

    if (news && news.length > 0) {
      analysis += `### 📰 Recent News\n`;
      news.slice(0, 3).forEach((item, i) => {
        analysis += `${i + 1}. [${item.headline?.substring(0, 80)}...](${item.url})\n`;
      });
    }

    return analysis;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      let response;

      // Detect if asking about a stock symbol
      const symbolMatch = userMsg.match(/\b[A-Z]{1,5}\b/g);
      const lowerMsg = userMsg.toLowerCase();

      if (symbolMatch && (lowerMsg.includes('analyze') || lowerMsg.includes('analysis') || lowerMsg.includes('what') || lowerMsg.includes('about') || lowerMsg.includes('tell') || lowerMsg.includes('info'))) {
        response = await analyzeStock(symbolMatch[0]);
      } else if (symbolMatch && (lowerMsg.includes('news') || lowerMsg.includes('headline'))) {
        const newsData = await fetchFinnhubData('getCompanyNews', [
          symbolMatch[0],
          new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0],
        ]);
        if (newsData && newsData.length > 0) {
          response = `### 📰 Latest News for ${symbolMatch[0]}\n\n`;
          newsData.slice(0, 5).forEach((item, i) => {
            response += `${i + 1}. **[${item.headline}](${item.url})**\n`;
            if (item.summary) response += `   ${item.summary.substring(0, 150)}...\n`;
            response += `   *${new Date(item.datetime * 1000).toLocaleDateString()}*\n\n`;
          });
        } else {
          response = `No recent news found for ${symbolMatch[0]}.`;
        }
      } else if (symbolMatch && (lowerMsg.includes('compare') || lowerMsg.includes('vs'))) {
        if (symbolMatch.length >= 2) {
          const [sym1, sym2] = symbolMatch;
          const [q1, q2] = await Promise.all([
            fetchFinnhubData('getQuote', [sym1]),
            fetchFinnhubData('getQuote', [sym2]),
          ]);
          if (q1 && q2) {
            response = `### 🔄 Comparison: ${sym1} vs ${sym2}\n\n`;
            response += `| Metric | ${sym1} | ${sym2} |\n|--------|--------|--------|\n`;
            response += `| Price | $${q1.c?.toFixed(2)} | $${q2.c?.toFixed(2)} |\n`;
            response += `| Change | ${q1.dp?.toFixed(2)}% | ${q2.dp?.toFixed(2)}% |\n`;
            response += `| High | $${q1.h?.toFixed(2)} | $${q2.h?.toFixed(2)} |\n`;
            response += `| Low | $${q1.l?.toFixed(2)} | $${q2.l?.toFixed(2)} |\n`;
            response += `| Open | $${q1.o?.toFixed(2)} | $${q2.o?.toFixed(2)} |\n`;
            response += `| Prev Close | $${q1.pc?.toFixed(2)} | $${q2.pc?.toFixed(2)} |\n`;
          } else {
            response = `Could not fetch comparison data for one or both symbols.`;
          }
        } else {
          response = `Please provide two stock symbols to compare (e.g., "Compare AAPL and MSFT").`;
        }
      } else if (symbolMatch && (lowerMsg.includes('financial') || lowerMsg.includes('metric') || lowerMsg.includes('fundamental'))) {
        const finData = await fetchFinnhubData('getBasicFinancials', [symbolMatch[0], 'all']);
        if (finData?.metric) {
          const m = finData.metric;
          response = `### 📊 Financial Metrics for ${symbolMatch[0]}\n\n`;
          const metrics = [
            ['Market Capitalization', m.marketCapitalization, (v) => `$${(v / 1e9).toFixed(2)}B`],
            ['P/E Ratio (TTM)', m.peTTM],
            ['EPS (TTM)', m.epsTTM, (v) => `$${v.toFixed(2)}`],
            ['Dividend Yield', m.dividendYieldIndicatedAnnual, (v) => `${(v * 100).toFixed(2)}%`],
            ['52-Week High', m['52WeekHigh'], (v) => `$${v.toFixed(2)}`],
            ['52-Week Low', m['52WeekLow'], (v) => `$${v.toFixed(2)}`],
            ['Beta', m.beta],
            ['ROE', m.roeQuarterly, (v) => `${(v * 100).toFixed(2)}%`],
            ['ROA', m.roaQuarterly, (v) => `${(v * 100).toFixed(2)}%`],
            ['Revenue/Share (TTM)', m.revenuePerShareTTM, (v) => `$${v.toFixed(2)}`],
          ];
          metrics.forEach(([label, value, format]) => {
            if (value) {
              response += `- **${label}**: ${format ? format(value) : value.toFixed(2)}\n`;
            }
          });
        } else {
          response = `No financial data available for ${symbolMatch[0]}.`;
        }
      } else {
        // General response
        response = `I can help you analyze stocks, get news, compare companies, and view financial metrics. Try:\n\n`;
        response += `- 📊 "Analyze AAPL"\n`;
        response += `- 📰 "News for MSFT"\n`;
        response += `- 🔄 "Compare AAPL and GOOGL"\n`;
        response += `- 📈 "Financials for TSLA"`;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ ${t('ai.error')}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{t('ai.title')}</h3>
              <p className="text-xs text-blue-200">Powered by Finnhub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-100 dark:bg-blue-900/50'
                    : 'bg-purple-100 dark:bg-purple-900/50'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {msg.content.split('\n').map((line, j) => {
                    if (line.startsWith('### ')) {
                      return <p key={j} className="font-bold text-base mt-2 mb-1">{line.replace('### ', '')}</p>;
                    }
                    if (line.startsWith('## ')) {
                      return <p key={j} className="font-bold text-lg mt-3 mb-2">{line.replace('## ', '')}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return <p key={j} className="ml-2 text-slate-600 dark:text-slate-400">{line}</p>;
                    }
                    if (line.startsWith('|')) {
                      return <p key={j} className="font-mono text-xs">{line}</p>;
                    }
                    return <p key={j}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-slate-500 mb-2">{t('ai.suggestions')}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: t('ai.suggestion1'), icon: <TrendingUp className="w-3 h-3" /> },
                { label: t('ai.suggestion2'), icon: <BarChart3 className="w-3 h-3" /> },
                { label: t('ai.suggestion3'), icon: <LineChart className="w-3 h-3" /> },
                { label: t('ai.suggestion4'), icon: <Sparkles className="w-3 h-3" /> },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s.label)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai.placeholder')}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-xl transition-colors"
            >
              {loading ? (
                <Zap className="w-5 h-5 animate-pulse" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITradingAssistant;