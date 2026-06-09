const express = require('express');
const controller = require('../controllers/finnhubController');

const router = express.Router();

// ---- Stock Data ----
router.get('/quote/:symbol', controller.getQuote);
router.get('/candles/:symbol', controller.getCandles);
router.get('/basic-financials/:symbol', controller.getBasicFinancials);
router.get('/earnings/:symbol', controller.getEarnings);
router.get('/eps-estimates/:symbol', controller.getEpsEstimates);
router.get('/revenue-estimates/:symbol', controller.getRevenueEstimates);
router.get('/ebitda-estimates/:symbol', controller.getEbitdaEstimates);
router.get('/ebit-estimates/:symbol', controller.getEbitEstimates);
router.get('/executive/:symbol', controller.getCompanyExecutive);
router.get('/peers/:symbol', controller.getCompanyPeers);
router.get('/profile', controller.getCompanyProfile);
router.get('/profile2/:symbol', controller.getCompanyProfile2);
router.get('/company-news/:symbol', controller.getCompanyNews);
router.get('/market-news', controller.getMarketNews);
router.get('/news-sentiment/:symbol', controller.getNewsSentiment);
router.get('/press-releases/:symbol', controller.getPressReleases);
router.get('/dividends/:symbol', controller.getStockDividends);
router.get('/splits/:symbol', controller.getStockSplits);
router.get('/stock-symbols', controller.getStockSymbols);
router.get('/insider-transactions/:symbol', controller.getInsiderTransactions);
router.get('/ownership/:symbol', controller.getOwnership);
router.get('/price-target/:symbol', controller.getPriceTarget);
router.get('/recommendation-trends/:symbol', controller.getRecommendationTrends);
router.get('/upgrade-downgrade', controller.getUpgradeDowngrade);
router.get('/support-resistance/:symbol', controller.getSupportResistance);
router.get('/pattern-recognition/:symbol', controller.getPatternRecognition);
router.get('/technical-indicator/:symbol', controller.getTechnicalIndicator);
router.get('/aggregate-indicator/:symbol', controller.getAggregateIndicator);
router.get('/earnings-calendar', controller.getEarningsCalendar);
router.get('/ipo-calendar', controller.getIpoCalendar);

// ---- Economic Data ----
router.get('/economic-code', controller.getEconomicCode);
router.get('/economic-data/:code', controller.getEconomicData);

// ---- Company Data ----
router.get('/esg/:symbol', controller.getCompanyEsgScore);
router.get('/earnings-quality-score/:symbol', controller.getEarningsQualityScore);
router.get('/revenue-breakdown/:symbol', controller.getRevenueBreakdown);
router.get('/filings', controller.getFilings);
router.get('/financials/:symbol', controller.getFinancials);
router.get('/financials-reported', controller.getFinancialsReported);
router.get('/transcripts/:id', controller.getTranscripts);
router.get('/transcripts-list/:symbol', controller.getTranscriptsList);

// ---- Crypto ----
router.get('/crypto/candles/:symbol', controller.getCryptoCandles);
router.get('/crypto/exchanges', controller.getCryptoExchanges);
router.get('/crypto/symbols/:exchange', controller.getCryptoSymbols);
router.get('/crypto/profile/:symbol', controller.getCryptoProfile);

// ---- Forex ----
router.get('/forex/candles/:symbol', controller.getForexCandles);
router.get('/forex/exchanges', controller.getForexExchanges);
router.get('/forex/rates', controller.getForexRates);
router.get('/forex/symbols/:exchange', controller.getForexSymbols);

// ---- ETF ----
router.get('/etf/profile', controller.getEtfProfile);
router.get('/etf/holdings/:symbol', controller.getEtfHoldings);
router.get('/etf/sector-exposure/:symbol', controller.getEtfSectorExposure);
router.get('/etf/country-exposure/:symbol', controller.getEtfCountryExposure);

// ---- Mutual Fund ----
router.get('/mutual-fund/profile', controller.getMutualFundProfile);
router.get('/mutual-fund/holdings/:symbol', controller.getMutualFundHoldings);
router.get('/mutual-fund/sector-exposure/:symbol', controller.getMutualFundSectorExposure);
router.get('/mutual-fund/country-exposure/:symbol', controller.getMutualFundCountryExposure);

// ---- Indices ----
router.get('/indices/constituents/:symbol', controller.getIndicesConstituents);
router.get('/indices/historical-constituents/:symbol', controller.getIndicesHistoricalConstituents);

// ---- Market / Misc ----
router.get('/tick/:symbol', controller.getStockTick);
router.get('/market-status', controller.getMarketStatus);
router.get('/market-holiday', controller.getMarketHoliday);
router.get('/search', controller.getSymbolSearch);
router.get('/country', controller.getCountry);
router.get('/covid19', controller.getCovid19);
router.get('/social-sentiment/:symbol', controller.getSocialSentiment);
router.get('/investment-theme/:theme', controller.getInvestmentThemes);
router.get('/supply-chain/:symbol', controller.getSupplyChain);
router.get('/uspto-patent/:symbol', controller.getUsptoPatent);
router.get('/visa-application/:symbol', controller.getVisaApplication);
router.get('/insider-sentiment/:symbol', controller.getInsiderSentiment);

module.exports = router;