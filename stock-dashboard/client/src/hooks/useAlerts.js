import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch alerts from the API
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch alerts:', err.message);
      // Try loading from localStorage as fallback
      try {
        const saved = localStorage.getItem('priceAlerts');
        if (saved) {
          setAlerts(JSON.parse(saved));
        }
      } catch (e) {
        // Silent
      }
    }
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts/history');
      const data = await res.json();
      if (data.success) {
        setAlertHistory(data.data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch alert history:', err.message);
    }
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch alert analytics:', err.message);
    }
  }, []);

  // Create a new alert
  const createAlert = useCallback(async (alertData) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
      const data = await res.json();
      if (data.success) {
        setAlerts((prev) => [data.data, ...prev]);
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error };
    } catch (err) {
      // Fallback: save locally
      const alert = {
        id: Date.now().toString(),
        ...alertData,
        symbol: (alertData.symbol || alertData.assetSymbol || '').toUpperCase(),
        assetSymbol: (alertData.symbol || alertData.assetSymbol || '').toUpperCase(),
        isActive: true,
        isTriggered: false,
        createdAt: new Date().toISOString(),
      };
      setAlerts((prev) => [alert, ...prev]);

      // Persist to localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        saved.unshift(alert);
        localStorage.setItem('priceAlerts', JSON.stringify(saved));
      } catch (e) {
        // Silent
      }

      return { success: true, data: alert, local: true };
    }
  }, []);

  // Delete an alert
  const deleteAlert = useCallback(async (id) => {
    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete alert via API:', err.message);
    }

    setAlerts((prev) => prev.filter((a) => (a._id || a.id) !== id));

    // Update localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
      localStorage.setItem('priceAlerts', JSON.stringify(saved.filter((a) => a.id !== id)));
    } catch (e) {
      // Silent
    }
  }, []);

  // Toggle alert active state
  const toggleAlert = useCallback(async (id, isActive) => {
    try {
      await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
    } catch (err) {
      console.warn('Failed to toggle alert:', err.message);
    }

    setAlerts((prev) =>
      prev.map((a) => ((a._id || a.id) === id ? { ...a, isActive } : a))
    );
  }, []);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchAlerts(), fetchHistory(), fetchAnalytics()]);
      setLoading(false);
    };
    init();
  }, [fetchAlerts, fetchHistory, fetchAnalytics]);

  // Connect to Socket.io for real-time alert updates
  useEffect(() => {
    let socket = null;

    try {
      socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        path: '/socket.io',
      });

      socket.on('connect', () => {
        console.log('[useAlerts] Connected to alert socket');
      });

      socket.on('alert_triggered', (data) => {
        if (data?.alerts?.length > 0) {
          // Add new triggered alerts to history
          setAlertHistory((prev) => [...data.alerts, ...prev].slice(0, 20));
          // Refresh analytics
          fetchAnalytics();
        }
      });

      socket.on('alert_history_update', (data) => {
        if (data?.history) {
          setAlertHistory(data.history);
        }
      });

      socket.on('alerts_update', (data) => {
        if (data?.alerts) {
          setAlerts(data.alerts);
        }
      });

      socket.on('disconnect', () => {
        console.log('[useAlerts] Disconnected from alert socket');
      });

      socket.on('connect_error', (err) => {
        console.warn('[useAlerts] Socket connection error:', err.message);
      });
    } catch (err) {
      console.warn('[useAlerts] Socket initialization error:', err.message);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fetchAnalytics]);

  return {
    alerts,
    alertHistory,
    analytics,
    loading,
    error,
    fetchAlerts,
    fetchHistory,
    fetchAnalytics,
    createAlert,
    deleteAlert,
    toggleAlert,
  };
};

export default useAlerts;