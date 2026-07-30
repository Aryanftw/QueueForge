const redisClient = require('../config/redisClient');
const { MAIN_QUEUE, DEAD_LETTER_QUEUE, jobKey } = require('../../../shared/constants');

// Returns every job ID currently sitting in the DLQ.
async function listDlqJobIds() {
  return redisClient.lrange(DEAD_LETTER_QUEUE, 0, -1);
}

// Fetches full metadata for one DLQ job.
async function getDlqJob(jobId) {
  const job = await redisClient.hgetall(jobKey(jobId));
  if (!job || Object.keys(job).length === 0) return null;
  return { ...job, payload: JSON.parse(job.payload) };
}

// Moves a job out of the DLQ and back onto the main queue for another attempt.
async function replayJob(jobId) {
  const job = await redisClient.hgetall(jobKey(jobId));
  if (!job || Object.keys(job).length === 0) {
    return { success: false, reason: 'not_found' };
  }

  // LREM removes the specific jobId from the DLQ list (count=0 removes all matches,
  // though there should only ever be one since a job is pushed to DLQ exactly once).
  const removed = await redisClient.lrem(DEAD_LETTER_QUEUE, 0, jobId);
  if (removed === 0) {
    return { success: false, reason: 'not_in_dlq' };
  }

  await redisClient.hset(jobKey(jobId), {
    status: 'waiting',
    retryCount: 0,
    lastError: '',
    startedAt: '',
    completedAt: '',
  });

  await redisClient.lpush(MAIN_QUEUE, jobId);

  return { success: true };
}

module.exports = { listDlqJobIds, getDlqJob, replayJob };