import z from 'zod';
import { BaseSchema } from './base.schema';

export const UserSchema = BaseSchema.extend({
  email: z.email(),
  emailVisibility: z.boolean(),
  verified: z.boolean(),

  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),

    name: z.string().optional(),
    avatar: z.any().optional(), // file upload
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords must match',
    path: ['passwordConfirm'],
  });

export const UpdateUserSchema = z
  .object({
    email: z.email().optional(),
    name: z.string().optional(),
    avatar: z.any().optional(),
    password: z.string().min(8).optional(),
    passwordConfirm: z.string().min(8).optional(),
  })
  .refine((data) => !data.password || data.password === data.passwordConfirm, {
    message: 'Passwords must match',
    path: ['passwordConfirm'],
  });
