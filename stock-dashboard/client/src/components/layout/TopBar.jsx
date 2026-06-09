import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Mic, Sun, Moon, Globe, Bell } from 'lucide-react';
import useStore from '../../store/useStore';
import VoiceSearch from '../VoiceSearch';
import { getInitials } from '../../utils/formatters';

const TopBar = ({ onAiToggle, aiOpen }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    toggleDarkMode,
    darkMode,
    logout,
    searchStocks,
    searchResults,
    connected,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const langRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'he', label: 'עברית' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
  ];

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery) searchStocks(searchQuery);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, searchStocks]);

  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchQuery('');
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSelect = (symbol) => {
    setSearchQuery('');
    navigate(`/stock/${symbol}`);
  };

  return (
    <header className="sticky top-0w-full top-0 z-30 px-4 sm:px-2 pt-1 pb-3">
      <div className="glass rounded-2xl flex items-center justify-between gap-3 px-3 sm:px-4 h-14">
        {/* Search */}
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder={t('search.placeholder', 'Search markets, stocks, crypto…')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/35 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceSearch onSearchResult={(q) => setSearchQuery(q)} />
            </div>
          </div>

          {searchQuery && searchResults?.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl py-1 overflow-hidden shadow-glass">
              {searchResults.slice(0, 6).map((s) => (
                <button
                  key={s._id}
                  onClick={() => handleSelect(s._id)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{s._id}</span>
                    <span className="text-xs text-white/45 truncate max-w-[180px]">{s.name}</span>
                  </div>
                  <span className="text-xs text-white/65 tabular-nums">${s.price?.toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5">
          {/* Connection status */}
          <div className="hidden md:flex items-center gap-1.5 mr-1">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-bull-500 animate-pulse' : 'bg-bear-500'}`} />
            <span className="text-[10px] text-white/45 uppercase tracking-wider">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>

          {/* AI assistant */}
          <button
            onClick={onAiToggle}
            title={t('ai.title', 'AI Assistant')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
              aiOpen
                ? 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-400/40'
                : 'text-white/55 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Language */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangMenu((v) => !v)}
              title="Language"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/55 hover:text-white hover:bg-white/5 transition"
            >
              <Globe className="w-4 h-4" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 glass-strong rounded-xl py-1 shadow-glass">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm transition ${
                      i18n.language === lang.code
                        ? 'text-white bg-white/5'
                        : 'text-white/65 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme */}
          <button
            onClick={toggleDarkMode}
            title="Toggle theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/55 hover:text-white hover:bg-white/5 transition"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button
            title="Notifications"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/55 hover:text-white hover:bg-white/5 transition relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-bear-500 rounded-full" />
          </button>

          {/* User */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="ml-1 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br from-brand-500 to-blue-500 ring-2 ring-white/10 hover:ring-white/20 transition"
              >
                {getInitials(user?.username || user?.name || 'U')}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 glass-strong rounded-xl py-1 shadow-glass">
                  <div className="px-3 py-2 border-b border-white/5">
                    <div className="text-xs text-white/45">Signed in as</div>
                    <div className="text-sm font-medium truncate">{user?.username || 'User'}</div>
                  </div>
                  <Link to="/portfolio" onClick={() => setShowUserMenu(false)} className="block px-3 py-1.5 text-sm text-white/75 hover:bg-white/5">
                    Portfolio
                  </Link>
                  <Link to="/alerts" onClick={() => setShowUserMenu(false)} className="block px-3 py-1.5 text-sm text-white/75 hover:bg-white/5">
                    Price Alerts
                  </Link>
                  <Link to="/news" onClick={() => setShowUserMenu(false)} className="block px-3 py-1.5 text-sm text-white/75 hover:bg-white/5">
                    {t('nav.news', 'Market News')}
                  </Link>
                  <Link to="/admin" onClick={() => setShowUserMenu(false)} className="block px-3 py-1.5 text-sm text-white/75 hover:bg-white/5">
                    {t('nav.admin', 'Admin Analytics')}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-bear-500 hover:bg-white/5"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 ml-1">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-blue-500 hover:brightness-110 rounded-lg transition"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
