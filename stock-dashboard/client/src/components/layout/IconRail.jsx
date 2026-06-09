import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';

// Inline SVG icons (lucide-style stroke icons, smaller and colorable)
const Icon = ({ children, className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    {children}
  </svg>
);

const items = [
  { to: '/', key: 'dashboard', label: 'Dashboard', icon: <Icon><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon> },
  { to: '/crypto', key: 'crypto', label: 'Crypto', icon: <Icon><circle cx="12" cy="12" r="9"/><path d="M9 9h4.5a2 2 0 0 1 0 4H10"/><path d="M15 15H10.5a2 2 0 0 0 0 4H15"/><path d="M12 7v2M12 17v2"/></Icon> },
  { to: '/portfolio', key: 'portfolio', label: 'Portfolio', icon: <Icon><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/></Icon> },
  { to: '/compare', key: 'compare', label: 'Compare', icon: <Icon><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></Icon> },
  { to: '/learn', key: 'learn', label: 'Learn', icon: <Icon><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-8-4-8 4z"/></Icon> },
  { to: '/alerts', key: 'alerts', label: 'Alerts', icon: <Icon><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon> },
  { to: '/news', key: 'news', label: 'News', icon: <Icon><path d="M4 4h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4z"/><path d="M7 8h10M7 12h10M7 16h7"/></Icon> },
];

const bottomItems = [
  { key: 'help', label: 'Help', icon: <Icon><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></Icon> },
  { key: 'settings', label: 'Settings', icon: <Icon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon> },
  { key: 'logout', label: 'Sign out', icon: <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></Icon> },
];

const IconRail = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout, isAuthenticated } = useStore();

  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <aside className="hidden lg:flex flex-col items-center w-[68px] shrink-0 py-5 px-2 gap-1.5">
      {/* Brand mark */}
      <Link
        to="/"
        className="group relative w-11 h-11 mb-4 rounded-2xl glass flex items-center justify-center"
        title="Home"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/30 to-blue-500/10 opacity-80 group-hover:opacity-100 transition" />
        <svg viewBox="0 0 24 24" className="relative w-6 h-6 text-white">
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <path
            d="M3 17l4-4 4 3 4-7 6 8"
            fill="none"
            stroke="url(#logo-grad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {/* Top nav */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full">
        {items.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.key}
              to={item.to}
              title={t(`nav.${item.key}`, item.label)}
              className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                active
                  ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                  : 'text-white/55 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-brand-400 to-blue-400" />}
              {item.icon}
            </Link>
          );
        })}
      </nav>

      {/* Bottom utility buttons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {bottomItems.map((item) => {
          const isLogout = item.key === 'logout';
          return (
            <button
              key={item.key}
              type="button"
              onClick={isLogout && isAuthenticated ? logout : undefined}
              title={item.label}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white/45 hover:text-white hover:bg-white/5 transition-colors"
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default IconRail;
