const express = require('express');
const enqueueRoute = require('./routes/enqueue.route');
const jobRoute = require('./routes/jobs.route');
const jobsRoute = require('./routes/jobs.route');
const dlqRoute = require('./routes/dlq.route');
const metricsRoute = require('./routes/metrics.route');
const workersRoute = require('./routes/workers.route');

const app = express();
app.use(express.json());

// CORS: the dashboard runs on a different origin/port (Vite dev server),
// so the producer needs to allow cross-origin requests from it.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/', enqueueRoute);
app.use('/', jobRoute);
app.use('/', jobsRoute);
app.use('/', dlqRoute);
app.use('/', metricsRoute);
app.use('/', workersRoute);

module.exports = app;