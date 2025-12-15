import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('user-agent'),
    userId: req.userId || 'unauthenticated',
  }, 'HTTP');

  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId || 'unauthenticated',
    }, 'HTTP');

    return originalSend.call(this, data);
  };

  next();
}
