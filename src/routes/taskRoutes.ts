import { Router } from 'express';
import { taskController } from '../controllers/taskController';

export function createTaskRoutes(): Router {
  const router = Router();

  // Future TODO: Add Swagger/OpenAPI documentation comments here

  router.get('/', taskController.listTasks);

  router.post('/', taskController.createTask);

  router.get('/:id', taskController.getTask);

  router.patch('/:id', taskController.updateTask);

  router.delete('/:id', taskController.deleteTask);

  return router;
}
