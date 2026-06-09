import React, { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Hook for managing data fetching with retry logic
 */
export const useRetryableFetch = (fetchFn, dependencies = []) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await fetchFn();
      retryCountRef.current = 0;
    } catch (err) {
      setError(err);

      if (retryCountRef.current < maxRetries) {
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        setTimeout(() => {
          retryCountRef.current += 1;
          fetch();
        }, delay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetch();
  }, dependencies);

  const retry = useCallback(() => {
    retryCountRef.current = 0;
    fetch();
  }, [fetch]);

  return {
    isLoading,
    error,
    retry,
    retryCount: retryCountRef.current,
  };
};

/**
 * Hook for managing WebSocket connection lifecycle
 */
export const useWebSocketConnection = (url, onMessage, onError) => {
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(url);

        ws.onopen = () => {
          console.log('WebSocket connected');
          reconnectAttempts.current = 0;
          reconnectDelay.current = 1000;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage?.(data);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          onError?.(error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          wsRef.current = null;

          // Attempt reconnection with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            setTimeout(() => {
              reconnectAttempts.current += 1;
              reconnectDelay.current = Math.min(
                reconnectDelay.current * 2,
                30000
              );
              connect();
            }, reconnectDelay.current);
          }
        };

        wsRef.current = ws;
      } catch (err) {
        console.error('Failed to create WebSocket:', err);
        onError?.(err);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, onMessage, onError]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const isConnected = wsRef.current?.readyState === WebSocket.OPEN;

  return { send, isConnected };
};

/**
 * Hook for managing periodic data refresh
 */
export const usePeriodicRefresh = (callback, interval = 30000, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(callback, interval);

    return () => clearInterval(intervalId);
  }, [callback, interval, enabled]);
};