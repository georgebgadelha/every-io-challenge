import { Request, Response, NextFunction } from 'express';
import { getUserOrThrow } from '../utils/users';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(400).json({ error: 'Missing X-User-Id header' });
      return;
    }

    try {
      getUserOrThrow(userId);
    } catch (error) {
      res.status(401).json({ error: 'Invalid user' });
      return;
    }

    req.userId = userId;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
