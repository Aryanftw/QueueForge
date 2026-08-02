const redisClient = require('../config/redisClient');
const { MAIN_QUEUE, DEAD_LETTER_QUEUE, jobKey, computeScore } = require('../../../shared/constants');

async function listDlqJobIds() {
  return redisClient.lrange(DEAD_LETTER_QUEUE, 0, -1);
}

async function getDlqJob(jobId) {
  const job = await redisClient.hgetall(jobKey(jobId));
  if (!job || Object.keys(job).length === 0) return null;
  return { ...job, payload: JSON.parse(job.payload) };
}

async function replayJob(jobId) {
  const job = await redisClient.hgetall(jobKey(jobId));
  if (!job || Object.keys(job).length === 0) {
    return { success: false, reason: 'not_found' };
  }

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

  // Re-enter the priority queue using the job's original priority + a fresh timestamp.
  const priority = Number(job.priority);
  const score = computeScore(priority, Date.now());
  await redisClient.zadd(MAIN_QUEUE, score, jobId);

  await redisClient.incr('metrics:jobsWaiting');
  await redisClient.decr('metrics:jobsFailed');

  return { success: true };
}

module.exports = { listDlqJobIds, getDlqJob, replayJob };