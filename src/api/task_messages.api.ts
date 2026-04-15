import {
  CreateTaskMessageSchema,
  TaskMessageExpandedSchema,
  UpdateTaskMessageSchema,
} from '@/schemas';
import { createCrudApi } from './crudFactory';

const crudApi = createCrudApi({
  collection: 'task_messages',
  outputSchema: TaskMessageExpandedSchema,
  createSchema: CreateTaskMessageSchema,
  updateSchema: UpdateTaskMessageSchema,
});

export const taskMessagesApi = {
  ...crudApi,
};
