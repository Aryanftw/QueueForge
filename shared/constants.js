const MAIN_QUEUE = 'queueforge:main';
const DELAYED_QUEUE = 'queueforge:delayed';
const DEAD_LETTER_QUEUE = 'queueforge:dlq';
const WORKERS_SET = 'queueforge:workers';

const DEFAULT_PRIORITY = 5;
const PRIORITY_MULTIPLIER = 1e13;

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

function computeScore(priority, timestampMs) {
  return priority * PRIORITY_MULTIPLIER + timestampMs;
}

module.exports = {
  MAIN_QUEUE,
  DELAYED_QUEUE,
  DEAD_LETTER_QUEUE,
  WORKERS_SET,
  METRICS,
  DEFAULT_PRIORITY,
  PRIORITY_MULTIPLIER,
  jobKey,
  computeScore,
};