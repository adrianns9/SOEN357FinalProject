// lib/queryKeys.ts
export const queryKeys = {
  users: ['users'] as const,

  messages: ['direct_messages'] as const,
  message: (id: string) => ['direct_messages', id] as const,

  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,

  tasks: (projectId: string) => ['tasks', projectId] as const,
  task: (projectId: string, id: string) => ['tasks', projectId, id] as const,

  taskMessages: ['task_messages'] as const,
};
