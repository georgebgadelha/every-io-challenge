import { prisma } from '../lib/prisma';
import { Task } from '@prisma/client';
import logger from '../utils/logger';

export interface TaskCreate {
  userId: string;
  title: string;
  description: string;
  status?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: string;
}

class TaskRepository {
  async findById(id: string): Promise<Task | null> {
    logger.debug('Querying task by id', { id }, 'TaskRepository');

    try {
      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (task?.deletedAt) {
        logger.debug('Task is soft deleted', { id }, 'TaskRepository');
        return null;
      }

      if (task) {
        logger.debug('Task found', { id }, 'TaskRepository');
      } else {
        logger.debug('Task not found', { id }, 'TaskRepository');
      }

      return task;
    } catch (error) {
      logger.error(
        'Database error in findById',
        { id, error: String(error) },
        'TaskRepository'
      );
      throw error;
    }
  }

  async findAllByUserId(userId: string): Promise<Task[]> {
    logger.debug('Querying all tasks for user', { userId }, 'TaskRepository');

    try {
      const tasks = await prisma.task.findMany({
        where: {
          userId,
          deletedAt: null, // Only non-deleted tasks
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.debug(
        'Tasks query completed',
        { userId, count: tasks.length },
        'TaskRepository'
      );
      return tasks;
    } catch (error) {
      logger.error(
        'Database error in findAllByUserId',
        { userId, error: String(error) },
        'TaskRepository'
      );
      throw error;
    }
  }

  async create(data: TaskCreate): Promise<Task> {
    logger.info(
      'Creating task in database',
      { userId: data.userId, title: data.title },
      'TaskRepository'
    );

    try {
      const task = await prisma.task.create({
        data: {
          userId: data.userId,
          title: data.title,
          description: data.description,
          status: data.status || 'TODO',
        },
      });

      logger.info(
        'Task created in database',
        { taskId: task.id, userId: data.userId },
        'TaskRepository'
      );
      return task;
    } catch (error) {
      logger.error(
        'Database error in create',
        { userId: data.userId, error: String(error) },
        'TaskRepository'
      );
      throw error;
    }
  }

  async update(id: string, data: TaskUpdate): Promise<Task> {
    logger.info(
      'Updating task in database',
      { id, changes: Object.keys(data) },
      'TaskRepository'
    );

    try {
      const task = await prisma.task.update({
        where: { id },
        data,
      });

      logger.info('Task updated in database', { id }, 'TaskRepository');
      return task;
    } catch (error) {
      logger.error(
        'Database error in update',
        { id, error: String(error) },
        'TaskRepository'
      );
      throw error;
    }
  }

  async delete(id: string): Promise<Task> {
    logger.info('Soft deleting task from database', { id }, 'TaskRepository');

    try {
      const task = await prisma.task.update({
        where: { id },
        data: { 
          status: 'ARCHIVED',
          deletedAt: new Date() 
        },
      });

      logger.info('Task soft deleted in database', { id }, 'TaskRepository');
      return task;
    } catch (error) {
      logger.error(
        'Database error in delete',
        { id, error: String(error) },
        'TaskRepository'
      );
      throw error;
    }
  }
}

export default new TaskRepository();
