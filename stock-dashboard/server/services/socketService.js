const { Server } = require('socket.io');
const stockService = require('./stockService');
const { getAlertHistory, getAlertAnalytics } = require('./alertService');

let io = null;
let broadcastInterval = null;
const connectionCount = { value: 0 };

// In-memory search counter for admin analytics
const searchCounter = new Map();

const setupSocketIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    connectionCount.value++;
    console.log(`[Socket.io] Client connected: ${socket.id} (total: ${connectionCount.value})`);

    // Send current stocks immediately on connect
    sendMarketUpdate(socket);

    // Client subscribes to specific symbols
    socket.on('subscribe', (symbols) => {
      if (Array.isArray(symbols)) {
        symbols.forEach((sym) => socket.join(`stock:${sym.toUpperCase()}`));
      }
    });

    socket.on('unsubscribe', (symbols) => {
      if (Array.isArray(symbols)) {
        symbols.forEach((sym) => socket.leave(`stock:${sym.toUpperCase()}`));
      }
    });

    // Client requests a single stock price
    socket.on('get_stock', async (symbol) => {
      try {
        const data = await stockService.getStockPrice(String(symbol).toUpperCase());
        if (data) {
          socket.emit('stock_update', { symbol: String(symbol).toUpperCase(), data });
        }
      } catch (err) {
        console.warn('[Socket.io] get_stock error:', err.message);
      }
    });

    // Track search for admin analytics
    socket.on('track_search', (symbol) => {
      if (symbol) {
        const sym = String(symbol).toUpperCase();
        searchCounter.set(sym, (searchCounter.get(sym) || 0) + 1);
      }
    });

    // Client requests alert history
    socket.on('alerts:get_history', (limit) => {
      const history = getAlertHistory(limit || 20);
      socket.emit('alerts:history', { history, timestamp: new Date().toISOString() });
    });

    // Client requests alert analytics
    socket.on('alerts:get_analytics', () => {
      const analytics = getAlertAnalytics();
      socket.emit('alerts:analytics', { analytics, timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      connectionCount.value = Math.max(0, connectionCount.value - 1);
      console.log(`[Socket.io] Client disconnected: ${socket.id} (total: ${connectionCount.value})`);
    });

    socket.on('error', (err) => {
      console.warn('[Socket.io] Socket error:', err.message);
    });
  });

  // Broadcast market updates every 15 seconds
  broadcastInterval = setInterval(async () => {
    if (io && io.engine.clientsCount > 0) {
      await broadcastMarketUpdate();
    }
  }, 15000);

  console.log('[Socket.io] Server initialized');
  return io;
};

const sendMarketUpdate = async (socket) => {
  try {
    const stocks = await stockService.getAllStocks();
    socket.emit('market_update', {
      stocks,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Socket.io] sendMarketUpdate error:', err.message);
  }
};

const broadcastMarketUpdate = async () => {
  try {
    const stocks = await stockService.getAllStocks();
    io.emit('market_update', {
      stocks,
      timestamp: new Date().toISOString(),
    });

    // Also send individual stock updates to subscribers
    for (const stock of stocks) {
      io.to(`stock:${stock.symbol}`).emit('stock_update', {
        symbol: stock.symbol,
        data: stock,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[Socket.io] broadcastMarketUpdate error:', err.message);
  }
};

const broadcastStockUpdate = (symbol, data) => {
  if (!io) return;
  io.to(`stock:${symbol}`).emit('stock_update', {
    symbol,
    data,
    timestamp: new Date().toISOString(),
  });
};

const getConnectionCount = () => connectionCount.value;

const getTopSearches = (limit = 10) => {
  return Array.from(searchCounter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([symbol, count]) => ({ symbol, count }));
};

const cleanup = () => {
  if (broadcastInterval) clearInterval(broadcastInterval);
  if (io) io.close();
};

module.exports = {
  setupSocketIO,
  broadcastStockUpdate,
  broadcastMarketUpdate,
  getConnectionCount,
  getTopSearches,
  cleanup,
};
