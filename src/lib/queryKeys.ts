// lib/queryKeys.ts
export const queryKeys = {
  users: ['users'] as const,

  messages: ['direct_messages'] as const,
  message: (id: string) => ['direct_messages', id] as const,

  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,

  tasks: ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,

  taskMessages: ['task_messages'] as const,
};
