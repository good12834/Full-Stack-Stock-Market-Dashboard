import { useState, useEffect, useCallback } from 'react';
import { portfolioAPI } from '../utils/api';
import useStore from '../store/useStore';

const usePortfolio = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { portfolio, fetchPortfolio, isAuthenticated } = useStore();

  const loadPortfolio = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      await fetchPortfolio();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchPortfolio]);

  const addPosition = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      await useStore.getState().addPosition(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add position');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removePosition = useCallback(async (symbol, quantity) => {
    setLoading(true);
    setError(null);
    try {
      await useStore.getState().removePosition(symbol, quantity);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove position');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const totalValue = portfolio?.totalValue || 0;
  const totalInvested = portfolio?.totalInvested || 0;
  const totalGain = portfolio?.totalGain || 0;
  const totalGainPercent = portfolio?.totalGainPercent || 0;
  const positions = portfolio?.positions || [];
  const positionCount = positions.length;

  return {
    portfolio,
    positions,
    totalValue,
    totalInvested,
    totalGain,
    totalGainPercent,
    positionCount,
    loading,
    error,
    addPosition,
    removePosition,
    refresh: loadPortfolio,
  };
};

export default usePortfolio;