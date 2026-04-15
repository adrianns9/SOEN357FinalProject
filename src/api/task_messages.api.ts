import { CreateTaskMessageSchema, TaskMessageSchema, UpdateTaskMessageSchema } from '@/schemas';
import { createCrudApi } from './crudFactory';

const crudApi = createCrudApi({
  collection: 'task_messages',
  outputSchema: TaskMessageSchema,
  createSchema: CreateTaskMessageSchema,
  updateSchema: UpdateTaskMessageSchema,
});

export const taskMessagesApi = {
  ...crudApi,
};
