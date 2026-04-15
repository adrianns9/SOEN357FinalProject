// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { tasksApi } from '@/api';
import type z from 'zod';
import type { UpdateTaskSchema } from '@/schemas';

// GET all projects
export const useTasks = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => tasksApi.getByProject(projectId),
  });
};

// CREATE project
export const useCreateTask = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof UpdateTaskSchema> }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
};
