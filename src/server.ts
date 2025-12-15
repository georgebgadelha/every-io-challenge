import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { formatUptime } from './utils/timeHelper';
import { authMiddleware } from './middleware/auth';
import { loggerMiddleware } from './middleware/logger';
import { createTaskRoutes } from './routes/taskRoutes';
import logger from './utils/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

app.use(express.json());
app.use(loggerMiddleware);

app.get('/health', (_req: Request, res: Response) => {
  const uptime = Math.floor((Date.now() - START_TIME) / 1000);
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime),
    },
  });
});

app.use(authMiddleware);

app.use('/api/v1/tasks', createTaskRoutes());

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// To handle next(error) or throws in async routes
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = (err as any).statusCode || 500;

  logger.error('Request error', {
    message: err.message,
    statusCode,
    stack: err.stack,
  }, 'ERROR_HANDLER');

  res.status(statusCode).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  logger.info(`Server running at port ${PORT}`);
});

export default app;
