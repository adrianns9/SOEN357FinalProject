import { useEffect, useRef, type KeyboardEventHandler, type MouseEventHandler } from 'react';
import { Box, Text, Group, Avatar, Stack, TextInput, ActionIcon, ScrollArea } from '@mantine/core';
import { IconSend, IconX } from '@tabler/icons-react';
import { currentUser, pb } from '@/lib/pocketbase';
import { useForm } from '@mantine/form';
import { useMessages, useSendMessage } from '@/queries';
import type { User } from '@/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { useResizeObserver } from '@mantine/hooks';

const TIME_GAP_MS = 5 * 60 * 1000; // 10 minutes

function shouldShowTimestamp(prev?: string, curr?: string) {
  if (!prev || !curr) return true;

  const prevTime = new Date(prev).getTime();
  const currTime = new Date(curr).getTime();

  return currTime - prevTime > TIME_GAP_MS;
}

function formatTimestamp(dateStr: string) {
  const d = new Date(dateStr);

  return d.toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

export function ChatThread({
  peer,
  onClose,
}: {
  peer: User;
  onClose?: MouseEventHandler<HTMLButtonElement>;
}) {
  const [ref, rect] = useResizeObserver();
  const user = currentUser();
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useMessages(user!.id);
  const send = useSendMessage();

  const form = useForm({
    initialValues: {
      content: '',
    },
  });

  // Filter messages between the two users
  const thread =
    messages?.filter(
      (m) =>
        (m.sender === user!.id && m.recipient === peer.id) ||
        (m.sender === peer.id && m.recipient === user!.id)
    ) ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  useEffect(() => {
    pb.collection('direct_messages').subscribe('*', () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages });
    });

    return () => {
      pb.collection('direct_messages').unsubscribe();
    };
  }, []);

  const sendMessage = form.onSubmit(({ content }) => {
    if (!content.trim()) return;

    send.mutate(
      {
        sender: user!.id,
        recipient: peer.id,
        content,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  });

  const onKey: KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  console.log(thread);

  return (
    <Box ref={ref} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box style={{ padding: '12px 16px', borderBlock: '1px solid #E5E7EB' }}>
        <Group justify="space-between">
          <Group gap={10}>
            <Avatar size={30} radius="xl" color="indigo">
              {peer.name?.slice(0, 2)?.toUpperCase()}
            </Avatar>

            <Box>
              <Text size="sm" fw={600}>
                {peer.name}
              </Text>

              <Text size="xs" c="dimmed">
                You are chatting with {peer.name}
              </Text>
            </Box>
          </Group>

          <ActionIcon variant="subtle" onClick={onClose}>
            <IconX />
          </ActionIcon>
        </Group>
      </Box>

      {/* Messages */}
      <ScrollArea mah={rect.height - 100} flex={1} p="sm">
        <Stack
          gap={6}
          pr={4}
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
          }}
        >
          {thread.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="xl">
              Say hello to {peer.name}!
            </Text>
          )}

          {thread.map((m, i, arr) => {
            const isMine = m.sender === user!.id;

            // Because reversed, "previous" is actually next index
            const prev = arr[i + 1];

            const showTime = shouldShowTimestamp(prev?.created, m.created);

            return (
              <Box key={m.id}>
                {/* Timestamp separator */}
                {showTime && (
                  <Text size="xs" c="dimmed" ta="center" my="xs" style={{ opacity: 0.8 }}>
                    {formatTimestamp(m.created)}
                  </Text>
                )}

                <Group justify={isMine ? 'flex-end' : 'flex-start'} gap={6} align="flex-end">
                  {!isMine && (
                    <Avatar size={22} radius="xl" color="indigo">
                      {peer.name?.slice(0, 2)?.toUpperCase()}
                    </Avatar>
                  )}

                  <Box className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>{m.content}</Box>
                </Group>
              </Box>
            );
          })}

          <div ref={bottomRef} />
        </Stack>
      </ScrollArea>

      {/* Input */}
      <Box p="sm" style={{ borderTop: '1px solid #E5E7EB' }}>
        <form onSubmit={sendMessage}>
          <Group gap="xs">
            <TextInput
              flex={1}
              size="sm"
              placeholder={`Message ${peer.name}...`}
              onKeyDown={onKey}
              {...form.getInputProps('content')}
            />

            <ActionIcon
              type="submit"
              size="lg"
              variant="filled"
              color="indigo"
              loading={send.isPending}
              disabled={!form.values.content.trim()}
            >
              <IconSend size={16} />
            </ActionIcon>
          </Group>
        </form>
      </Box>
    </Box>
  );
}
