import type { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(
    { context: { error: err.message, stack: err.stack, method: req.method, path: req.path } },
    'Request error'
  );

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  logger.debug(
    { context: { method: req.method, path: req.path, query: req.query } },
    'Incoming request'
  );
  next();
};

