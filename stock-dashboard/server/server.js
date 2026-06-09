const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { setupWebSocket } = require('./services/wsService');
const { setupSocketIO } = require('./services/socketService');
const { seedStocks } = require('./services/stockService');
const { startAlertMonitor } = require('./services/alertService');

// Load env vars
dotenv.config({ path: '../.env' });

// Route files
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stocks');
const finnhubRoutes = require('./routes/finnhub');
const portfolioRoutes = require('./routes/portfolio');
const watchlistRoutes = require('./routes/watchlist');
const alertRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const cryptoRoutes = require('./routes/crypto');

const app = express();
const server = http.createServer(app);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/finnhub', finnhubRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin/analytics', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/crypto', cryptoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Stock Dashboard API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

// Setup WebSocket (existing ws library)
const wss = setupWebSocket(server);

// Setup Socket.io (new real-time layer)
const io = setupSocketIO(server);

// Start alert monitoring service
startAlertMonitor(io);

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB (non-blocking)
    try {
      await connectDB();
      await seedStocks();
    } catch (dbErr) {
      console.warn(`MongoDB unavailable (${dbErr.message}). Server running without database.`);
    }

    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║         Stock Dashboard API Server          ║
║──────────────────────────────────────────────║
║  Server:    http://localhost:${PORT}          ║
║  Socket.io: http://localhost:${PORT}/socket.io ║
║  WebSocket: ws://localhost:${PORT}/ws         ║
║  Health:    http://localhost:${PORT}/api/health ║
║  Mode:      ${process.env.NODE_ENV || 'development'}                    ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

module.exports = { app, server, wss, io };