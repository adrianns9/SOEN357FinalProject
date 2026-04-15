// hooks/useTaskMessages.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { taskMessagesApi } from '@/api';

// GET messages for a task
export const useTaskMessages = (taskId: string) => {
  return useQuery({
    queryKey: [...queryKeys.taskMessages, taskId],
    queryFn: async () => {
      return taskMessagesApi.getList({
        filter: `task="${taskId}"`,
        expand: 'author',
        sort: 'created',
      });
    },
    enabled: !!taskId,
  });
};

// CREATE message
export const useCreateTaskMessage = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: taskMessagesApi.create,
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: [...queryKeys.taskMessages, message.task] });
    },
  });
};
