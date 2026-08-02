const redisClient = require('../config/redisClient');

// NOTE: uses KEYS, which is O(N) and blocks Redis while scanning. This is
// acceptable here specifically because this endpoint is only hit by an
// occasionally-polled internal dashboard page, not a hot path under load.
// If job volume grows large, replace with SCAN (cursor-based, non-blocking)
// or maintain a separate index Set of all job IDs updated at creation time.
async function listAllJobs() {
  const keys = await redisClient.keys('job:*');

  const jobs = await Promise.all(
    keys.map(async (key) => {
      const job = await redisClient.hgetall(key);
      return {
        ...job,
        payload: job.payload ? JSON.parse(job.payload) : null,
        priority: Number(job.priority),
        retryCount: Number(job.retryCount),
        maxRetries: Number(job.maxRetries),
      };
    })
  );

  // Most recent first, for a more useful default table order.
  return jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = { listAllJobs };