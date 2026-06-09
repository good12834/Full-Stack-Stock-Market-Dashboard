import { useState, useEffect, useCallback } from 'react';
import { stocksAPI } from '../utils/api';
import useStore from '../store/useStore';

const useStockData = (symbol, interval = 'daily') => {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { stocks } = useStore();

  // Get stock from global store
  const stockFromStore = symbol
    ? stocks.find((s) => s.symbol === symbol.toUpperCase())
    : null;

  const fetchStockDetail = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const response = await stocksAPI.getBySymbol(symbol);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const fetchHistory = useCallback(async () => {
    if (!symbol) return;
    try {
      const response = await stocksAPI.getHistory(symbol, interval);
      setHistory(response.data.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, [symbol, interval]);

  useEffect(() => {
    fetchStockDetail();
  }, [fetchStockDetail]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Update from live WebSocket data
  useEffect(() => {
    if (stockFromStore && symbol) {
      setData((prev) => prev ? { ...prev, ...stockFromStore } : stockFromStore);
    }
  }, [stockFromStore, symbol]);

  return {
    stock: data || stockFromStore,
    history,
    loading,
    error,
    refetch: fetchStockDetail,
    refetchHistory: fetchHistory,
  };
};

export default useStockData;