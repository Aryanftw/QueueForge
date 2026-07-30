// shared/constants.js
const MAIN_QUEUE = 'queueforge:main';
const DEAD_LETTER_QUEUE = 'queueforge:dlq';
const WORKERS_SET = 'queueforge:workers';

// Metrics counters — all plain Redis strings holding integers, updated via INCR/DECR.
const METRICS = {
  JOBS_WAITING: 'metrics:jobsWaiting',
  JOBS_PROCESSING: 'metrics:jobsProcessing',
  JOBS_RETRYING: 'metrics:jobsRetrying',
  JOBS_COMPLETED: 'metrics:jobsCompleted',
  JOBS_FAILED: 'metrics:jobsFailed',
  TOTAL_PROCESSING_TIME_MS: 'metrics:totalProcessingTimeMs',
};

function jobKey(jobId) {
  return `job:${jobId}`;
}

module.exports = { MAIN_QUEUE, DEAD_LETTER_QUEUE, WORKERS_SET, METRICS, jobKey };