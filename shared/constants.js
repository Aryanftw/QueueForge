// shared/constants.js
const MAIN_QUEUE = 'queueforge:main';

// Builds the Redis Hash key for a given job ID.
// Centralized so producer, worker, and status endpoint never disagree on the pattern.
function jobKey(jobId) {
  return `job:${jobId}`;
}

module.exports = { MAIN_QUEUE, jobKey };