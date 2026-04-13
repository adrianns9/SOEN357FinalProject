import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Group,
  Avatar,
  Stack,
  TextInput,
  ActionIcon,
  ScrollArea,
  Divider,
  Badge,
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, currentUser } from '../../lib/pocketbase';
import { notifications } from '@mantine/notifications';

function dmId(a, b) {
  return [a, b].sort().join('_');
}

function ChatThread({ peer }) {
  const user = currentUser();
  const qc = useQueryClient();
  const bottomRef = useRef(null);
  const [msg, setMsg] = useState('');
  const channel = dmId(user.id, peer.id);

  const { data: messages } = useQuery({
    queryKey: ['dm', channel],
    queryFn: () =>
      pb.collection('direct_messages').getFullList({
        filter: `channel_id = "${channel}"`,
        sort: 'created',
        expand: 'sender',
      }),
    refetchInterval: 2000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useMutation({
    mutationFn: () =>
      pb.collection('direct_messages').create({
        channel_id: channel,
        sender: user.id,
        recipient: peer.id,
        content: msg.trim(),
      }),
    onSuccess: () => {
      setMsg('');
      qc.invalidateQueries(['dm', channel]);
    },
    onError: (e) => notifications.show({ color: 'red', message: e.message }),
  });

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (msg.trim()) send.mutate();
    }
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
        <Group gap={8}>
          <Avatar size={30} radius="xl" color="indigo">
            {(peer.name || peer.username)?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Text size="sm" fw={500}>
              {peer.name || peer.username}
            </Text>
            <Text size="xs" c="dimmed">
              @{peer.username}
            </Text>
          </Box>
        </Group>
      </Box>

      <ScrollArea flex={1} p="sm">
        <Stack gap={6} pr={4}>
          {messages?.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="xl">
              Say hello to {peer.name || peer.username}!
            </Text>
          )}
          {messages?.map((m) => {
            const isMine = m.sender === user.id;
            return (
              <Group
                key={m.id}
                justify={isMine ? 'flex-end' : 'flex-start'}
                gap={6}
                align="flex-end"
              >
                {!isMine && (
                  <Avatar size={22} radius="xl" color="indigo">
                    {(peer.name || peer.username)?.charAt(0)?.toUpperCase()}
                  </Avatar>
                )}
                <Box className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>{m.content}</Box>
              </Group>
            );
          })}
          <div ref={bottomRef} />
        </Stack>
      </ScrollArea>

      <Box p="sm" style={{ borderTop: '1px solid #E5E7EB' }}>
        <Group gap="xs">
          <TextInput
            flex={1}
            size="sm"
            placeholder={`Message ${peer.name || peer.username}...`}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={onKey}
          />
          <ActionIcon
            size="lg"
            variant="filled"
            color="indigo"
            onClick={() => msg.trim() && send.mutate()}
          >
            <IconSend size={16} />
          </ActionIcon>
        </Group>
      </Box>
    </Box>
  );
}

export function DirectMessages({ members, onClose }) {
  const user = currentUser();
  const peers = members?.filter((m) => m.id !== user.id) ?? [];
  const [selected, setSelected] = useState(peers[0] || null);

  useEffect(() => {
    if (!selected && peers.length > 0) setSelected(peers[0]);
  }, [peers]);

  return (
    <Box className="chat-panel" style={{ width: '100%', height: '100%' }}>
      <Box style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB' }}>
        <Text fw={600} size="sm">
          Team Messages
        </Text>
      </Box>
      <Box style={{ display: 'flex', height: 'calc(100% - 49px)' }}>
        {/* Sidebar */}
        <Box
          style={{
            width: 110,
            borderRight: '1px solid #F3F4F6',
            overflowY: 'auto',
            padding: '8px 6px',
          }}
        >
          {peers.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" p="sm">
              No teammates yet
            </Text>
          )}
          {peers.map((p) => (
            <Box
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 4px',
                borderRadius: 8,
                cursor: 'pointer',
                background: selected?.id === p.id ? '#EEF0FF' : 'transparent',
              }}
            >
              <Avatar size={32} radius="xl" color="indigo">
                {(p.name || p.username)?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Text size="xs" lineClamp={1} ta="center" style={{ fontSize: 11 }}>
                {p.name?.split(' ')[0] || p.username}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Thread */}
        <Box style={{ flex: 1, overflow: 'hidden' }}>
          {selected ? (
            <ChatThread peer={selected} />
          ) : (
            <Text size="sm" c="dimmed" ta="center" p="xl">
              Select a teammate to chat
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
