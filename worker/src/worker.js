require('dotenv').config();
const {
  waitForJobId,
  getJob,
  markProcessing,
  markCompleted,
  handleJobFailure,
} = require('./services/queue.service');
const { registerWorker, deregisterWorker, updateWorkerActivity } = require('./services/registry.services');
const logger = require('./utils/logger');

const WORKER_ID = process.env.WORKER_ID || `worker-${Math.floor(Math.random() * 10000)}`;
let shuttingDown = false;

function simulateRandomFailure() {
  if (Math.random() < 0.4) {
    throw new Error('Simulated transient failure (demo)');
  }
}

async function processJob(job) {
  logger.info(
    { workerId: WORKER_ID, jobId: job.id, type: job.type },
    `Worker ${WORKER_ID} processing job ${job.id}`
  );
  simulateRandomFailure();
  await new Promise((resolve) => setTimeout(resolve, 500));
  logger.info({ workerId: WORKER_ID, jobId: job.id }, 'Job finished');
}

async function runWorker() {
  await registerWorker(WORKER_ID);
  logger.info(`Worker ${WORKER_ID} started, waiting for jobs...`);

  while (!shuttingDown) {
    try {
      const jobId = await waitForJobId();
      if (!jobId) continue;

      const job = await getJob(jobId);
      if (!job) {
        logger.warn({ jobId }, 'Job ID popped from queue but no metadata found — skipping');
        continue;
      }

      const startedAt = await markProcessing(jobId, WORKER_ID, job.status);
      await updateWorkerActivity(WORKER_ID, 'processing', job.id);

      try {
        await processJob(job);
        await markCompleted(jobId, startedAt);
        await updateWorkerActivity(WORKER_ID, 'idle', '');
      } catch (jobError) {
        const result = await handleJobFailure(job, jobError);
        await updateWorkerActivity(WORKER_ID, 'idle', '');

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

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ workerId: WORKER_ID, signal }, 'Worker shutting down gracefully');
  await deregisterWorker(WORKER_ID);
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

runWorker();