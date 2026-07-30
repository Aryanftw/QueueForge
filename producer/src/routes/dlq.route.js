const express = require('express');
const { handleListDlq, handleGetDlqJob, handleReplayJob } = require('../controllers/dlq.controller');

const router = express.Router();
router.get('/dlq', handleListDlq);
router.get('/dlq/:id', handleGetDlqJob);
router.post('/dlq/:id/retry', handleReplayJob);

module.exports = router;