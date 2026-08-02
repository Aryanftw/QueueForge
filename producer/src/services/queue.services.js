const { v4: uuidv4 } = require('uuid');
const redisClient = require('../config/redisClient');
const { MAIN_QUEUE, METRICS, DEFAULT_PRIORITY, jobKey, computeScore } = require('../../../shared/constants');
const { DEFAULT_MAX_RETRIES } = require('../../../shared/retryConfig');
const logger = require('../utils/logger');

async function enqueueJob({ type, payload, priority }) {
  const jobId = uuidv4();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const finalPriority = Number.isInteger(priority) ? priority : DEFAULT_PRIORITY;

  await redisClient.hset(jobKey(jobId), {
    id: jobId,
    type,
    payload: JSON.stringify(payload),
    priority: finalPriority,
    status: 'waiting',
    createdAt: nowIso,
    startedAt: '',
    completedAt: '',
    retryCount: 0,
    maxRetries: DEFAULT_MAX_RETRIES,
    lastError: '',
    workerId: '',
  });

  const score = computeScore(finalPriority, now);
  await redisClient.zadd(MAIN_QUEUE, score, jobId);
  await redisClient.incr(METRICS.JOBS_WAITING);

  logger.info({ jobId, type, priority: finalPriority }, 'Job enqueued');
  return jobId;
}

module.exports = { enqueueJob };