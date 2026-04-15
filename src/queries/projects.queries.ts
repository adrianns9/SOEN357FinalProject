// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { projectsApi } from '@/api';
import { UpdateProjectSchema } from '@/schemas';
import type z from 'zod';

// GET all projects
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () =>
      projectsApi.getList({
        expand: 'owner,invited',
      }),
  });
};

// GET single project (with expand)
export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: async () => {
      return projectsApi.getOne(id, {
        expand: 'owner,invited',
      });
    },
    enabled: !!id,
  });
};

// CREATE project
export const useCreateProject = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof UpdateProjectSchema> }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

export const useDeleteProject = (projectId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => projectsApi.delete(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};
