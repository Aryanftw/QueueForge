const express = require('express');
const { handleEnqueue } = require('../controllers/enqueue.controller');

const router = express.Router();
router.post('/enqueue', handleEnqueue);

module.exports = router;