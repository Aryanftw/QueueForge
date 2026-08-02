const express = require('express');
const { handleListJobs } = require('../controllers/jobs.controller');

const router = express.Router();
router.get('/jobs', handleListJobs);

module.exports = router;