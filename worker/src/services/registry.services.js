const { commandClient } = require('../config/redisClient');
const { WORKERS_SET, workerInfoKey } = require('../../../shared/constants');
const logger = require('../utils/logger');

async function registerWorker(workerId) {
  await commandClient.sadd(WORKERS_SET, workerId);
  await commandClient.hset(workerInfoKey(workerId), {
    workerId,
    status: 'idle',
    currentJobId: '',
    lastActivity: new Date().toISOString(),
  });
  logger.info({ workerId }, 'Worker registered');
}

async function deregisterWorker(workerId) {
  await commandClient.srem(WORKERS_SET, workerId);
  await commandClient.del(workerInfoKey(workerId));
  logger.info({ workerId }, 'Worker deregistered');
}

// Called whenever a worker picks up or finishes a job, so the dashboard
// can show live status per worker without scanning job Hashes.
async function updateWorkerActivity(workerId, status, currentJobId = '') {
  await commandClient.hset(workerInfoKey(workerId), {
    status, // 'idle' | 'processing'
    currentJobId,
    lastActivity: new Date().toISOString(),
  });
}

module.exports = { registerWorker, deregisterWorker, updateWorkerActivity };