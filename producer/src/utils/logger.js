const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-pretty', // human-readable logs in dev; swap for JSON in prod
    options: { colorize: true },
  },
});

module.exports = logger;