import { useEffect, useCallback, useRef } from 'react';
import useStore from '../store/useStore';

const useWebSocket = () => {
  const { connectWebSocket, disconnectWebSocket, connected, isAuthenticated } = useStore();
  const reconnectTimerRef = useRef(null);

  const connect = useCallback(() => {
    if (isAuthenticated) {
      connectWebSocket();
    }
  }, [isAuthenticated, connectWebSocket]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    disconnectWebSocket();
  }, [disconnectWebSocket]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return {
    connected,
    reconnect: connect,
    disconnect,
  };
};

export default useWebSocket;