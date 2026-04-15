import { pb } from '@/lib/pocketbase';
import { useMutation } from '@tanstack/react-query';

export function useSearchUser() {
  return useMutation({
    mutationFn: (username: string) =>
      pb.collection('users').getFirstListItem(`name ?= ${username.trim()}`),
  });
}
