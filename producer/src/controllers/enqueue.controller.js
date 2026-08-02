const { enqueueJob } = require('../services/queue.service');
const logger = require('../utils/logger');

const SUPPORTED_TYPES = ['send_email', 'generate_pdf', 'resize_image'];

async function handleEnqueue(req, res) {
  const { type, payload, priority } = req.body;

  if (!type || !SUPPORTED_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid job type. Supported types: ${SUPPORTED_TYPES.join(', ')}`,
    });
  }

  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ success: false, error: 'Payload must be a JSON object' });
  }

  if (priority !== undefined && (!Number.isInteger(priority) || priority < 1)) {
    return res.status(400).json({ success: false, error: 'priority must be a positive integer' });
  }

  try {
    const jobId = await enqueueJob({ type, payload, priority });
    return res.status(202).json({ success: true, jobId, message: 'Job queued' });
  } catch (err) {
    logger.error({ err }, 'Failed to enqueue job');
    return res.status(500).json({ success: false, error: 'Failed to enqueue job' });
  }
}

module.exports = { handleEnqueue };