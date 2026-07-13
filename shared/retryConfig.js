// shared/retryConfig.js
module.exports = {
  DEFAULT_MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000, // 1s, 2s, 4s... via baseDelay * 2^retryCount
};