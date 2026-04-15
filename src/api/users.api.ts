import { CreateUserSchema, UserSchema, UpdateUserSchema } from '@/schemas';
import { createCrudApi } from './crudFactory';

export const usersApi = createCrudApi({
  collection: 'users',
  outputSchema: UserSchema,
  createSchema: CreateUserSchema,
  updateSchema: UpdateUserSchema,
});
