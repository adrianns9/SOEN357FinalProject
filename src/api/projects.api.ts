import { CreateProjectSchema, ProjectExpandedSchema, UpdateProjectSchema } from '@/schemas';
import { createCrudApi } from './crudFactory';

export const projectsApi = createCrudApi({
  collection: 'projects',
  outputSchema: ProjectExpandedSchema,
  createSchema: CreateProjectSchema,
  updateSchema: UpdateProjectSchema,
});
