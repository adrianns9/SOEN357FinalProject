import z from 'zod';
import { BaseSchema } from './base.schema';
import { ProjectSchema } from './projects.schema';
import { UserSchema } from './users.schema';

export const TASK_STATUSES = ['backlog', 'ready', 'in progress', 'done'] as const;
export const TaskStatusSchema = z.enum(TASK_STATUSES);

export const STATUS_META = {
  backlog: { label: 'Backlog', color: '#6B7280' },
  ready: { label: 'Ready', color: '#3B82F6' },
  'in progress': { label: 'In Progress', color: '#F59E0B' },
  done: { label: 'Done', color: '#10B981' },
} as const;

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskSchema = BaseSchema.extend({
  title: z.string().min(1),
  description: z.string().optional(),

  project: z.string(),
  status: TaskStatusSchema,

  assignee: z.array(z.string()).optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export const TaskExpandedSchema = TaskSchema.extend({
  expand: z.object({
    project: ProjectSchema,
    assignee: z.array(UserSchema).optional(),
  }),
});

export type TaskExpanded = z.infer<typeof TaskExpandedSchema>;

export const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  project: z.string(),
  status: TaskStatusSchema,
  assignee: z.array(z.string()).optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();
