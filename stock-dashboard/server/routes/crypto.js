const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// GET /api/crypto — List all coins with prices
router.get('/', cryptoController.getCryptoPrices);

// GET /api/crypto/global — Global market data
router.get('/global', cryptoController.getCryptoGlobal);

// GET /api/crypto/fear-greed — Fear & Greed Index
router.get('/fear-greed', cryptoController.getFearGreedIndex);

// GET /api/crypto/trending — Trending coins
router.get('/trending', cryptoController.getTrendingCoins);

// GET /api/crypto/news — Crypto news
router.get('/news', cryptoController.getCryptoNews);

// GET /api/crypto/history/:coinId — Historical chart data
router.get('/history/:coinId', cryptoController.getCryptoHistory);

module.exports = router;