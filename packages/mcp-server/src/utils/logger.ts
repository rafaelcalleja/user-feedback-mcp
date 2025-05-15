import * as winston from "winston";

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create a no-op logger that doesn't output anything
const logger = winston.createLogger({
  levels: logLevels,
  silent: true, // Completely disable all logging
  transports: [],
});

export default logger;
