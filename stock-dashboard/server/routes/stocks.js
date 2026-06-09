const express = require('express');
const {
  getStocks,
  getStockBySymbol,
  getStockHistory,
  getStockIntraday,
  searchStocks,
  compareStocks,
} = require('../controllers/stockController');

const router = express.Router();

router.get('/', getStocks);
router.get('/compare', compareStocks);
router.get('/search/:query', searchStocks);
router.get('/:symbol', getStockBySymbol);
router.get('/:symbol/history', getStockHistory);
router.get('/:symbol/intraday', getStockIntraday);

module.exports = router;
