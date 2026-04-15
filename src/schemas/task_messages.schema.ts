import z from 'zod';
import { BaseSchema } from './base.schema';
import { UserSchema } from './users.schema';
import { TaskSchema } from './tasks.schema';

export const TaskMessageSchema = BaseSchema.extend({
  author: z.string(),
  content: z.string().optional(),

  task: z.string(), // task id
});

export type TaskMessage = z.infer<typeof TaskMessageSchema>;

export const TaskMessageExpandedSchema = TaskMessageSchema.extend({
  expand: z.object({
    author: UserSchema,
    task: TaskSchema,
  }),
});

export type TaskMessageExpanded = z.infer<typeof TaskMessageExpandedSchema>;

export const CreateTaskMessageSchema = z.object({
  author: z.string(),
  content: z.string(),
  task: z.string(),
});

export const UpdateTaskMessageSchema = z.object({
  content: z.string(),
});
