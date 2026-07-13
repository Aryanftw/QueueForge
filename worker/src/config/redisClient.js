const Redis = require('ioredis');
const logger = require('../utils/logger');

const connectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

// Dedicated to blocking BRPOP calls only.
const blockingClient = new Redis(connectionOptions);
blockingClient.on('connect', () => logger.info('Worker (blocking) connected to Redis'));
blockingClient.on('error', (err) => logger.error({ err }, 'Blocking Redis client error'));

// Used for everything else: HGETALL, HSET, and re-enqueueing retries via LPUSH.
const commandClient = new Redis(connectionOptions);
commandClient.on('connect', () => logger.info('Worker (commands) connected to Redis'));
commandClient.on('error', (err) => logger.error({ err }, 'Command Redis client error'));

module.exports = { blockingClient, commandClient };