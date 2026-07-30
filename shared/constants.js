// shared/constants.js
const MAIN_QUEUE = 'queueforge:main';
const DEAD_LETTER_QUEUE = 'queueforge:dlq';

function jobKey(jobId) {
  return `job:${jobId}`;
}

module.exports = { MAIN_QUEUE, DEAD_LETTER_QUEUE, jobKey };