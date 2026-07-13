const { v4: uuidv4 } = require('uuid');
const redisClient = require('../config/redisClient');
const { MAIN_QUEUE, jobKey } = require('../../../shared/constants');
const { DEFAULT_MAX_RETRIES } = require('../../../shared/retryConfig');
const logger = require('../utils/logger');

async function enqueueJob({ type, payload }) {
  const jobId = uuidv4();
  const now = new Date().toISOString();

  await redisClient.hset(jobKey(jobId), {
    id: jobId,
    type,
    payload: JSON.stringify(payload),
    status: 'waiting',
    createdAt: now,
    startedAt: '',
    completedAt: '',
    retryCount: 0,
    maxRetries: DEFAULT_MAX_RETRIES,
    lastError: '',
  });

  await redisClient.lpush(MAIN_QUEUE, jobId);

  logger.info({ jobId, type }, 'Job enqueued');
  return jobId;
}

module.exports = { enqueueJob };