const redisClient = require('../config/redisClient');
const { WORKERS_SET, workerInfoKey } = require('../../../shared/constants');

// Returns live status for every currently-registered worker.
async function listWorkers() {
  const workerIds = await redisClient.smembers(WORKERS_SET);

  const workers = await Promise.all(
    workerIds.map(async (id) => {
      const info = await redisClient.hgetall(workerInfoKey(id));
      // Defensive: a worker could be in the Set but its info Hash missing
      // (e.g., crashed uncleanly between SADD and HSET). Return a safe default.
      if (!info || Object.keys(info).length === 0) {
        return { workerId: id, status: 'unknown', currentJobId: '', lastActivity: null };
      }
      return info;
    })
  );

  return workers;
}

module.exports = { listWorkers };