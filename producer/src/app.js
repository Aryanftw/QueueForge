const express = require('express');
const enqueueRoute = require('./routes/enqueue.route');
const jobRoute = require('./routes/jobs.route');
const dlqRoute = require('./routes/dlq.route');

const app = express();
app.use(express.json());
app.use('/', enqueueRoute);
app.use('/', jobRoute);
app.use('/', dlqRoute);

module.exports = app;