import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../lib/pocketbase';
import { notifications } from '@mantine/notifications';

export function useProject(projectId) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => pb.collection('projects').getOne(projectId, { expand: 'owner,invited' }),
    enabled: !!projectId,
  });
}

export function useUpdateProject(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => pb.collection('projects').update(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries(['project', projectId]);
      qc.invalidateQueries(['projects']);
    },
    onError: (e) => notifications.show({ color: 'red', title: 'Error', message: e.message }),
  });
}

export function useSearchUser() {
  return useMutation({
    mutationFn: (username) => pb.collection('users').getFirstListItem(`username = "${username}"`),
    onError: () =>
      notifications.show({
        color: 'red',
        title: 'User not found',
        message: 'No user with that username exists.',
      }),
  });
}
