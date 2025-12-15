import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createTaskSchema, updateTaskSchema, CreateTaskRequest, UpdateTaskRequest } from '../validators/taskValidators';
import { taskService } from '../services/taskService';
import logger from '../utils/logger';

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const taskController = {
  async listTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;

      logger.debug('Listing tasks', { userId }, 'TaskController');
      const tasks = await taskService.listTasks(userId!);
      
      logger.info('Tasks listed successfully', { userId, count: tasks.length }, 'TaskController');
      res.json(tasks);
    } catch (error) {
      logger.error('Failed to list tasks', { userId: req.userId, error: String(error) }, 'TaskController');
      next(error);
    }
  },

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;

      logger.debug('Creating task', { userId, body: req.body }, 'TaskController');

      // Validate request body
      const body = createTaskSchema.parse(req.body);

      const task = await taskService.createTask(userId!, body);
      
      logger.info('Task created successfully', { userId, taskId: task.id }, 'TaskController');
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation failed on task creation', { userId: req.userId, errors: error.errors }, 'TaskController');
        return res.status(400).json({
          error: 'Validation failed',
          issues: error.errors,
        });
      }
      logger.error('Failed to create task', { userId: req.userId, error: String(error) }, 'TaskController');
      next(error);
    }
  },

  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const taskId = req.params.id;

      logger.debug('Getting task', { userId, taskId }, 'TaskController');

      const task = await taskService.getTask(taskId, userId!);
      
      logger.info('Task retrieved successfully', { userId, taskId }, 'TaskController');
      res.json(task);
    } catch (error) {
      logger.error('Failed to get task', { userId: req.userId, taskId: req.params.id, error: String(error) }, 'TaskController');
      next(error);
    }
  },

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const taskId = req.params.id;

      logger.debug('Updating task', { userId, taskId, body: req.body }, 'TaskController');

      const body = updateTaskSchema.parse(req.body);

      if (Object.keys(body).length === 0) {
        logger.warn('Update request with no fields', { userId, taskId }, 'TaskController');
        return res.status(400).json({ error: 'No fields to update provided' });
      }

      const task = await taskService.updateTask(taskId, userId!, body);
      
      logger.info('Task updated successfully', { userId, taskId }, 'TaskController');
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation failed on task update', { userId: req.userId, taskId: req.params.id, errors: error.errors }, 'TaskController');
        return res.status(400).json({
          error: 'Validation failed',
          issues: error.errors,
        });
      }
      logger.error('Failed to update task', { userId: req.userId, taskId: req.params.id, error: String(error) }, 'TaskController');
      next(error);
    }
  },

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const taskId = req.params.id;

      logger.debug('Deleting task', { userId, taskId }, 'TaskController');

      await taskService.deleteTask(taskId, userId!);
      
      logger.info('Task deleted successfully', { userId, taskId }, 'TaskController');
      res.status(204).send();
    } catch (error) {
      logger.error('Failed to delete task', { userId: req.userId, taskId: req.params.id, error: String(error) }, 'TaskController');
      next(error);
    }
  },
};
