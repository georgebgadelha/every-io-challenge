import { taskService } from '../../services/taskService';
import taskRepository from '../../repositories/taskRepository';

jest.mock('../../repositories/taskRepository');
jest.mock('../../utils/logger');

describe('TaskService', () => {
  const mockTask = {
    id: 'task-1',
    userId: 'user-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'TODO',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listTasks', () => {
    it('should list tasks for a user', async () => {
      const tasks = [mockTask];
      (taskRepository.findAllByUserId as jest.Mock).mockResolvedValue(tasks);

      const result = await taskService.listTasks('user-1');

      expect(result).toEqual(tasks);
      expect(taskRepository.findAllByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      (taskRepository.create as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.createTask('user-1', {
        title: 'Test Task',
        description: 'Test Description',
        status: 'TODO',
      });

      expect(result).toEqual(mockTask);
    });
  });

  describe('getTask - Authorization', () => {
    it('should return task if user is owner', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.getTask('task-1', 'user-1');

      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('should update task if authorized', async () => {
      const updated = { ...mockTask, status: 'IN_PROGRESS' };
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.update as jest.Mock).mockResolvedValue(updated);

      const result = await taskService.updateTask('task-1', 'user-1', {
        status: 'IN_PROGRESS',
      });

      expect(result.status).toBe('IN_PROGRESS');
    });
  });

  describe('deleteTask - Soft Delete', () => {
    it('should soft delete if authorized', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.delete as jest.Mock).mockResolvedValue({
        ...mockTask,
        status: 'ARCHIVED',
        deletedAt: new Date(),
      });

      await taskService.deleteTask('task-1', 'user-1');

      expect(taskRepository.delete).toHaveBeenCalledWith('task-1');
    });
  });
});
