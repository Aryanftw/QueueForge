const express = require('express');
const { handleGetJobStatus } = require('../controllers/job.controller');

const router = express.Router();
router.get('/job/:id', handleGetJobStatus);

module.exports = router;