import {
  CreateDirectMessageSchema,
  DirectMessageSchema,
  UpdateDirectMessageSchema,
} from '@/schemas';
import { createCrudApi } from './crudFactory';

export const directMessagesApi = createCrudApi({
  collection: 'direct_messages',
  outputSchema: DirectMessageSchema,
  createSchema: CreateDirectMessageSchema,
  updateSchema: UpdateDirectMessageSchema,
});
