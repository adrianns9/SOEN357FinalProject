import { CreateTaskSchema, TaskSchema, UpdateTaskSchema } from '@/schemas';
import { createCrudApi } from './crudFactory';

const crudApi = createCrudApi({
  collection: 'tasks',
  outputSchema: TaskSchema,
  createSchema: CreateTaskSchema,
  updateSchema: UpdateTaskSchema,
});

export const tasksApi = {
  ...crudApi,
  getByProject: (projectId: string) =>
    crudApi.getList({
      filter: `project="${projectId}"`,
      sort: '-created',
    }),
};
