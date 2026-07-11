require('dotenv').config();
const { waitForJob } = require('./services/queue.service');
const logger = require('./utils/logger');

async function processJob(job) {
  // Phase 1: just prove the pipeline works end to end.
  // Real task execution (handler registry) comes in a later phase.
  logger.info({ jobId: job.id, type: job.type, payload: job.payload }, 'Processing job');
  await new Promise((resolve) => setTimeout(resolve, 500)); // simulate work
  logger.info({ jobId: job.id }, 'Job finished');
}

async function runWorker() {
  logger.info('Worker started, waiting for jobs...');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const job = await waitForJob();
      if (job) {
        await processJob(job);
      }
    } catch (err) {
      logger.error({ err }, 'Error while processing job');
      // Small delay so a persistent error doesn't spin-loop the CPU
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

runWorker();