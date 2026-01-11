const logger = require("./logger");

// experss response interceptor to log response details before responding
const sendResponse = (statusCode, data = null, res) => {
  logger.info(`${res.req.method} ${res.req.originalUrl} ${statusCode}`);
  return res.status(statusCode).json(data);
};

module.exports = {
  sendResponse,
};
