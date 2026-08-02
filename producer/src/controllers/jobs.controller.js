const { listAllJobs } = require('../services/jobs.services');
const logger = require('../utils/logger');

async function handleListJobs(req, res) {
  try {
    const jobs = await listAllJobs();
    return res.status(200).json({ count: jobs.length, jobs });
  } catch (err) {
    logger.error({ err }, 'Failed to list jobs');
    return res.status(500).json({ error: 'Failed to list jobs' });
  }
}

module.exports = { handleListJobs };