import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import { notifications } from '@mantine/notifications';

export const TASK_STATUSES = ['backlog', 'ready', 'in progress', 'done'] as const;

export const STATUS_META = {
  backlog: { label: 'Backlog', color: '#6B7280' },
  ready: { label: 'Ready', color: '#3B82F6' },
  'in progress': { label: 'In Progress', color: '#F59E0B' },
  done: { label: 'Done', color: '#10B981' },
};

export function useTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () =>
      pb.collection('tasks').getFullList({
        filter: `project_id = "${projectId}"`,
        sort: 'created',
        expand: 'assignee',
      }),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => pb.collection('tasks').create({ ...data, project_id: projectId }),
    onSuccess: () => qc.invalidateQueries(['tasks', projectId]),
    onError: (e) => notifications.show({ color: 'red', title: 'Error', message: e.message }),
  });
}

export function useUpdateTask(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => pb.collection('tasks').update(id, data),
    onSuccess: () => qc.invalidateQueries(['tasks', projectId]),
    onError: (e) => notifications.show({ color: 'red', title: 'Error', message: e.message }),
  });
}

export function useDeleteTask(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => pb.collection('tasks').delete(id),
    onSuccess: () => qc.invalidateQueries(['tasks', projectId]),
    onError: (e) => notifications.show({ color: 'red', title: 'Error', message: e.message }),
  });
}
