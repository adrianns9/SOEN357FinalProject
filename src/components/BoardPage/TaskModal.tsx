import React, { useState, useEffect, useRef, type KeyboardEventHandler } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  Avatar,
  ActionIcon,
  Box,
  Divider,
  ScrollArea,
  Badge,
} from '@mantine/core';
import { IconTrash, IconSend, IconPencil, IconCheck, IconX } from '@tabler/icons-react';
import { currentUser } from '../../lib/pocketbase';
import {
  useCreateTaskMessage,
  useDeleteTask,
  useTask,
  useTaskMessages,
  useUpdateTask,
} from '@/queries';
import { STATUS_META, TASK_STATUSES, UpdateTaskSchema, type User } from '@/schemas';

function TaskChat({ taskId }: { taskId: string }) {
  const user = currentUser();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState('');

  const { data: messages } = useTaskMessages(taskId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCreateTaskMessage();

  const sendMessage = () => {
    if (msg.trim()) {
      setMsg('');
      send.mutate({ author: user!.id, content: msg, task: taskId });
    }
  };

  const onKey: KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box>
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        mb="xs"
        style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        Task Discussion
      </Text>
      <ScrollArea h={220} mb="sm">
        <Stack gap={8} pr={4}>
          {messages?.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="lg">
              No messages yet. Start the discussion!
            </Text>
          )}
          {messages?.map((m) => {
            const isMine = m.author === user!.id;
            const author = m.expand.author;
            return (
              <Group
                key={m.id}
                align="flex-start"
                gap={6}
                justify={isMine ? 'flex-end' : 'flex-start'}
              >
                {!isMine && (
                  <Avatar size={24} radius="xl" color="indigo">
                    {author.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                )}
                <Box style={{ maxWidth: '75%' }}>
                  {!isMine && (
                    <Text size="xs" c="dimmed" mb={2}>
                      {author.name}
                    </Text>
                  )}
                  <Box className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>{m.content}</Box>
                </Box>
              </Group>
            );
          })}
          <div ref={bottomRef} />
        </Stack>
      </ScrollArea>
      <Group gap="xs">
        <TextInput
          flex={1}
          size="sm"
          placeholder="Write a message..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={onKey}
        />
        <ActionIcon
          disabled={!msg}
          size="lg"
          variant="filled"
          color="indigo"
          onClick={() => sendMessage()}
          loading={send.isPending}
        >
          <IconSend size={16} />
        </ActionIcon>
      </Group>
    </Box>
  );
}

interface Props extends React.ComponentPropsWithRef<'div'> {
  taskId: string;
  opened: boolean;
  onClose: () => void;
  projectId: string;
  members: User[];
}

export function TaskModal({ projectId, taskId, opened, onClose, members }: Props) {
  const { data: task } = useTask(projectId, taskId);
  const user = currentUser();
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', status: '', assignee: '' });

  useEffect(() => {
    if (task)
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'backlog',
        assignee: task.assignee || '',
      });
  }, [task]);

  if (!task) return null;

  const save = () => {
    const data = UpdateTaskSchema.parse(form);
    updateTask.mutate({ id: task.id, data });
    setEditing(false);
  };

  const del = () => {
    deleteTask.mutate({ id: task.id });
    onClose();
  };

  const statusData = TASK_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label }));
  const memberData = members?.map((m) => ({ value: m.id, label: m.name })) ?? [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      radius="lg"
      title={
        <Group gap="xs">
          <Badge
            size="sm"
            variant="dot"
            color={
              task.status === 'done'
                ? 'green'
                : task.status === 'in progress'
                  ? 'yellow'
                  : task.status === 'ready'
                    ? 'blue'
                    : 'gray'
            }
          >
            {STATUS_META[task.status]?.label}
          </Badge>
        </Group>
      }
    >
      <Stack gap="md">
        {editing ? (
          <>
            <TextInput
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
            <Group grow>
              <Select
                label="Status"
                data={statusData}
                value={form.status}
                onChange={(v) => setForm((f) => ({ ...f, status: v }))}
              />
              <Select
                label="Assignee"
                data={memberData}
                value={form.assignee}
                onChange={(v) => setForm((f) => ({ ...f, assignee: v }))}
                clearable
                placeholder="Unassigned"
              />
            </Group>
            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => setEditing(false)}
                leftSection={<IconX size={14} />}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={save}
                loading={updateTask.isPending}
                leftSection={<IconCheck size={14} />}
              >
                Save
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Group justify="space-between" align="flex-start">
              <Text fw={600} size="lg" style={{ flex: 1, lineHeight: 1.3 }}>
                {task.title}
              </Text>
              <Group gap={4}>
                <ActionIcon variant="subtle" color="gray" onClick={() => setEditing(true)}>
                  <IconPencil size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" onClick={del}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
            {task.description && (
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                {task.description}
              </Text>
            )}
            <Group gap="xl">
              <Box>
                <Text size="xs" c="dimmed" mb={4}>
                  Status
                </Text>
                <Badge
                  variant="light"
                  color={
                    task.status === 'done'
                      ? 'green'
                      : task.status === 'in progress'
                        ? 'yellow'
                        : task.status === 'ready'
                          ? 'blue'
                          : 'gray'
                  }
                >
                  {STATUS_META[task.status]?.label}
                </Badge>
              </Box>
              {task.expand?.assignee && (
                <Box>
                  <Text size="xs" c="dimmed" mb={4}>
                    Assignee
                  </Text>
                  <Group gap={6}>
                    <Avatar size={20} radius="xl" color="indigo">
                      {task.expand.assignee.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Text size="sm">{task.expand.assignee.name}</Text>
                  </Group>
                </Box>
              )}
            </Group>
          </>
        )}

        <Divider my={4} />
        <TaskChat taskId={task.id} />
      </Stack>
    </Modal>
  );
}
