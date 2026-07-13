require('dotenv').config();
const {
  waitForJobId,
  getJob,
  markProcessing,
  markCompleted,
  handleJobFailure,
} = require('./services/queue.service');
const logger = require('./utils/logger');

// --- DEMO CODE: simulates transient failures so retries are observable. ---
// Remove this block once you're done testing Phase 3's retry behavior.
function simulateRandomFailure() {
  if (Math.random() < 0.4) {
    throw new Error('Simulated transient failure (demo)');
  }
}
// --- END DEMO CODE ---

async function processJob(job) {
  logger.info({ jobId: job.id, type: job.type, payload: job.payload }, 'Processing job');

  simulateRandomFailure(); // demo only — see above

  await new Promise((resolve) => setTimeout(resolve, 500));
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

      try {
        await processJob(job);
        await markCompleted(jobId);
      } catch (jobError) {
        const result = await handleJobFailure(job, jobError);
        if (result.retrying) {
          logger.warn(
            { jobId: job.id, retryCount: job.retryCount + 1, delay: result.delay },
            'Job failed, scheduled for retry'
          );
        } else {
          logger.error({ jobId: job.id }, 'Job failed permanently — retries exhausted');
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error while processing job');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

runWorker();