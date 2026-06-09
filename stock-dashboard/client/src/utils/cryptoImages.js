// Centralized crypto image URLs using CoinGecko's CDN (more reliable than cryptologos.cc)
// CoinGecko assets CDN is well-maintained and publicly accessible

const COINGECKO_IMAGES = {
  BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
  DOT: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-logo.png',
  TRX: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
  BCH: 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png',
  XLM: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
  ATOM: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
  XMR: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png',
  ETC: 'https://assets.coingecko.com/coins/images/79/small/ethereum-classic-logo.png',
  FIL: 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png',
  APT: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
  SUI: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg',
  OP: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
  ARB: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
};

/**
 * Get a reliable image URL for a crypto coin.
 * Falls back to ui-avatars.com if no image is available.
 */
export const getCryptoImage = (symbol, background = '8b5cf6') => {
  if (!symbol) {
    return `https://ui-avatars.com/api/?name=?&background=${background}&color=fff&size=48`;
  }
  const upper = symbol.toUpperCase();
  return (
    COINGECKO_IMAGES[upper] ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(upper)}&background=${background}&color=fff&size=48`
  );
};

/**
 * Get a fallback image URL using ui-avatars.com.
 */
export const getFallbackImage = (symbol, background = '8b5cf6', size = 48) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol || '?')}&background=${background}&color=fff&size=${size}`;
};

/**
 * Handle image error by replacing with a fallback.
 * Use as onError handler for <img> elements.
 */
export const handleImageError = (e, symbol, background = '8b5cf6', size) => {
  if (e.target) {
    e.target.onerror = null; // Prevent infinite loop
    const imgSize = size || parseInt(e.target.getAttribute('width') || e.target.getAttribute('height') || '48', 10);
    e.target.src = getFallbackImage(symbol, background, imgSize);
  }
};

export default COINGECKO_IMAGES;