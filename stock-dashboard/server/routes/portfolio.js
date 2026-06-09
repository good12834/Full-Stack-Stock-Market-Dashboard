const express = require('express');
const {
  getPortfolio,
  addPosition,
  sellPosition,
  removePosition,
  getTransactions,
  getPerformance,
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPortfolio)
  .post(addPosition);

router.post('/sell', sellPosition);
router.delete('/:symbol', removePosition);
router.get('/transactions', getTransactions);
router.get('/performance', getPerformance);

module.exports = router;