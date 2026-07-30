const { commandClient } = require('../config/redisClient');
const { WORKERS_SET } = require('../../../shared/constants');
const logger = require('../utils/logger');

async function registerWorker(workerId) {
  await commandClient.sadd(WORKERS_SET, workerId);
  logger.info({ workerId }, 'Worker registered');
}

async function deregisterWorker(workerId) {
  await commandClient.srem(WORKERS_SET, workerId);
  logger.info({ workerId }, 'Worker deregistered');
}

module.exports = { registerWorker, deregisterWorker };