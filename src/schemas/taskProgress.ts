import type { TaskStatus, TaskExpanded } from '@/schemas';

export function getTaskProgress(status: TaskStatus): number {
  switch (status) {
    case 'ready':
      return 33;
    case 'in progress':
      return 66;
    case 'done':
      return 100;
    case 'backlog':
    default:
      return 0;
  }
}

export function getOverallProgress(tasks: TaskExpanded[]): number {
  if (!tasks.length) return 0;

  const total = tasks.reduce((sum, task) => {
    return sum + getTaskProgress(task.status);
  }, 0);

  return Math.round(total / tasks.length);
}
