const redisClient = require('../config/redisClient');
const { jobKey } = require('../../../shared/constants');
const logger = require('../utils/logger');

async function handleGetJobStatus(req, res) {
  const { id } = req.params;

  try {
    const job = await redisClient.hgetall(jobKey(id));

    if (!job || Object.keys(job).length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.status(200).json({
      ...job,
      payload: JSON.parse(job.payload),
    });
  } catch (err) {
    logger.error({ err, jobId: id }, 'Failed to fetch job status');
    return res.status(500).json({ error: 'Failed to fetch job status' });
  }
}

module.exports = { handleGetJobStatus };