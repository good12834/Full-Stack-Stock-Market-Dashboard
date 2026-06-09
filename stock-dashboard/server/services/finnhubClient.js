/**
 * Finnhub API Client Service
 * Initializes the official Finnhub SDK client with the configured API key.
 * Usage: const finnhubClient = require('./finnhubClient');
 *        finnhubClient.quote("AAPL", (error, data, response) => { ... });
 */
const { DefaultApi } = require('finnhub');

let client = null;

const getClient = () => {
  if (client) return client;

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'demo') {
    console.warn('Finnhub API key not configured. Finnhub features will be unavailable.');
    return null;
  }

  client = new DefaultApi(apiKey);
  return client;
};

/**
 * Promisify a Finnhub API call
 * Wraps a callback-based Finnhub method into a Promise
 */
const promisify = (method) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      const apiClient = getClient();
      if (!apiClient) {
        return reject(new Error('Finnhub API key not configured'));
      }
      method.apply(apiClient, [
        ...args,
        (error, data, response) => {
          if (error) {
            reject(error);
          } else {
            resolve({ data, response });
          }
        },
      ]);
    });
  };
};

module.exports = {
  getClient,
  promisify,
};