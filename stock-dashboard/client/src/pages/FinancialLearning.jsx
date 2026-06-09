import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, TrendingUp, BarChart3, Shield, Zap, ChevronRight, Clock, Star, ArrowLeft, ExternalLink } from 'lucide-react';

const TOPICS = [
  {
    id: 'basics',
    titleKey: 'learn.basics',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'blue',
    articles: [
      {
        title: 'What is a Stock?',
        content: `A stock represents a share in the ownership of a company. When you buy a stock, you become a shareholder - meaning you own a tiny piece of that company. 

Companies issue stock to raise money for growth and operations. Stocks are traded on exchanges like the NYSE and NASDAQ.

Key Concepts:
• Shares: Units of ownership in a company
• Dividends: A portion of company profits paid to shareholders
• Market Capitalization: Total value of all outstanding shares (price × shares outstanding)
• Bull Market: A period when stock prices are rising
• Bear Market: A period when stock prices are falling

Why Invest in Stocks? Stocks historically have provided higher returns than other investments over the long term, though with higher risk in the short term.`,
        readingTime: 3,
        level: 'Beginner',
      },
      {
        title: 'How Stock Exchanges Work',
        content: `Stock exchanges are marketplaces where buyers and sellers trade stocks. Think of them as organized auctions for company shares.

Major Exchanges:
• New York Stock Exchange (NYSE): Oldest and largest US exchange
• NASDAQ: Known for technology stocks (AAPL, MSFT, GOOGL)
• London Stock Exchange (LSE): Major European exchange
• Tokyo Stock Exchange (TSE): Largest Asian exchange

How Trading Works:
1. You place an order through your broker
2. The order is sent to the exchange
3. The exchange matches your order with a seller
4. The trade is executed and recorded

Order Types:
• Market Order: Buy/sell immediately at current price
• Limit Order: Buy/sell at a specific price or better
• Stop Order: Triggers a market order when a price is reached`,
        readingTime: 4,
        level: 'Beginner',
      },
      {
        title: 'Understanding Stock Indices',
        content: `Stock market indices track the performance of a group of stocks. They give you a snapshot of how the market is performing.

Major Indices:
• S&P 500: Tracks 500 largest US companies - the most widely followed index
• Dow Jones Industrial Average: Tracks 30 major US companies
• NASDAQ Composite: Tracks all stocks listed on NASDAQ
• Russell 2000: Tracks 2000 small-cap companies

Index funds allow you to invest in an entire index at once, providing instant diversification. Warren Buffett recommends the average investor put money into a low-cost S&P 500 index fund.`,
        readingTime: 3,
        level: 'Beginner',
      },
    ],
  },
  {
    id: 'technical',
    titleKey: 'learn.technical',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'purple',
    articles: [
      {
        title: 'Candlestick Charts',
        content: `Candlestick charts are one of the most popular tools for technical analysis. Each "candle" shows four price points for a specific time period: open, high, low, and close.

A candlestick consists of:
• Body: The range between open and close (filled = bearish, hollow = bullish)
• Upper Wick: The highest price during the period
• Lower Wick: The lowest price during the period

Common Patterns:
• Doji: Open and close are nearly equal - indicates indecision
• Hammer: Small body at top, long lower wick - potential reversal
• Engulfing: A large candle completely covering the previous one - strong momentum shift
• Morning Star: Three-candle pattern indicating potential bullish reversal`,
        readingTime: 5,
        level: 'Intermediate',
      },
      {
        title: 'Support and Resistance',
        content: `Support and resistance are fundamental concepts in technical analysis.

• Support: A price level where a stock tends to stop falling and bounce back up
• Resistance: A price level where a stock tends to stop rising and pull back

Key Principles:
1. When support is broken, it often becomes resistance
2. When resistance is broken, it often becomes support
3. The more times a level is tested, the stronger it becomes
4. Volume confirms breakout significance

Trading Strategies:
• Buy near support, sell near resistance (range trading)
• Wait for confirmation before trading breakouts
• Use multiple timeframes to identify stronger levels`,
        readingTime: 4,
        level: 'Intermediate',
      },
      {
        title: 'Moving Averages',
        content: `Moving averages smooth out price data to help identify trends.

Types:
• Simple Moving Average (SMA): Average price over a specific period
• Exponential Moving Average (EMA): Gives more weight to recent prices

Common Periods:
• 20-day: Short-term trend
• 50-day: Medium-term trend
• 200-day: Long-term trend (key indicator for bull/bear markets)

Golden Cross: When the 50-day MA crosses above the 200-day MA - bullish signal
Death Cross: When the 50-day MA crosses below the 200-day MA - bearish signal

Moving averages work best in trending markets and tend to give false signals in choppy, sideways markets.`,
        readingTime: 4,
        level: 'Intermediate',
      },
    ],
  },
  {
    id: 'fundamental',
    titleKey: 'learn.fundamental',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'green',
    articles: [
      {
        title: 'Financial Statements Explained',
        content: `Every public company must publish financial statements. The three main ones are:

1. Income Statement: Shows revenue, expenses, and profit over time
   • Revenue (Top Line): Money from sales
   • Operating Expenses: Costs of running the business
   • Net Income (Bottom Line): Profit after all expenses

2. Balance Sheet: A snapshot of what the company owns and owes
   • Assets: Cash, inventory, property, investments
   • Liabilities: Debt, accounts payable
   • Shareholders' Equity: Assets minus liabilities (book value)

3. Cash Flow Statement: Tracks actual cash coming in and going out
   • Operating: Cash from core business operations
   • Investing: Cash from buying/selling assets
   • Financing: Cash from debt, equity, dividends`,
        readingTime: 5,
        level: 'Intermediate',
      },
      {
        title: 'Key Valuation Ratios',
        content: `Valuation ratios help determine if a stock is fairly priced.

P/E Ratio (Price-to-Earnings): Stock Price ÷ Earnings Per Share
• High P/E: Market expects high growth
• Low P/E: Stock may be undervalued or company has issues
• Compare with industry average and historical P/E

P/B Ratio (Price-to-Book): Stock Price ÷ Book Value Per Share
• Below 1: Stock trading below its accounting value
• Useful for banks and insurance companies

P/S Ratio (Price-to-Sales): Stock Price ÷ Revenue Per Share
• Good for companies that aren't yet profitable
• Lower is generally better

D/E Ratio (Debt-to-Equity): Total Liabilities ÷ Shareholders' Equity
• Shows how much debt the company uses
• Higher = more risk, but also potential for higher returns

Dividend Yield: Annual Dividend ÷ Stock Price
• Shows return from dividends alone
• Compare with 10-year Treasury yield for context`,
        readingTime: 5,
        level: 'Advanced',
      },
      {
        title: 'Growth vs. Value Investing',
        content: `Two major investment philosophies:

Growth Investing focuses on companies expected to grow faster than average:
• Higher P/E ratios (investors pay for future growth)
• Often reinvest profits rather than pay dividends
• Examples: Tech companies, innovative startups
• Risk: High valuations can fall sharply if growth slows

Value Investing focuses on companies trading below their intrinsic value:
• Lower P/E ratios (the "bargain" approach)
• Often established companies with steady dividends
• Pioneered by Benjamin Graham, popularized by Warren Buffett
• Strategy: Buy when "Mr. Market" is fearful

Many investors combine both approaches or rotate between them depending on market conditions.`,
        readingTime: 4,
        level: 'Intermediate',
      },
    ],
  },
  {
    id: 'risk',
    titleKey: 'learn.risk',
    icon: <Shield className="w-6 h-6" />,
    color: 'orange',
    articles: [
      {
        title: 'Portfolio Diversification',
        content: `"Don't put all your eggs in one basket" is the golden rule of investing.

Diversification spreads risk across different investments so that poor performance in one area doesn't devastate your portfolio.

How to Diversify:
1. Across stocks: Own 15-30+ different companies
2. Across sectors: Don't concentrate in one industry
3. Across regions: Include international stocks
4. Across asset classes: Stocks, bonds, real estate, commodities
5. Across time: Dollar-cost averaging reduces timing risk

The Power of Diversification:
• Reduces portfolio volatility without sacrificing returns
• Protects against company-specific disasters
• Helps during market downturns (bonds often rise when stocks fall)

A simple diversified portfolio might be 60% stocks and 40% bonds, adjusted based on your age and risk tolerance.`,
        readingTime: 4,
        level: 'Beginner',
      },
      {
        title: 'Understanding Risk Management',
        content: `Risk management is about protecting your investment capital.

Key Risk Management Techniques:

1. Position Sizing: Never risk more than 1-2% of your portfolio on a single trade
2. Stop-Loss Orders: Automatically sell if price drops to a certain level
3. Risk/Reward Ratio: Only take trades where potential profit > potential loss
4. Asset Allocation: Match your portfolio to your risk tolerance and time horizon

Risk Tolerance Questionnaire:
• Time Horizon: Longer = more risk capacity
• Financial Situation: Stable = more risk capacity
• Emotional Response: Can you stomach a 30% decline?

Remember: Risk and return are related. Higher potential returns come with higher risk. There's no free lunch in investing.`,
        readingTime: 4,
        level: 'Intermediate',
      },
    ],
  },
  {
    id: 'advanced',
    titleKey: 'learn.advanced',
    icon: <Zap className="w-6 h-6" />,
    color: 'red',
    articles: [
      {
        title: 'Options Trading Basics',
        content: `Options are contracts that give you the right, but not the obligation, to buy or sell a stock at a specific price by a specific date.

Call Option: Right to BUY a stock at the strike price
• You profit when the stock price rises above the strike
• Like a deposit on a house - you control the asset with less capital

Put Option: Right to SELL a stock at the strike price
• You profit when the stock price falls below the strike
• Often used as insurance for a portfolio

Key Terms:
• Strike Price: The price at which you can buy/sell
• Expiration Date: When the option expires
• Premium: The price you pay for the option
• In the Money: Option has intrinsic value
• Out of the Money: Option has no intrinsic value

⚠️ Options are complex and risky. Never trade options without understanding the full risk profile.`,
        readingTime: 6,
        level: 'Advanced',
      },
      {
        title: 'Algorithmic Trading',
        content: `Algorithmic (algo) trading uses computer programs to execute trades based on predefined rules.

Common Strategies:
1. Trend Following: Buy when price crosses above moving average
2. Mean Reversion: Bet that prices will return to their average
3. Arbitrage: Exploit price differences between markets
4. Market Making: Profit from bid-ask spread

Benefits:
• Removes emotional decision-making
• Can execute faster than humans
• Backtesting allows strategy optimization
• Can monitor multiple markets 24/7

Risks:
• Overfitting (strategy works on past but not future data)
• Technical failures (server down, connectivity issues)
• Flash crashes exacerbated by similar algorithms

Retail traders can start with platforms like TradingView (Pine Script) or QuantConnect.`,
        readingTime: 5,
        level: 'Advanced',
      },
    ],
  },
];

const FinancialLearning = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50',
      purple: 'from-purple-500 to-purple-600 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50',
      green: 'from-green-500 to-green-600 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50',
      orange: 'from-orange-500 to-orange-600 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50',
      red: 'from-red-500 to-red-600 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50',
    };
    return colors[color] || colors.blue;
  };

  const getIconBg = (color) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    };
    return colors[color] || colors.blue;
  };

  // Show article detail
  if (selectedArticle && selectedCategory) {
    const category = TOPICS.find((c) => c.id === selectedCategory);
    const article = category?.articles[selectedArticle];
    if (article) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => setSelectedArticle(null)}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {t(category.titleKey)}
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className={`bg-gradient-to-r ${getColorClasses(category.color).split(' ')[0]} p-6`}>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('learn.readingTime', { min: article.readingTime })}</span>
                  <span className="mx-2">•</span>
                  <Star className="w-4 h-4" />
                  <span>{article.level}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{article.title}</h1>
              </div>

              <div className="p-6 sm:p-8">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {article.content.split('\n').map((line, i) => {
                    if (line.startsWith('•')) {
                      return <li key={i} className="text-slate-700 dark:text-slate-300 ml-4 mb-1">{line.substring(2)}</li>;
                    }
                    if (line.match(/^[A-Z][^:]+:/) && !line.startsWith(' ')) {
                      const parts = line.split(':');
                      return (
                        <p key={i} className="font-semibold text-slate-900 dark:text-white mt-4 mb-1">
                          {parts[0]}:<span className="font-normal text-slate-700 dark:text-slate-300">{parts.slice(1).join(':')}</span>
                        </p>
                      );
                    }
                    if (line.startsWith('  ')) {
                      return <p key={i} className="text-slate-600 dark:text-slate-400 ml-4 text-sm">{line.trim()}</p>;
                    }
                    if (line.trim() === '') return <div key={i} className="h-2" />;
                    return <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed">{line}</p>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('learn.title')}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('learn.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('learn.categories')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {TOPICS.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(isActive ? null : category.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  isActive
                    ? `border-${category.color}-300 dark:border-${category.color}-700 bg-${category.color}-50 dark:bg-${category.color}-900/20 shadow-md`
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${getIconBg(category.color)}`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t(category.titleKey)}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {category.articles.length} {category.articles.length === 1 ? 'article' : 'articles'}
                </p>
              </button>
            );
          })}
        </div>

        {/* Articles */}
        {selectedCategory ? (
          <>
            {(() => {
              const category = TOPICS.find((c) => c.id === selectedCategory);
              return (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    {t(category.titleKey)} Articles
                  </p>
                  <div className="space-y-4">
                    {category.articles.map((article, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedArticle(idx)}
                        className="w-full text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {article.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                              {article.content.substring(0, 150)}...
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t('learn.readingTime', { min: article.readingTime })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {article.level}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select a category to start learning
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose from categories above to access our educational content
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialLearning;