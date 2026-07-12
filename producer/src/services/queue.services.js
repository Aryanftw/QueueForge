const { v4: uuidv4 } = require('uuid');
const redisClient = require('../config/redisClient');
const { MAIN_QUEUE, jobKey } = require('../../../shared/constants');
const logger = require('../utils/logger');

async function enqueueJob({ type, payload }) {
  const jobId = uuidv4();
  const now = new Date().toISOString();

  // Store full job metadata in a Hash. Payload must be stringified —
  // Hash field values are strings just like List values.
  await redisClient.hset(jobKey(jobId), {
    id: jobId,
    type,
    payload: JSON.stringify(payload),
    status: 'waiting',
    createdAt: now,
    startedAt: '',
    completedAt: '',
  });

  // Queue only carries the ID now — execution order, not job data.
  await redisClient.lpush(MAIN_QUEUE, jobId);

  logger.info({ jobId, type }, 'Job enqueued');
  return jobId;
}

module.exports = { enqueueJob };