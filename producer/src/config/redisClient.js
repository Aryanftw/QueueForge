const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('connect', () => logger.info('Producer connected to Redis'));
redisClient.on('error', (err) => logger.error({ err }, 'Redis connection error'));

module.exports = redisClient;