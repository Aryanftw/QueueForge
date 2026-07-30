const { getMetrics } = require('../services/metrics.service');
const logger = require('../utils/logger');

async function handleGetMetrics(req, res) {
  try {
    const metrics = await getMetrics();
    return res.status(200).json(metrics);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch metrics');
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}

module.exports = { handleGetMetrics };