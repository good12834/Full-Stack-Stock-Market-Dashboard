const axios = require('axios');

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Default coins list with IDs
const COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'tron', symbol: 'TRX', name: 'TRON' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
  { id: 'monero', symbol: 'XMR', name: 'Monero' },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin' },
  { id: 'aptos', symbol: 'APT', name: 'Aptos' },
  { id: 'sui', symbol: 'SUI', name: 'Sui' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
];

// Helper to format coin data
const formatCoinData = (coin) => ({
  symbol: coin.symbol?.toUpperCase() || '',
  name: coin.name || '',
  image: coin.image || '',
  current_price: coin.current_price || 0,
  market_cap: coin.market_cap || 0,
  market_cap_rank: coin.market_cap_rank || 0,
  total_volume: coin.total_volume || 0,
  price_change_percentage_24h: coin.price_change_percentage_24h || 0,
  price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency || 0,
  price_change_percentage_30d_in_currency: coin.price_change_percentage_30d_in_currency || 0,
  circulating_supply: coin.circulating_supply || 0,
  total_supply: coin.total_supply || 0,
  ath: coin.ath || 0,
  ath_change_percentage: coin.ath_change_percentage || 0,
  ath_date: coin.ath_date || '',
  sparkline_in_7d: coin.sparkline_in_7d?.price || [],
});

// Mock data fallback
const generateMockCoins = () => {
  const mockData = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67542.80, change: 2.34, marketCap: 1320000000000, volume: 28400000000 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3452.16, change: -1.23, marketCap: 415000000000, volume: 15800000000 },
    { id: 'solana', symbol: 'SOL', name: 'Solana', price: 172.33, change: 5.61, marketCap: 76000000000, volume: 4200000000 },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 601.45, change: 0.87, marketCap: 92000000000, volume: 1800000000 },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.6241, change: -0.45, marketCap: 34000000000, volume: 2100000000 },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.4623, change: 1.12, marketCap: 16200000000, volume: 850000000 },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.0832, change: -2.15, marketCap: 11800000000, volume: 920000000 },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 7.89, change: 0.34, marketCap: 10500000000, volume: 420000000 },
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', price: 38.76, change: 3.21, marketCap: 14200000000, volume: 680000000 },
    { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', price: 0.7245, change: -0.89, marketCap: 6700000000, volume: 380000000 },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 14.56, change: 1.67, marketCap: 8100000000, volume: 520000000 },
    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', price: 9.23, change: -1.01, marketCap: 5500000000, volume: 310000000 },
    { id: 'tron', symbol: 'TRX', name: 'TRON', price: 0.1189, change: 0.52, marketCap: 10400000000, volume: 420000000 },
    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', price: 84.32, change: 2.15, marketCap: 6300000000, volume: 410000000 },
    { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash', price: 378.90, change: -0.78, marketCap: 7400000000, volume: 290000000 },
  ];
  return mockData.map((c, i) => ({
    ...c,
    image: `https://assets.coingecko.com/coins/images/${i + 1}/small/${c.id}.png`,
    market_cap_rank: i + 1,
    circulating_supply: Math.floor(Math.random() * 10000000000),
    total_supply: Math.floor(Math.random() * 10000000000) + 1000000000,
    ath: c.price * (1 + Math.random()),
    ath_change_percentage: -Math.random() * 30,
    ath_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    price_change_percentage_7d_in_currency: (Math.random() - 0.5) * 20,
    price_change_percentage_30d_in_currency: (Math.random() - 0.5) * 40,
    sparkline_in_7d: Array.from({ length: 168 }, (_, i) => c.price * (1 + (Math.sin(i / 10) * 0.05) + (Math.random() - 0.5) * 0.02)),
  }));
};

// GET /api/crypto — List all coins with prices
exports.getCryptoPrices = async (req, res) => {
  try {
    const { vs_currency = 'usd', order = 'market_cap_desc', per_page = 50, page = 1 } = req.query;
    const ids = COINS.map(c => c.id).join(',');
    
    const response = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
      params: {
        vs_currency,
        order,
        per_page,
        page,
        ids,
        sparkline: true,
        price_change_percentage: '24h,7d,30d',
      },
      timeout: 8000,
      headers: { Accept: 'application/json' },
    });

    const formatted = response.data.map(formatCoinData);
    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.warn('CoinGecko API error, using mock data:', err.message);
    // Return mock data as fallback
    const mock = generateMockCoins();
    return res.json({ success: true, data: mock, source: 'mock' });
  }
};

// GET /api/crypto/global — Global market data
exports.getCryptoGlobal = async (req, res) => {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/global`, {
      timeout: 5000,
      headers: { Accept: 'application/json' },
    });
    const d = response.data.data;
    return res.json({
      success: true,
      data: {
        total_market_cap: d.total_market_cap?.usd || 0,
        total_volume: d.total_volume?.usd || 0,
        btc_dominance: d.market_cap_percentage?.btc || 0,
        eth_dominance: d.market_cap_percentage?.eth || 0,
        market_cap_change_percentage_24h_usd: d.market_cap_change_percentage_24h_usd || 0,
        active_cryptocurrencies: d.active_cryptocurrencies || 0,
        markets: d.markets || 0,
      },
    });
  } catch (err) {
    console.warn('CoinGecko global API error, using mock:', err.message);
    return res.json({
      success: true,
      data: {
        total_market_cap: 2.45e12,
        total_volume: 1.12e11,
        btc_dominance: 48.2,
        eth_dominance: 16.8,
        market_cap_change_percentage_24h_usd: 1.45,
        active_cryptocurrencies: 13245,
        markets: 876,
      },
      source: 'mock',
    });
  }
};

// GET /api/crypto/fear-greed — Fear & Greed Index
exports.getFearGreedIndex = async (req, res) => {
  try {
    const response = await axios.get('https://api.alternative.me/fng/?limit=7', {
      timeout: 5000,
    });
    return res.json({ success: true, data: response.data.data || [] });
  } catch (err) {
    console.warn('Fear & Greed API error, using mock:', err.message);
    return res.json({
      success: true,
      data: [
        { value: '62', value_classification: 'Greed', timestamp: Math.floor(Date.now() / 1000).toString() },
        { value: '58', value_classification: 'Greed', timestamp: (Math.floor(Date.now() / 1000) - 86400).toString() },
        { value: '55', value_classification: 'Greed', timestamp: (Math.floor(Date.now() / 1000) - 172800).toString() },
        { value: '48', value_classification: 'Neutral', timestamp: (Math.floor(Date.now() / 1000) - 259200).toString() },
        { value: '42', value_classification: 'Fear', timestamp: (Math.floor(Date.now() / 1000) - 345600).toString() },
        { value: '38', value_classification: 'Fear', timestamp: (Math.floor(Date.now() / 1000) - 432000).toString() },
        { value: '45', value_classification: 'Fear', timestamp: (Math.floor(Date.now() / 1000) - 518400).toString() },
      ],
      source: 'mock',
    });
  }
};

// GET /api/crypto/trending — Trending coins
exports.getTrendingCoins = async (req, res) => {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/search/trending`, {
      timeout: 5000,
      headers: { Accept: 'application/json' },
    });
    const trending = (response.data.coins || []).slice(0, 10).map((item) => ({
      id: item.item?.id,
      symbol: item.item?.symbol,
      name: item.item?.name,
      image: item.item?.large || item.item?.thumb,
      market_cap_rank: item.item?.market_cap_rank,
      price_btc: item.item?.price_btc,
      score: item.item?.score,
    }));
    return res.json({ success: true, data: trending });
  } catch (err) {
    console.warn('Trending API error, using mock:', err.message);
    const trendingCoins = ['bitcoin', 'ethereum', 'solana', 'dogecoin', 'avalanche-2', 'chainlink', 'matic-network', 'aptos', 'sui', 'arbitrum'];
    return res.json({
      success: true,
      data: trendingCoins.map((id, i) => ({
        id,
        symbol: id === 'bitcoin' ? 'btc' : id === 'ethereum' ? 'eth' : id === 'solana' ? 'sol' : id.substring(0, 4),
        name: id.charAt(0).toUpperCase() + id.replace(/-/g, ' ').slice(1),
        image: `https://assets.coingecko.com/coins/images/${i + 1}/small/${id}.png`,
        market_cap_rank: i + 1,
        price_btc: Math.random() * 0.1,
        score: i,
      })),
      source: 'mock',
    });
  }
};

// GET /api/crypto/news — Crypto news
exports.getCryptoNews = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    // Try CryptoPanic API first (requires API key)
    const apiKey = process.env.CRYPTOCYRENCY_API_KEY || process.env.CRYPTOPANIC_API_KEY;
    if (apiKey) {
      const response = await axios.get('https://cryptopanic.com/api/v1/posts/', {
        params: { auth_token: apiKey, currencies: 'BTC,ETH,SOL,DOGE', limit },
        timeout: 5000,
      });
      const news = (response.data.results || []).map((item) => ({
        title: item.title,
        url: item.url,
        source: item.source?.title || 'CryptoPanic',
        published_at: item.published_at,
        currencies: (item.currencies || []).map((c) => c.code),
        kind: item.kind,
        domain: item.domain,
      }));
      return res.json({ success: true, data: news });
    }
    throw new Error('No API key configured');
  } catch (err) {
    console.warn('Crypto news API error, using mock:', err.message);
    const mockNews = [
      { title: 'Bitcoin Surges Past $68,000 as ETF Inflows Reach Record High', url: '#', source: 'CoinDesk', published_at: new Date().toISOString(), currencies: ['BTC'], kind: 'news' },
      { title: 'Ethereum Layer-2 Solutions Hit New All-Time High in TVL', url: '#', source: 'The Block', published_at: new Date(Date.now() - 3600000).toISOString(), currencies: ['ETH'], kind: 'news' },
      { title: 'Solana Ecosystem Sees Explosive Growth in DeFi Activity', url: '#', source: 'Messari', published_at: new Date(Date.now() - 7200000).toISOString(), currencies: ['SOL'], kind: 'news' },
      { title: 'SEC Approves Multiple Spot Ethereum ETFs in Landmark Decision', url: '#', source: 'Bloomberg', published_at: new Date(Date.now() - 10800000).toISOString(), currencies: ['ETH'], kind: 'news' },
      { title: 'Bitcoin Hashrate Reaches All-Time High Amid Mining Expansion', url: '#', source: 'CoinTelegraph', published_at: new Date(Date.now() - 14400000).toISOString(), currencies: ['BTC'], kind: 'news' },
      { title: 'Ripple Labs Wins SEC Case, XRP Price Jumps 25%', url: '#', source: 'Reuters', published_at: new Date(Date.now() - 18000000).toISOString(), currencies: ['XRP'], kind: 'news' },
      { title: 'DeFi Total Value Locked Surpasses $100 Billion Mark', url: '#', source: 'DeFi Pulse', published_at: new Date(Date.now() - 21600000).toISOString(), currencies: ['ETH', 'SOL'], kind: 'news' },
      { title: 'Central Banks Worldwide Exploring CBDC Integration with Blockchains', url: '#', source: 'Financial Times', published_at: new Date(Date.now() - 25200000).toISOString(), currencies: [], kind: 'news' },
      { title: 'NFT Market Shows Signs of Recovery with Trading Volume Up 40%', url: '#', source: 'DappRadar', published_at: new Date(Date.now() - 28800000).toISOString(), currencies: ['ETH'], kind: 'news' },
      { title: 'Crypto Regulation Framework Advances in US Congress', url: '#', source: 'Politico', published_at: new Date(Date.now() - 32400000).toISOString(), currencies: [], kind: 'news' },
      { title: 'DogeCoin Integration Announced with Major Payment Processor', url: '#', source: 'CoinDesk', published_at: new Date(Date.now() - 36000000).toISOString(), currencies: ['DOGE'], kind: 'news' },
      { title: 'Chainlink CCIP Goes Live on Mainnet Enabling Cross-Chain Interoperability', url: '#', source: 'The Defiant', published_at: new Date(Date.now() - 39600000).toISOString(), currencies: ['LINK'], kind: 'news' },
    ];
    return res.json({ success: true, data: mockNews, source: 'mock' });
  }
};

// GET /api/crypto/history/:coinId — Historical chart data
exports.getCryptoHistory = async (req, res) => {
  try {
    const { coinId } = req.params;
    const { days = '7' } = req.query;
    const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}/market_chart`, {
      params: { vs_currency: 'usd', days },
      timeout: 8000,
      headers: { Accept: 'application/json' },
    });
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.warn(`History API error for ${req.params.coinId}, using mock:`, err.message);
    const days = parseInt(req.query.days || '7');
    const points = days <= 1 ? 24 : days <= 7 ? 168 : days <= 30 ? 720 : days <= 365 ? 365 : 730;
    const basePrice = req.params.coinId === 'bitcoin' ? 67000 : req.params.coinId === 'ethereum' ? 3400 : req.params.coinId === 'solana' ? 170 : 50;
    const now = Date.now();
    const interval = (days * 86400000) / points;
    const prices = Array.from({ length: points }, (_, i) => [
      now - (points - i) * interval,
      basePrice * (1 + (Math.sin(i / 15) * 0.08) + (Math.random() - 0.5) * 0.02),
    ]);
    return res.json({ success: true, data: { prices, source: 'mock' } });
  }
};