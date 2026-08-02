const redisClient = require('../config/redisClient');
const {
  MAIN_QUEUE,
  DELAYED_QUEUE,
  DEAD_LETTER_QUEUE,
  WORKERS_SET,
  METRICS,
  PRIORITY_MULTIPLIER,
} = require('../../../shared/constants');

const PRIORITY_RANGE_FOR_METRICS = [1, 10];

async function getJobsByPriority() {
  const counts = {};
  const [minP, maxP] = PRIORITY_RANGE_FOR_METRICS;

  const countPromises = [];
  for (let p = minP; p <= maxP; p++) {
    const min = p * PRIORITY_MULTIPLIER;
    const max = (p + 1) * PRIORITY_MULTIPLIER - 1;
    countPromises.push(
      redisClient.zcount(MAIN_QUEUE, min, max).then((count) => {
        if (count > 0) counts[p] = count;
      })
    );
  }
  await Promise.all(countPromises);
  return counts;
}

// ZRANGE ... WITHSCORES LIMIT 0 1 — fetches just the single earliest-scored
// member. O(log N), since Redis can seek directly to the front of the set
// rather than scanning, the same reason ZPOPMIN is cheap.
async function getNextScheduledTimestamp() {
  const result = await redisClient.zrange(DELAYED_QUEUE, 0, 0, 'WITHSCORES');
  if (!result || result.length === 0) return null;
  return Number(result[1]); // [memberId, score]
}

async function getMetrics() {
  const [
    queueLength,
    delayedJobs,
    deadLetterQueueLength,
    workersRunning,
    jobsWaiting,
    jobsProcessing,
    jobsRetrying,
    jobsCompleted,
    jobsFailed,
    totalProcessingTimeMs,
    jobsByPriority,
    nextScheduledAt,
  ] = await Promise.all([
    redisClient.zcard(MAIN_QUEUE),
    redisClient.zcard(DELAYED_QUEUE), // O(1) — same as any other Sorted Set cardinality
    redisClient.llen(DEAD_LETTER_QUEUE),
    redisClient.scard(WORKERS_SET),
    redisClient.get(METRICS.JOBS_WAITING),
    redisClient.get(METRICS.JOBS_PROCESSING),
    redisClient.get(METRICS.JOBS_RETRYING),
    redisClient.get(METRICS.JOBS_COMPLETED),
    redisClient.get(METRICS.JOBS_FAILED),
    redisClient.get(METRICS.TOTAL_PROCESSING_TIME_MS),
    getJobsByPriority(),
    getNextScheduledTimestamp(),
  ]);

  const completedCount = Number(jobsCompleted) || 0;
  const totalTime = Number(totalProcessingTimeMs) || 0;
  const averageProcessingTimeMs = completedCount > 0 ? Math.round(totalTime / completedCount) : 0;

  let redisStatus = 'connected';
  try {
    await redisClient.ping();
  } catch {
    redisStatus = 'disconnected';
  }

  return {
    queueLength,
    delayedJobs,
    deadLetterQueueLength,
    jobsCompleted: completedCount,
    jobsFailed: Number(jobsFailed) || 0,
    jobsWaiting: Number(jobsWaiting) || 0,
    jobsProcessing: Number(jobsProcessing) || 0,
    jobsRetrying: Number(jobsRetrying) || 0,
    workersRunning,
    averageProcessingTimeMs,
    jobsByPriority,
    nextScheduledAt: nextScheduledAt ? new Date(nextScheduledAt).toISOString() : null,
    health: {
      redis: redisStatus,
      workerCount: workersRunning,
    },
  };
}

module.exports = { getMetrics };