import z from 'zod';
import { BaseSchema } from './base.schema';
import { UserSchema } from './users.schema';

export const ProjectSchema = BaseSchema.extend({
  title: z.string(),
  description: z.string(),

  owner: z.string(),
  invited: z.array(z.string()),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectExpandedSchema = ProjectSchema.extend({
  expand: z.object({
    owner: UserSchema,
    invited: z.array(UserSchema),
  }),
});

export type ProjectExpanded = z.infer<typeof ProjectSchema>;

export const CreateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),

  owner: z.string().optional(),
  invited: z.array(z.string()).optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();
