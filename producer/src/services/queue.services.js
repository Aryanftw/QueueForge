const { v4: uuidv4 } = require('uuid');
const redisClient = require('../config/redisClient');
const { MAIN_QUEUE } = require('../../../shared/constants');
const logger = require('../utils/logger');

/**
 * Builds a job object and pushes it onto the main queue.
 * Phase 1: no metadata storage yet, just the raw job payload.
 */
async function enqueueJob({ type, payload }) {
  const job = {
    id: uuidv4(),
    type,
    payload,
    createdAt: new Date().toISOString(),
  };

  // Redis lists only store strings, so we serialize the job
  await redisClient.lpush(MAIN_QUEUE, JSON.stringify(job));

  logger.info({ jobId: job.id, type }, 'Job enqueued');
  return job.id;
}

module.exports = { enqueueJob };