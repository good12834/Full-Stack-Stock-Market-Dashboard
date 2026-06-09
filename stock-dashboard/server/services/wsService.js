const WebSocket = require('ws');
const stockService = require('./stockService');

let wss = null;
const clients = new Set();
const intervals = new Map();
let broadcasting = false;

const setupWebSocket = (server) => {
  wss = new WebSocket.Server({ server });
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    clients.add(ws);

    // Send initial data
    broadcastStocks();

    // Handle messages from clients
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'subscribe':
            // Subscribe to specific stock updates
            ws.subscribedSymbols = data.symbols || [];
            break;

          case 'unsubscribe':
            ws.subscribedSymbols = [];
            break;

          case 'get_stock':
            if (data.symbol) {
              const stockData = await stockService.getStockPrice(data.symbol);
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'stock_update',
                  symbol: data.symbol,
                  data: stockData,
                }));
              }
            }
            break;
        }
      } catch (err) {
        console.warn('WebSocket message error:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.warn('WebSocket error:', err.message);
      clients.delete(ws);
    });
  });

  // Start broadcasting stock prices every 15 seconds (non-overlapping)
  const broadcastInterval = setInterval(async () => {
    if (broadcasting) return; // Skip if previous broadcast is still running
    try {
      await broadcastStocks();
    } catch (err) {
      console.warn('Broadcast interval error:', err.message);
    }
  }, 15000);

  intervals.set('broadcast', broadcastInterval);

  console.log('WebSocket server initialized');
  return wss;
};

// Broadcast stock updates to all connected clients
const broadcastStocks = async () => {
  if (clients.size === 0) return;
  if (broadcasting) return;
  broadcasting = true;

  try {
    const stocks = await stockService.getAllStocks();

    const message = JSON.stringify({
      type: 'market_update',
      stocks,
      timestamp: new Date().toISOString(),
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (err) {
    console.warn('Broadcast error:', err.message);
  } finally {
    broadcasting = false;
  }
};

// Send update for a specific stock
const broadcastStockUpdate = async (symbol, data) => {
  const message = JSON.stringify({
    type: 'stock_update',
    symbol,
    data,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Only send to clients subscribed to this symbol or all
      if (!client.subscribedSymbols || client.subscribedSymbols.length === 0) {
        client.send(message);
      } else if (client.subscribedSymbols.includes(symbol)) {
        client.send(message);
      }
    }
  });
};

// Clean up intervals
const cleanup = () => {
  intervals.forEach((interval) => clearInterval(interval));
  intervals.clear();
};

module.exports = {
  setupWebSocket,
  broadcastStocks,
  broadcastStockUpdate,
  cleanup,
};