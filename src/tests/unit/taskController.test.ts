import { Request, Response, NextFunction } from 'express';
import { taskController } from '../../controllers/taskController';
import { taskService } from '../../services/taskService';

jest.mock('../../services/taskService');

describe('TaskController - Schema Validation', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      userId: 'user-1',
      body: {},
      params: {},
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createTask - Schema Validation', () => {
    it('should accept valid createTask schema and return 201', async () => {
      const mockTask = {
        id: 'task-1',
        userId: 'user-1',
        title: 'Valid Task',
        description: 'Valid Description',
        status: 'TODO',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (taskService.createTask as jest.Mock).mockResolvedValue(mockTask);

      mockReq.body = {
        title: 'Valid Task',
        description: 'Valid Description',
      };

      await taskController.createTask(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(taskService.createTask).toHaveBeenCalled();
    });

    it('should reject invalid createTask schema and return 400', async () => {
      mockReq.body = {
        title: '',
        description: 'Valid Description',
      };

      await taskController.createTask(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Validation failed' })
      );
    });
  });

  describe('updateTask - Schema Validation', () => {
    it('should accept valid updateTask schema', async () => {
      const mockTask = {
        id: 'task-1',
        userId: 'user-1',
        title: 'Updated',
        description: 'Updated',
        status: 'IN_PROGRESS',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (taskService.updateTask as jest.Mock).mockResolvedValue(mockTask);

      mockReq.body = { status: 'IN_PROGRESS' };
      mockReq.params = { id: 'task-1' };

      await taskController.updateTask(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockTask);
      expect(taskService.updateTask).toHaveBeenCalled();
    });

    it('should reject invalid updateTask schema and return 400', async () => {
      mockReq.body = { status: 'INVALID_STATUS' };
      mockReq.params = { id: 'task-1' };

      await taskController.updateTask(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Validation failed' })
      );
    });
  });
});
