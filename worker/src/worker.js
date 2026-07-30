require('dotenv').config();
const {
  waitForJobId,
  getJob,
  markProcessing,
  markCompleted,
  handleJobFailure,
} = require('./services/queue.service');
const logger = require('./utils/logger');

// Worker ID comes from an env var (so each terminal/instance can set its own),
// falling back to a random suffix if not provided.
const WORKER_ID = process.env.WORKER_ID || `worker-${Math.floor(Math.random() * 10000)}`;

function simulateRandomFailure() {
  if (Math.random() < 0.4) {
    throw new Error('Simulated transient failure (demo)');
  }
}

async function processJob(job) {
  logger.info({ workerId: WORKER_ID, jobId: job.id, type: job.type }, `Worker ${WORKER_ID} processing job ${job.id}`);

  simulateRandomFailure();

  await new Promise((resolve) => setTimeout(resolve, 500));
  logger.info({ workerId: WORKER_ID, jobId: job.id }, 'Job finished');
}

async function runWorker() {
  logger.info(`Worker ${WORKER_ID} started, waiting for jobs...`);
  while (true) {
    try {
      const jobId = await waitForJobId();
      if (!jobId) continue;

      const job = await getJob(jobId);
      if (!job) {
        logger.warn({ jobId }, 'Job ID popped from queue but no metadata found — skipping');
        continue;
      }

      await markProcessing(jobId, WORKER_ID);

      try {
        await processJob(job);
        await markCompleted(jobId);
      } catch (jobError) {
        const result = await handleJobFailure(job, jobError);
        if (result.retrying) {
          logger.warn(
            { workerId: WORKER_ID, jobId: job.id, retryCount: job.retryCount + 1, delay: result.delay },
            'Job failed, scheduled for retry'
          );
        } else {
          logger.error({ workerId: WORKER_ID, jobId: job.id }, 'Job failed permanently — moved to DLQ');
        }
      }
    } catch (err) {
      logger.error({ err, workerId: WORKER_ID }, 'Error while processing job');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

runWorker();