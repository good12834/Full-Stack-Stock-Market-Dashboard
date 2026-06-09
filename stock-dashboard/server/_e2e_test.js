// End-to-end HTTP test of the crypto 404 fix.
// Spins up the server on a free port, hits the API, prints results, then exits.

process.env.PORT = process.env.PORT || '5099';
process.env.NODE_ENV = 'development';
// Force demo/no-key mode so we hit the fallback path:
process.env.FINNHUB_API_KEY = '';
process.env.ALPHA_VANTAGE_API_KEY = '';

const http = require('http');

let server;
try {
  server = require('./server.js');
} catch (e) {
  console.error('Failed to require server.js:', e.message);
  process.exit(1);
}


// Wait for the server to start listening
setTimeout(async () => {
  const port = process.env.PORT;
  const symbols = ['MATIC', 'DOGE', 'BTC', 'AAPL', 'UNKNOWN'];
  for (const sym of symbols) {
    try {
      const data = await httpGetJson(`http://localhost:${port}/api/stocks/${sym}`);
      console.log(`/api/stocks/${sym} -> HTTP ${data.status}: ${JSON.stringify(data.body).slice(0, 120)}`);
    } catch (e) {
      console.log(`/api/stocks/${sym} -> ERROR: ${e.message}`);
    }
  }
  // Also test history for MATIC
  try {
    const data = await httpGetJson(`http://localhost:${port}/api/stocks/MATIC/history?interval=daily`);
    const count = data.body?.data?.length ?? 0;
    console.log(`/api/stocks/MATIC/history -> HTTP ${data.status}: ${count} points`);
  } catch (e) {
    console.log(`/api/stocks/MATIC/history -> ERROR: ${e.message}`);
  }
  // Also test intraday for DOGE
  try {
    const data = await httpGetJson(`http://localhost:${port}/api/stocks/DOGE/intraday`);
    const count = data.body?.data?.length ?? 0;
    console.log(`/api/stocks/DOGE/intraday -> HTTP ${data.status}: ${count} points`);
  } catch (e) {
    console.log(`/api/stocks/DOGE/intraday -> ERROR: ${e.message}`);
  }

  process.exit(0);
}, 3000);

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 15000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body: body.slice(0, 200) });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
  });
}
