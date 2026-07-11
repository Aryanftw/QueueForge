const redisClient = require('../config/redisClient');
const { MAIN_QUEUE } = require('../../../shared/constants');

/**
 * Blocks until a job is available, then returns the parsed job.
 * timeout=0 means block forever (until Redis pushes something or connection drops).
 */
async function waitForJob() {
  // BRPOP returns [queueName, value] or null on timeout
  const result = await redisClient.brpop(MAIN_QUEUE, 0);
  if (!result) return null;

  const [, rawJob] = result;
  return JSON.parse(rawJob);
}

module.exports = { waitForJob };