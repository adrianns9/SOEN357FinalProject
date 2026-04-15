// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { tasksApi } from '@/api';
import type z from 'zod';
import type { UpdateTaskSchema } from '@/schemas';

// GET all tasks in project
export const useTasks = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks(projectId),
    queryFn: () => tasksApi.getByProject(projectId),
  });
};

export const useTask = (projectId: string, taskId: string) => {
  return useQuery({
    queryKey: queryKeys.task(projectId, taskId),
    queryFn: () => tasksApi.getOne(taskId),
  });
};

// CREATE project
export const useCreateTask = (projectId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
    },
  });
};

export const useUpdateTask = (projectId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof UpdateTaskSchema> }) =>
      tasksApi.update(id, data),

    // 🔥 Optimistic update
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: queryKeys.tasks(projectId) });

      const previousTasks = qc.getQueryData(queryKeys.tasks(projectId));

      qc.setQueryData(queryKeys.tasks(projectId), (old: any) => {
        if (!old) return old;

        return old.map((task: any) => (task.id === id ? { ...task, ...data } : task));
      });

      return { previousTasks };
    },

    // ❌ Rollback on error
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        qc.setQueryData(queryKeys.tasks(projectId), context.previousTasks);
      }
    },

    // 🔄 Ensure consistency with server
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
    },
  });
};

export const useDeleteTask = (projectId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
    },
  });
};
