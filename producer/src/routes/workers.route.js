const express = require('express');
const { handleGetWorkers } = require('../controllers/workers.controller');

const router = express.Router();
router.get('/workers', handleGetWorkers);

module.exports = router;