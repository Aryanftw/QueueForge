const { listDlqJobIds, getDlqJob, replayJob } = require('../services/dlq.service');
const logger = require('../utils/logger');

async function handleListDlq(req, res) {
  try {
    const jobIds = await listDlqJobIds();
    return res.status(200).json({ count: jobIds.length, jobIds });
  } catch (err) {
    logger.error({ err }, 'Failed to list DLQ');
    return res.status(500).json({ error: 'Failed to list DLQ' });
  }
}

async function handleGetDlqJob(req, res) {
  const { id } = req.params;
  try {
    const job = await getDlqJob(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    return res.status(200).json(job);
  } catch (err) {
    logger.error({ err, jobId: id }, 'Failed to fetch DLQ job');
    return res.status(500).json({ error: 'Failed to fetch job' });
  }
}

async function handleReplayJob(req, res) {
  const { id } = req.params;
  try {
    const result = await replayJob(id);

    if (!result.success && result.reason === 'not_found') {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (!result.success && result.reason === 'not_in_dlq') {
      return res.status(409).json({ error: 'Job is not currently in the Dead Letter Queue' });
    }

    return res.status(200).json({ success: true, message: 'Job re-queued for processing' });
  } catch (err) {
    logger.error({ err, jobId: id }, 'Failed to replay job');
    return res.status(500).json({ error: 'Failed to replay job' });
  }
}

module.exports = { handleListDlq, handleGetDlqJob, handleReplayJob };