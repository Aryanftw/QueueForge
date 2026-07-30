const { blockingClient, commandClient } = require('../config/redisClient');
const { MAIN_QUEUE, DEAD_LETTER_QUEUE, METRICS, jobKey } = require('../../../shared/constants');
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

// previousStatus tells us which counter to decrement: "waiting" (first attempt)
// or "retrying" (re-attempt after backoff). Returns the startedAt timestamp it
// wrote, so the caller can pass the SAME value into markCompleted later —
// avoids re-reading a stale Hash value.
async function markProcessing(jobId, workerId, previousStatus) {
  const startedAt = new Date().toISOString();

  await commandClient.hset(jobKey(jobId), {
    status: 'processing',
    startedAt,
    workerId,
  });

  if (previousStatus === 'retrying') {
    await commandClient.decr(METRICS.JOBS_RETRYING);
  } else {
    await commandClient.decr(METRICS.JOBS_WAITING);
  }
  await commandClient.incr(METRICS.JOBS_PROCESSING);

  return startedAt;
}

async function markCompleted(jobId, startedAt) {
  const completedAt = new Date().toISOString();

  await commandClient.hset(jobKey(jobId), {
    status: 'completed',
    completedAt,
    workerId: '',
  });

  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();

  await commandClient.decr(METRICS.JOBS_PROCESSING);
  await commandClient.incr(METRICS.JOBS_COMPLETED);
  await commandClient.incrby(METRICS.TOTAL_PROCESSING_TIME_MS, durationMs);
}

async function handleJobFailure(job, error) {
  const newRetryCount = job.retryCount + 1;

  await commandClient.hset(jobKey(job.id), {
    retryCount: newRetryCount,
    lastError: error.message || String(error),
  });

  if (newRetryCount < job.maxRetries) {
    await commandClient.hset(jobKey(job.id), { status: 'retrying', workerId: '' });
    await commandClient.decr(METRICS.JOBS_PROCESSING);
    await commandClient.incr(METRICS.JOBS_RETRYING);

    const delay = BASE_DELAY_MS * Math.pow(2, newRetryCount - 1);
    setTimeout(async () => {
      await commandClient.lpush(MAIN_QUEUE, job.id);
    }, delay);

    return { retrying: true, delay };
  }

  await commandClient.hset(jobKey(job.id), { status: 'failed', workerId: '' });
  await commandClient.lpush(DEAD_LETTER_QUEUE, job.id);

  await commandClient.decr(METRICS.JOBS_PROCESSING);
  await commandClient.incr(METRICS.JOBS_FAILED);

  return { retrying: false };
}

module.exports = { waitForJobId, getJob, markProcessing, markCompleted, handleJobFailure };