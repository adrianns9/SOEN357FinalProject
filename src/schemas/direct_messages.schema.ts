import z from 'zod';
import { BaseSchema } from './base.schema';
import { UserSchema } from './users.schema';

export const DirectMessageSchema = BaseSchema.extend({
  sender: z.string(),
  recipient: z.string(),
  content: z.string(),
});

export type DirectMessage = z.infer<typeof DirectMessageSchema>;

export const DirectMessageExpandedSchema = DirectMessageSchema.extend({
  expand: z
    .object({
      sender: UserSchema.optional(),
      recipient: UserSchema.optional(),
    })
    .optional(),
});

export type DirectMessageExpanded = z.infer<typeof DirectMessageExpandedSchema>;

export const CreateDirectMessageSchema = z.object({
  sender: z.string(),
  recipient: z.string(),
  content: z.string().min(1).max(2000),
});

export const UpdateDirectMessageSchema = CreateDirectMessageSchema.partial();
