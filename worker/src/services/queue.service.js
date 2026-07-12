const redisClient = require('../config/redisClient');
const { MAIN_QUEUE, jobKey } = require('../../../shared/constants');

// Blocks until a job ID is available on the queue.
async function waitForJobId() {
  const result = await redisClient.brpop(MAIN_QUEUE, 0);
  if (!result) return null;
  const [, jobId] = result;
  return jobId;
}

// Fetches full job metadata from its Hash and parses the payload back into an object.
async function getJob(jobId) {
  const job = await redisClient.hgetall(jobKey(jobId));
  if (!job || Object.keys(job).length === 0) return null;
  return { ...job, payload: JSON.parse(job.payload) };
}

// Marks a job as processing, recording when it started.
async function markProcessing(jobId) {
  await redisClient.hset(jobKey(jobId), {
    status: 'processing',
    startedAt: new Date().toISOString(),
  });
}

// Marks a job as completed, recording when it finished.
async function markCompleted(jobId) {
  await redisClient.hset(jobKey(jobId), {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

module.exports = { waitForJobId, getJob, markProcessing, markCompleted };