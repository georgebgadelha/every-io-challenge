import { z } from 'zod';

export const TaskStatusValues = ['TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED'] as const;
export const CreateTaskStatusValues = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  status: z.enum(CreateTaskStatusValues).optional().default('TODO'),
});

// Update task schema (all fields optional since we're using a PATCH request)
export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  status: z.enum(TaskStatusValues).optional(),
}).strict();

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;

export interface TaskResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: typeof TaskStatusValues[number];
  createdAt: Date;
  updatedAt: Date;
}
