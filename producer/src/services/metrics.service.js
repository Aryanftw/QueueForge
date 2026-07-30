const redisClient = require('../config/redisClient');
const {
  MAIN_QUEUE,
  DEAD_LETTER_QUEUE,
  WORKERS_SET,
  METRICS,
} = require('../../../shared/constants');

async function getMetrics() {
  const [
    queueLength,
    deadLetterQueueLength,
    workersRunning,
    jobsWaiting,
    jobsProcessing,
    jobsRetrying,
    jobsCompleted,
    jobsFailed,
    totalProcessingTimeMs,
  ] = await Promise.all([
    redisClient.llen(MAIN_QUEUE),
    redisClient.llen(DEAD_LETTER_QUEUE),
    redisClient.scard(WORKERS_SET),
    redisClient.get(METRICS.JOBS_WAITING),
    redisClient.get(METRICS.JOBS_PROCESSING),
    redisClient.get(METRICS.JOBS_RETRYING),
    redisClient.get(METRICS.JOBS_COMPLETED),
    redisClient.get(METRICS.JOBS_FAILED),
    redisClient.get(METRICS.TOTAL_PROCESSING_TIME_MS),
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
    deadLetterQueueLength,
    jobsCompleted: completedCount,
    jobsFailed: Number(jobsFailed) || 0,
    jobsWaiting: Number(jobsWaiting) || 0,
    jobsProcessing: Number(jobsProcessing) || 0,
    jobsRetrying: Number(jobsRetrying) || 0,
    workersRunning,
    averageProcessingTimeMs,
    health: {
      redis: redisStatus,
      workerCount: workersRunning,
    },
  };
}

module.exports = { getMetrics };