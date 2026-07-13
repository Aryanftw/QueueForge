const { blockingClient, commandClient } = require('../config/redisClient');
const { MAIN_QUEUE, jobKey } = require('../../../shared/constants');
const { BASE_DELAY_MS } = require('../../../shared/retryConfig');

async function waitForJobId() {
  const result = await blockingClient.brpop(MAIN_QUEUE, 0);
  if (!result) return null;
  const [, jobId] = result;
  return jobId;
}

async function getJob(jobId) {
  const job = await commandClient.hgetall(jobKey(jobId));
  if (!job || Object.keys(job).length === 0) return null;
  return {
    ...job,
    payload: JSON.parse(job.payload),
    retryCount: Number(job.retryCount),
    maxRetries: Number(job.maxRetries),
  };
}

async function markProcessing(jobId) {
  await commandClient.hset(jobKey(jobId), {
    status: 'processing',
    startedAt: new Date().toISOString(),
  });
}

async function markCompleted(jobId) {
  await commandClient.hset(jobKey(jobId), {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

async function handleJobFailure(job, error) {
  const newRetryCount = job.retryCount + 1;

  await commandClient.hset(jobKey(job.id), {
    retryCount: newRetryCount,
    lastError: error.message || String(error),
  });

  if (newRetryCount < job.maxRetries) {
    await commandClient.hset(jobKey(job.id), { status: 'retrying' });

    const delay = BASE_DELAY_MS * Math.pow(2, newRetryCount - 1);
    setTimeout(async () => {
      // This now runs on the command connection, not the blocked one — no deadlock.
      await commandClient.lpush(MAIN_QUEUE, job.id);
    }, delay);

    return { retrying: true, delay };
  }

  await commandClient.hset(jobKey(job.id), { status: 'failed' });
  return { retrying: false };
}

module.exports = { waitForJobId, getJob, markProcessing, markCompleted, handleJobFailure };