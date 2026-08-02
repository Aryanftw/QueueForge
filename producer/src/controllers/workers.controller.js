const { listWorkers } = require('../services/workers.service');
const logger = require('../utils/logger');

async function handleGetWorkers(req, res) {
  try {
    const workers = await listWorkers();
    return res.status(200).json({ count: workers.length, workers });
  } catch (err) {
    logger.error({ err }, 'Failed to list workers');
    return res.status(500).json({ error: 'Failed to list workers' });
  }
}

module.exports = { handleGetWorkers };