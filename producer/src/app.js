const express = require('express');
const enqueueRoute = require('./routes/enqueue.route');
const jobRoute = require('./routes/job.route');
const dlqRoute = require('./routes/dlq.route');
const metricsRoute = require('./routes/metrics.route');

const app = express();
app.use(express.json());
app.use('/', enqueueRoute);
app.use('/', jobRoute);
app.use('/', dlqRoute);
app.use('/', metricsRoute);

module.exports = app;