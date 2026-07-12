const express = require('express');
const enqueueRoute = require('./routes/enqueue.route');
const jobRoute = require('./routes/jobs.route');

const app = express();
app.use(express.json());
app.use('/', enqueueRoute);
app.use('/', jobRoute);

module.exports = app;