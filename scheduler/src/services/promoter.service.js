const redisClient = require('../config/redisClient');
const { DELAYED_QUEUE, MAIN_QUEUE } = require('../../../shared/constants');

// Finds every job whose scheduled time has arrived and atomically moves
// each one from the Delayed Queue into the Main Queue.
async function promoteDueJobs() {
  const now = Date.now();

  // ZRANGEBYSCORE with max = now: only jobs whose "eligible at" timestamp
  // has already passed. O(log N + M) — cheap even as the delayed set grows,
  // since Redis can seek directly to the score range instead of scanning everything.
  const dueJobIds = await redisClient.zrangebyscore(DELAYED_QUEUE, '-inf', now);

  if (dueJobIds.length === 0) return { promoted: 0 };

  let promotedCount = 0;

  for (const jobId of dueJobIds) {
    // ZREM returns the count of elements actually removed. If it's 1, THIS
    // call genuinely claimed the promotion. If it's 0, something else already
    // removed it (e.g., a second Scheduler instance, in a future multi-instance
    // setup) — so we skip it rather than promoting it a second time.
    const removed = await redisClient.zrem(DELAYED_QUEUE, jobId);
    if (removed === 0) continue;

    // Re-enter the priority queue via the job's own priority + a fresh
    // timestamp, exactly like a normal retry re-entry from Phase 7.
    const job = await redisClient.hgetall(`job:${jobId}`);
    const priority = job && job.priority ? Number(job.priority) : 5;
    const score = priority * 1e13 + Date.now();

    await redisClient.zadd(MAIN_QUEUE, score, jobId);
    promotedCount++;
  }

  return { promoted: promotedCount };
}

module.exports = { promoteDueJobs };