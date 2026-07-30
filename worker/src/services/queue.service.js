const { blockingClient, commandClient } = require('../config/redisClient');
const { MAIN_QUEUE, DEAD_LETTER_QUEUE, jobKey } = require('../../../shared/constants');
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

async function markProcessing(jobId, workerId) {
  await commandClient.hset(jobKey(jobId), {
    status: 'processing',
    startedAt: new Date().toISOString(),
    workerId,
  });
}

async function markCompleted(jobId) {
  await commandClient.hset(jobKey(jobId), {
    status: 'completed',
    completedAt: new Date().toISOString(),
    workerId: '', // job is no longer owned by anyone once finished
  });
}

async function handleJobFailure(job, error) {
  const newRetryCount = job.retryCount + 1;

  await commandClient.hset(jobKey(job.id), {
    retryCount: newRetryCount,
    lastError: error.message || String(error),
  });

  if (newRetryCount < job.maxRetries) {
    // Still owned by no one while it waits to be re-picked-up — any worker may take it next.
    await commandClient.hset(jobKey(job.id), { status: 'retrying', workerId: '' });

    const delay = BASE_DELAY_MS * Math.pow(2, newRetryCount - 1);
    setTimeout(async () => {
      await commandClient.lpush(MAIN_QUEUE, job.id);
    }, delay);

    return { retrying: true, delay };
  }

  await commandClient.hset(jobKey(job.id), { status: 'failed', workerId: '' });
  await commandClient.lpush(DEAD_LETTER_QUEUE, job.id);

  return { retrying: false };
}

module.exports = { waitForJobId, getJob, markProcessing, markCompleted, handleJobFailure };