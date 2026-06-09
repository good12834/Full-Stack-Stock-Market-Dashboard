import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IconRail from './components/layout/IconRail';
import TopBar from './components/layout/TopBar';
import AITradingAssistant from './components/AITradingAssistant';
import Home from './pages/Home';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Crypto from './pages/Crypto';
import StockComparison from './pages/StockComparison';
import FinancialLearning from './pages/FinancialLearning';
import PriceAlerts from './pages/PriceAlerts';
import MarketNews from './pages/MarketNews';
import AdminAnalytics from './pages/AdminAnalytics';
import Login from './pages/Login';
import Register from './pages/Register';
import useStore from './store/useStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppLayout = ({ children }) => {
  const [aiOpen, setAiOpen] = React.useState(false);
  const { darkMode } = useStore();

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-[#05070d] text-white/90' : 'bg-[#f0f2f8] text-[#1a1d2e]'}`}>
      <IconRail />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onAiToggle={() => setAiOpen(!aiOpen)} aiOpen={aiOpen} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      <AITradingAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />

      {/* AI Assistant FAB */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-br from-brand-500 to-blue-500 hover:brightness-110 text-white rounded-full shadow-glow flex items-center justify-center transition-all"
        title="AI Trading Assistant"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
};

const App = () => {
  const location = useLocation();
  const { fetchStocks } = useStore();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />
        <Route path="/crypto" element={<Crypto />} />
        <Route path="/compare" element={<StockComparison />} />
        <Route path="/learn" element={<FinancialLearning />} />
        <Route path="/alerts" element={<PriceAlerts />} />
        <Route path="/news" element={<MarketNews />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
