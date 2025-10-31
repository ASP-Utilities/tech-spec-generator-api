import { setupLogging } from '@asp-utilities/tooling-node-logger';

// Set service name
process.env.SERVICE_NAME = process.env.SERVICE_NAME || 'tech-spec-generator-api';

// Configure log level based on environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Initialize logger with configuration
const logger = setupLogging({
  level: logLevel,
  serviceName: process.env.SERVICE_NAME,
  base: {
    application: 'tech-spec-generator',
    version: '1.0.0',
  },
});

export default logger;

