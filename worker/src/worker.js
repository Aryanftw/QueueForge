require('dotenv').config();
const { waitForJobId, getJob, markProcessing, markCompleted } = require('./services/queue.service');
const logger = require('./utils/logger');

async function processJob(job) {
  logger.info({ jobId: job.id, type: job.type, payload: job.payload }, 'Processing job');
  await new Promise((resolve) => setTimeout(resolve, 500)); // simulate work
  logger.info({ jobId: job.id }, 'Job finished');
}

async function runWorker() {
  logger.info('Worker started, waiting for jobs...');
  while (true) {
    try {
      const jobId = await waitForJobId();
      if (!jobId) continue;

      const job = await getJob(jobId);
      if (!job) {
        logger.warn({ jobId }, 'Job ID popped from queue but no metadata found — skipping');
        continue;
      }

      await markProcessing(jobId);
      await processJob(job);
      await markCompleted(jobId);
    } catch (err) {
      logger.error({ err }, 'Error while processing job');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

runWorker();