const express = require('express');
const enqueueRoute = require('./routes/enqueue.route');

const app = express();
app.use(express.json());
app.use('/', enqueueRoute);

module.exports = app;