const express = require('express');
const { handleGetMetrics } = require('../controllers/metrics.controller');

const router = express.Router();
router.get('/metrics', handleGetMetrics);

module.exports = router;