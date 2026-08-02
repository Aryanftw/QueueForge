require('dotenv').config();
const { promoteDueJobs } = require('./services/promoter.service');
const logger = require('./utils/logger');
const { SCHEDULER_POLL_INTERVAL_MS } = require('../../shared/schedulerConfig');

let running = true;

async function tick() {
  try {
    const { promoted } = await promoteDueJobs();
    if (promoted > 0) {
      logger.info({ promoted }, `Promoted ${promoted} due job(s) to main queue`);
    }
  } catch (err) {
    logger.error({ err }, 'Error while promoting due jobs');
  }
}

async function runScheduler() {
  logger.info(`Scheduler started, polling every ${SCHEDULER_POLL_INTERVAL_MS}ms`);
  while (running) {
    await tick();
    await new Promise((resolve) => setTimeout(resolve, SCHEDULER_POLL_INTERVAL_MS));
  }
}

function shutdown(signal) {
  logger.info({ signal }, 'Scheduler shutting down');
  running = false;
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

runScheduler();