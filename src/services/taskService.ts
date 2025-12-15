import taskRepository from '../repositories/taskRepository';
import { CreateTaskRequest, UpdateTaskRequest, TaskResponse } from '../validators/taskValidators';
import logger from '../utils/logger';

export const taskService = {
  /**
   * List all tasks for a specific user
   * @param userId - The user ID
   * @returns Array of tasks belonging to the user
   */
  async listTasks(userId: string): Promise<TaskResponse[]> {
    logger.debug('Fetching tasks from repository', { userId }, 'TaskService');
    
    const tasks = await taskRepository.findAllByUserId(userId);
    
    logger.debug('Tasks fetched', { userId, count: tasks.length }, 'TaskService');
    return tasks as TaskResponse[];
  },

  /**
   * Create a new task for a user
   * @param userId - The user ID (owner)
   * @param data - Task creation data
   * @returns The created task
   */
  async createTask(userId: string, data: CreateTaskRequest): Promise<TaskResponse> {
    logger.info('Creating new task', { userId, title: data.title }, 'TaskService');
    
    try {
      const task = await taskRepository.create({
        userId,
        title: data.title,
        description: data.description,
        status: data.status,
      });
      
      logger.info('Task created', { userId, taskId: task.id, status: task.status }, 'TaskService');
      return task as TaskResponse;
    } catch (error) {
      logger.error('Failed to create task', { userId, error: String(error) }, 'TaskService');
      throw error;
    }
  },

  /**
   * Get a specific task (with authorization check)
   * @param taskId - The task ID
   * @param userId - The requesting user ID (for authorization)
   * @returns The task if authorized
   * @throws Error if task doesn't exist or user is not authorized
   */
  async getTask(taskId: string, userId: string): Promise<TaskResponse> {
    logger.debug('Fetching task', { taskId, userId }, 'TaskService');
    
    const task = await taskRepository.findById(taskId);

    if (!task) {
      logger.warn('Task not found', { taskId, userId }, 'TaskService');
      const error = new Error(`Task ${taskId} not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    if (task.deletedAt) {
      logger.warn('Task is soft deleted', { taskId, userId }, 'TaskService');
      const error = new Error(`Task ${taskId} not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    if (task.userId !== userId) {
      logger.warn('Unauthorized access attempt', { taskId, userId, taskOwner: task.userId }, 'TaskService');
      const error = new Error('You do not have permission to access this task');
      (error as any).statusCode = 403;
      throw error;
    }

    logger.debug('Task retrieved', { taskId, userId }, 'TaskService');
    return task as TaskResponse;
  },

  /**
   * Update a task (with authorization check)
   * @param taskId - The task ID
   * @param userId - The requesting user ID (for authorization)
   * @param data - Partial task update data
   * @returns The updated task
   * @throws Error if task doesn't exist or user is not authorized
   */
  async updateTask(
    taskId: string,
    userId: string,
    data: UpdateTaskRequest
  ): Promise<TaskResponse> {
    logger.debug('Updating task', { taskId, userId, updates: Object.keys(data) }, 'TaskService');
    
    const task = await taskRepository.findById(taskId);

    if (!task) {
      logger.warn('Task not found for update', { taskId, userId }, 'TaskService');
      const error = new Error(`Task ${taskId} not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    if (task.deletedAt) {
      logger.warn('Cannot update soft deleted task', { taskId, userId }, 'TaskService');
      const error = new Error(`Task ${taskId} not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    if (task.userId !== userId) {
      logger.warn('Unauthorized update attempt', { taskId, userId, taskOwner: task.userId }, 'TaskService');
      const error = new Error('You do not have permission to modify this task');
      (error as any).statusCode = 403;
      throw error;
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    logger.info('Task being updated', { taskId, userId, changes: updateData }, 'TaskService');
    
    try {
      const updatedTask = await taskRepository.update(taskId, updateData);
      
      logger.info('Task updated successfully', { taskId, userId, newStatus: updatedTask.status }, 'TaskService');
      return updatedTask as TaskResponse;
    } catch (error) {
      logger.error('Failed to update task', { taskId, userId, error: String(error) }, 'TaskService');
      throw error;
    }
  },

  /**
   * Delete a task (with authorization check)
   * @param taskId - The task ID
   * @param userId - The requesting user ID (for authorization)
   * @throws Error if task doesn't exist or user is not authorized
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    logger.debug('Deleting task', { taskId, userId }, 'TaskService');
    
    const task = await taskRepository.findById(taskId);

    if (!task) {
      logger.warn('Task not found for deletion', { taskId, userId }, 'TaskService');
      const error = new Error(`Task ${taskId} not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    if (task.deletedAt) {
      logger.warn('Task already soft deleted', { taskId, userId }, 'TaskService');
      const error = new Error(`Task ${taskId} not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    if (task.userId !== userId) {
      logger.warn('Unauthorized deletion attempt', { taskId, userId, taskOwner: task.userId }, 'TaskService');
      const error = new Error('You do not have permission to delete this task');
      (error as any).statusCode = 403;
      throw error;
    }

    logger.info('Task being deleted (soft delete)', { taskId, userId }, 'TaskService');
    
    try {
      await taskRepository.delete(taskId);
      
      logger.info('Task deleted successfully (soft delete)', { taskId, userId }, 'TaskService');
    } catch (error) {
      logger.error('Failed to delete task', { taskId, userId, error: String(error) }, 'TaskService');
      throw error;
    }
  },
};
