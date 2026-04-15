// hooks/useMessages.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { directMessagesApi } from '@/api';

// GET messages between two users
export const useMessages = (userId: string) => {
  return useQuery({
    queryKey: [...queryKeys.messages, userId],
    queryFn: () =>
      directMessagesApi.getList({
        filter: `sender="${userId}" || recipient="${userId}"`,
        sort: '-created',
      }),
  });
};

// CREATE message
export const useSendMessage = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: directMessagesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages });
    },
  });
};
