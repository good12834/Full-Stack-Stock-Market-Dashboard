let redis;
try {
  redis = require('redis');
} catch (e) {
  // Redis module not available, caching will be disabled
  redis = null;
}

let client = null;
let disabled = false;
let connecting = false;
const DEFAULT_TTL = 300; // 5 minutes

const getClient = async () => {
  if (disabled) return null;
  if (connecting) return null;
  if (!redis) {
    disabled = true;
    return null;
  }
  if (!client) {
    connecting = true;
    try {
      client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: false, // Don't auto-reconnect
          connectTimeout: 3000,     // 3 second timeout
        },
      });

      client.on('error', (err) => {
        // Suppress Redis errors to avoid console noise
      });

      await client.connect();
    } catch (err) {
      console.warn('Redis is not available, caching disabled. Application will continue without caching.');
      disabled = true;
      client = null;
      return null;
    } finally {
      connecting = false;
    }
  }
  return client;
};

const get = async (key) => {
  if (disabled) return null;
  try {
    const redisClient = await getClient();
    if (!redisClient) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn('Cache get error:', err.message);
    return null;
  }
};

const set = async (key, value, ttl = DEFAULT_TTL) => {
  if (disabled) return;
  try {
    const redisClient = await getClient();
    if (!redisClient) return;
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.warn('Cache set error:', err.message);
  }
};

const del = async (key) => {
  try {
    const redisClient = await getClient();
    if (!redisClient) return;
    await redisClient.del(key);
  } catch (err) {
    console.warn('Cache del error:', err.message);
  }
};

const flush = async () => {
  try {
    const redisClient = await getClient();
    if (!redisClient) return;
    await redisClient.flushAll();
  } catch (err) {
    console.warn('Cache flush error:', err.message);
  }
};

module.exports = { get, set, del, flush };