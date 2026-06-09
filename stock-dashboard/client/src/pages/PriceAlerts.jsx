import React, { useState } from 'react';
import { Bell, BellOff, TrendingUp, Activity, Sparkles, ChevronDown, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAlerts from '../hooks/useAlerts';
import {
  CreateAlertForm,
  ActiveAlerts,
  AlertHistory,
  SmartAlerts,
  AlertAnalytics,
} from '../components/alerts';

const TABS = [
  { id: 'create', label: 'Create', icon: Bell },
  { id: 'active', label: 'Active', icon: BellOff },
  { id: 'history', label: 'History', icon: TrendingUp },
  { id: 'smart', label: 'AI Smart', icon: Sparkles },
  { id: 'analytics', label: 'Analytics', icon: Activity },
];

const PriceAlerts = () => {
  const { t } = useTranslation();
  const {
    alerts,
    alertHistory,
    analytics,
    loading,
    createAlert,
    deleteAlert,
    toggleAlert,
    fetchAlerts,
    fetchAnalytics,
  } = useAlerts();

  const [activeTab, setActiveTab] = useState('active');
  const [creatingAlert, setCreatingAlert] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleCreateAlert = async (alertData) => {
    setCreatingAlert(true);
    try {
      const result = await createAlert(alertData);
      if (result.success) {
        setActiveTab('active');
        fetchAlerts();
        fetchAnalytics();
      }
    } finally {
      setCreatingAlert(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteAlert(id);
    fetchAlerts();
    fetchAnalytics();
  };

  const handleToggle = async (id, isActive) => {
    await toggleAlert(id, isActive);
    fetchAlerts();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <CreateAlertForm
            onCreateAlert={handleCreateAlert}
            loading={creatingAlert}
          />
        );
      case 'active':
        return (
          <ActiveAlerts
            alerts={alerts}
            onDelete={handleDelete}
            onToggle={handleToggle}
            loading={loading}
          />
        );
      case 'history':
        return (
          <AlertHistory
            history={alertHistory}
            loading={loading}
          />
        );
      case 'smart':
        return (
          <SmartAlerts
            onCreateAlert={handleCreateAlert}
          />
        );
      case 'analytics':
        return (
          <AlertAnalytics
            analytics={analytics}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Price Alerts</h1>
                <p className="text-xs text-slate-400">Monitor the markets, never miss a move</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchAlerts();
                  fetchAnalytics();
                }}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('create');
                  setShowMobileMenu(false);
                }}
                className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-amber-600/20 items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                New Alert
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
            {/* Mobile tab selector */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white border-b-2 border-brand-500 whitespace-nowrap"
              >
                {TABS.find((t) => t.id === activeTab)?.icon && (() => {
                  const Icon = TABS.find((t) => t.id === activeTab)?.icon;
                  return Icon ? <Icon className="w-4 h-4" /> : null;
                })()}
                {TABS.find((t) => t.id === activeTab)?.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showMobileMenu && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-50">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                          activeTab === tab.id
                            ? 'text-white bg-white/5'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop tabs */}
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const badge =
                tab.id === 'active'
                  ? alerts.filter((a) => a.isActive !== false).length
                  : tab.id === 'history'
                  ? alertHistory.length
                  : null;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    isActive
                      ? 'text-brand-400 border-brand-500'
                      : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {badge !== null && badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-brand-500/20 text-brand-300'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PriceAlerts;