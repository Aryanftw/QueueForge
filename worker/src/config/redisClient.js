const Redis = require('ioredis');
const logger = require('../utils/logger');

// This client is dedicated to blocking calls (BRPOP).
// IMPORTANT: never reuse this connection for other Redis commands
// while a blocking call is pending — it will queue behind the block.
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('connect', () => logger.info('Worker connected to Redis'));
redisClient.on('error', (err) => logger.error({ err }, 'Redis connection error'));

module.exports = redisClient;