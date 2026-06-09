# 📈 StockDash — Full-Stack Stock Market Dashboard

A comprehensive, real-time stock market dashboard built with **React 18**, **Express.js**, **MongoDB**, and real-time data streaming via **Socket.io** and **WebSocket**. Track stocks, manage portfolios, monitor crypto markets, set price alerts, and leverage AI-powered trading insights — all in a modern, responsive UI with multi-language support.

---

## ✨ Features

### 📊 Stock Market
- **Real-time Quotes** — Live stock prices via Finnhub API & WebSocket streaming
- **Interactive Charts** — Candlestick, area, line & volume charts powered by Recharts
- **Company Profiles** — Detailed financials, earnings, ESG scores, insider transactions, dividends, splits, and more
- **Stock Comparison** — Side-by-side performance comparison of multiple symbols
- **Technical Indicators** — SMA, RSI, MACD, pattern recognition, support/resistance levels
- **News & Sentiment** — Market news feed with sentiment analysis and social sentiment tracking

### 💼 Portfolio Management
- **Track Holdings** — Add, sell, and manage stock positions with quantity & price data
- **Performance Metrics** — Realized/unrealized P&L, portfolio returns, and historical performance charts
- **Asset Allocation** — Visual breakdown of portfolio composition by sector and asset class
- **Transaction History** — Complete audit trail of all buy/sell activities
- **Risk Analysis** — VaR, beta, Sharpe ratio, and other risk metrics
- **Watchlist** — Monitor your favorite stocks with real-time price updates

### ₿ Cryptocurrency
- Live crypto prices & charts across multiple exchanges
- Portfolio tracker for crypto assets
- AI-powered crypto market insights
- Gainers/losers tables and market overview

### 🔔 Price Alerts
- Create custom price alerts (above/below thresholds)
- Smart alerts with technical condition triggers
- Alert history and analytics dashboard
- Real-time notification via WebSocket push

### 🤖 AI Trading Assistant
- AI-powered market insights and stock predictions
- Conversational interface for natural language queries
- Integrated chat panel accessible from any page

### 🎙️ Voice Search
- Hands-free stock symbol search using voice recognition
- Supports multiple languages

### 🌐 Multi-Language Support (i18n)
- **English**, **French**, **Spanish**, **Hebrew**, **Arabic**
- RTL support for Hebrew and Arabic

### 🛡️ Authentication & Security
- JWT-based authentication with login/register
- Protected routes for portfolio & admin panels
- Password recovery support

### 📱 Responsive Design
- Dark/light theme with glassmorphism UI
- Built with Tailwind CSS and Framer Motion animations
- Mobile-friendly layout with icon rail navigation
- Tabular-nums for clean financial data display

### 🔧 Admin Analytics
- System monitoring dashboard with real-time metrics
- User activity tracking and usage statistics
- API request monitoring and performance timeseries
- Sector performance analysis

---

## 🏗️ Tech Stack

### Frontend (`client/`)
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| Recharts | Financial charting |
| Zustand | State management |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Socket.io-client | Real-time data streaming |
| Lucide React | Icon library |
| React Hot Toast | Notification toasts |
| date-fns | Date formatting |

### Backend (`server/`)
| Technology | Purpose |
|------------|---------|
| Node.js + Express | API server |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | Real-time bidirectional events |
| ws | WebSocket raw connection |
| Redis | Caching layer |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Finnhub API | Market data provider |
| Morgan | HTTP request logging |

### Infrastructure
- **Vite proxy** config forwards `/api`, `/socket.io`, `/ws` to backend
- MongoDB connection with graceful fallback (server runs without DB)

---

## 📁 Project Structure

```
stock-dashboard/
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/               # Admin analytics components
│   │   │   ├── alerts/              # Price alert components
│   │   │   ├── charts/              # Sparkline, mini charts
│   │   │   ├── Charts/              # Candlestick, Line, Volume charts
│   │   │   ├── crypto/              # Crypto market components
│   │   │   ├── dashboard/           # Dashboard panels (Chart, Trade, Positions)
│   │   │   ├── layout/              # IconRail, TopBar
│   │   │   ├── portfolio/           # Portfolio management components
│   │   │   ├── Watchlist/           # Watchlist panel
│   │   │   ├── AITradingAssistant   # AI chat assistant
│   │   │   ├── VoiceSearch          # Voice search component
│   │   │   ├── ErrorBoundary        # Error boundary wrapper
│   │   │   ├── Header, Sidebar      # Navigation components
│   │   │   ├── StockCard            # Stock card component
│   │   │   └── TrendingStocks       # Trending stocks grid
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAlerts.js
│   │   │   ├── useDataHooks.jsx
│   │   │   ├── usePortfolio.js
│   │   │   ├── useStockData.js
│   │   │   └── useWebSocket.js
│   │   ├── i18n/                    # Internationalization
│   │   │   ├── i18n.js
│   │   │   └── locales/             # en, fr, es, he, ar
│   │   ├── pages/                   # Route pages
│   │   │   ├── Home.jsx             # Main dashboard
│   │   │   ├── StockDetail.jsx      # Individual stock view
│   │   │   ├── Portfolio.jsx        # Portfolio management
│   │   │   ├── Crypto.jsx           # Cryptocurrency page
│   │   │   ├── StockComparison.jsx  # Compare stocks
│   │   │   ├── FinancialLearning.jsx# Educational content
│   │   │   ├── PriceAlerts.jsx      # Alert management
│   │   │   ├── MarketNews.jsx       # News feed
│   │   │   ├── AdminAnalytics.jsx   # Admin panel
│   │   │   ├── Login.jsx            # Authentication
│   │   │   └── Register.jsx
│   │   ├── store/                   # Zustand state store
│   │   │   └── useStore.js
│   │   ├── styles/                  # Global CSS
│   │   │   └── globals.css
│   │   ├── utils/                   # Utilities
│   │   │   ├── api.js               # Axios API client with interceptors
│   │   │   ├── formatters.js        # Currency, percent, number formatters
│   │   │   ├── miniChart.js         # Mini chart SVG generator
│   │   │   ├── cryptoImages.js      # Crypto image mappings
│   │   │   ├── calculations.js      # Financial calculations
│   │   │   └── dashboardUtils.js    # Dashboard helpers
│   │   ├── App.jsx                  # Root app with routing
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Base styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js               # Vite config with proxy
│   └── package.json
│
├── server/                          # Express backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── stockController.js
│   │   ├── portfolioController.js
│   │   ├── cryptoController.js
│   │   ├── finnhubController.js
│   │   ├── authController.js
│   │   ├── watchlistController.js
│   │   └── admin/ (implicit in routes)
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication middleware
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Stock.js
│   │   ├── Portfolio.js
│   │   ├── Watchlist.js
│   │   └── Alert.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── stocks.js
│   │   ├── finnhub.js               # Finnhub API proxy routes
│   │   ├── portfolio.js
│   │   ├── watchlist.js
│   │   ├── alerts.js
│   │   ├── crypto.js
│   │   ├── admin.js
│   │   └── ai.js
│   ├── services/
│   │   ├── finnhubClient.js         # Finnhub SDK wrapper
│   │   ├── finnhubService.js        # Finnhub business logic
│   │   ├── stockService.js          # Stock data & seeding
│   │   ├── alertService.js          # Alert monitoring
│   │   ├── cacheService.js          # Redis caching
│   │   ├── wsService.js             # WebSocket (ws library)
│   │   ├── socketService.js         # Socket.io service
│   │   └── stockService.js          # Stock data logic
│   ├── _e2e_test.js                 # End-to-end tests
│   ├── server.js                    # Express app entry point
│   └── package.json
│
├── .env                             # Environment variables
├── .gitignore
└── README.md                        # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas) — optional, server runs without it with degraded features
- **Redis** — optional, used for caching (falls back gracefully)
- **Finnhub API Key** — [Get free key](https://finnhub.io/) (60 req/min)
- **Alpha Vantage API Key** — [Get free key](https://www.alphavantage.co/support/#api-key) (25 req/day)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Copy the example env or edit `.env` in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (optional — server runs without it)
MONGODB_URI=mongodb://localhost:27017/stock-dashboard

# Redis (optional — server runs without it)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d

# Finnhub API (real-time data)
FINNHUB_API_KEY=your_finnhub_api_key

# Alpha Vantage API (daily/end-of-day data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### 3. Start Development

In two separate terminals:

```bash
# Terminal 1 — Start the backend server (from server/)
cd server
npm run dev          # with nodemon
# or
npm start            # without nodemon

# Terminal 2 — Start the frontend dev server (from client/)
cd client
npm run dev
```

The app will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Build for Production

```bash
cd client
npm run build        # Outputs to client/dist/
```

Serve the `client/dist` folder with any static server or configure the backend to serve it.

---

## 🔌 API Endpoints

The backend exposes the following API routes (all prefixed with `/api`):

| Route Group | Base Path | Description |
|-------------|-----------|-------------|
| **Auth** | `/api/auth` | Register, login, profile, forgot password |
| **Stocks** | `/api/stocks` | Stock list, details, history, intraday, search, compare |
| **Finnhub** | `/api/finnhub` | Full Finnhub API proxy (quotes, candles, financials, news, ESG, patterns, crypto, forex, ETFs, etc.) |
| **Portfolio** | `/api/portfolio` | Holdings CRUD, sell, transactions, performance |
| **Watchlist** | `/api/watchlist` | Watchlist CRUD |
| **Alerts** | `/api/alerts` | Price alerts CRUD, history, analytics |
| **Crypto** | `/api/crypto` | Crypto market data |
| **AI** | `/api/ai` | AI-powered insights & predictions |
| **Admin** | `/api/admin/analytics` | System analytics, timeseries, usage stats |
| **Health** | `/api/health` | Server health check |

### Real-Time Channels

| Protocol | URL | Description |
|----------|-----|-------------|
| Socket.io | `/socket.io` | Bidirectional real-time events (price updates, alerts, notifications) |
| WebSocket | `/ws` | Raw WebSocket connection for streaming market data |

---

## 🧩 Key Architecture Decisions

- **Monorepo structure** with separate `client/` and `server/` directories
- **Vite proxy** forwards API and WebSocket requests to the backend — no CORS issues during development
- **Graceful degradation** — MongoDB and Redis are optional; the server runs with reduced functionality without them
- **Modular service layer** — Finnhub, caching, WebSocket, and alert services are cleanly separated from controllers
- **Zustand** for lightweight state management instead of Redux
- **Recharts** for charting (declarative, composable, React-native)
- **Framer Motion** for smooth page transitions and micro-interactions
- **Glassmorphism UI** with Tailwind CSS for a modern financial dashboard aesthetic
- **Multi-language** i18n with RTL support for Arabic & Hebrew

---

## 🔧 Available Scripts

### Server
| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (hot reload) |

### Client
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run build` | Production build to `client/dist/` |
| `npm run preview` | Preview production build |

---

## 🗺️ Roadmap / Potential Enhancements

- [ ] Real stock trading simulation with paper trading
- [ ] More technical indicators & backtesting engine
- [ ] Social features — shared watchlists, community insights
- [ ] Mobile app (React Native)
- [ ] Email/SMS alert notifications
- [ ] Integration with more data providers (IEX Cloud, Polygon.io)
- [ ] CI/CD pipeline with Docker & GitHub Actions
- [ ] Storybook for component documentation

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 🙏 Acknowledgments

- [Finnhub](https://finnhub.io/) for real-time market data
- [Alpha Vantage](https://www.alphavantage.co/) for daily stock data
- [Clearbit](https://clearbit.com/) for company logo API
- [Lucide](https://lucide.dev/) for beautiful open-source icons
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework