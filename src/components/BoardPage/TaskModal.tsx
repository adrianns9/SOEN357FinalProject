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
  Tooltip,
  LoadingOverlay,
  Card,
  MultiSelect,
} from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import { IconTrash, IconSend, IconPencil, IconCheck, IconX } from '@tabler/icons-react';
import { currentUser, pb } from '@/lib/pocketbase';
import {
  useCreateTaskMessage,
  useDeleteTask,
  useTask,
  useTaskMessages,
  useUpdateTask,
} from '@/queries';
import { STATUS_META, TASK_STATUSES, UpdateTaskSchema, type User } from '@/schemas';
import z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

function CommentSimple({
  name,
  time,
  content,
}: {
  name: string | undefined;
  time: string | undefined;
  content: string | undefined;
}) {
  return (
    <Card withBorder>
      <Group>
        <Avatar radius="xl" color="indigo">
          {name?.slice(0, 2)?.toUpperCase()}
        </Avatar>
        <div>
          <Text size="sm">{name}</Text>
          <Text size="xs" c="dimmed">
            {time}
          </Text>
        </div>
      </Group>
      <Text pl={54} pt="sm" size="sm">
        {content}
      </Text>
    </Card>
  );
}

function TaskChat({ taskId }: { taskId: string }) {
  const user = currentUser();
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState('');

  const { data: messages } = useTaskMessages(taskId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    pb.collection('task_messages').subscribe('*', () => {
      qc.invalidateQueries({ queryKey: queryKeys.taskMessages });
    });

    return () => {
      pb.collection('task_messages').unsubscribe();
    };
  }, []);

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
      <ScrollArea h={500} mb="sm">
        <Stack gap={8} pr={4}>
          {messages?.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="lg">
              No messages yet. Start the discussion!
            </Text>
          )}
          {messages?.map((m) => {
            return (
              <CommentSimple
                key={m.id}
                name={m.expand.author.name}
                content={m.content}
                time={m.updated}
              />
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
  const { data: task, isLoading } = useTask(projectId, taskId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const [editing, setEditing] = useState(false);

  const form = useForm<z.infer<typeof UpdateTaskSchema>>({
    mode: 'uncontrolled',
    initialValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'backlog',
      assignee: task?.expand?.assignee?.map((m) => m.name!) || [],
    },
    validate: schemaResolver(UpdateTaskSchema, { sync: true }),
  });

  useEffect(() => {
    if (task)
      form.setValues({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'backlog',
        assignee: task.assignee || [],
      });
  }, [task]);

  if (!task) return null;

  const handleSubmit = form.onSubmit((values) => {
    const data = {
      ...values,
      assignee: values.assignee?.map((a) => members.find((m) => m.id === a)!.id!) || [],
    };
    updateTask.mutate(
      { id: task.id, data },
      {
        onSuccess: () => {
          setEditing(false);
        },
      }
    );
  });

  const del = () => {
    deleteTask.mutate({ id: task.id });
    onClose();
  };

  const statusData = TASK_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label }));
  const memberData = members?.map((m) => m.name!) ?? [];
  const assignees = task.expand.assignee;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
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
      <LoadingOverlay visible={isLoading} />
      <Stack gap="md">
        {editing ? (
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput label="Title" {...form.getInputProps('title')} />
              <Textarea label="Description" {...form.getInputProps('description')} />
              <Group grow>
                <Select label="Status" data={statusData} {...form.getInputProps('status')} />
                <MultiSelect
                  label="Assignee"
                  data={memberData}
                  {...form.getInputProps('assignee')}
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
                  type="submit"
                  size="sm"
                  loading={updateTask.isPending}
                  leftSection={<IconCheck size={14} />}
                >
                  Save
                </Button>
              </Group>
            </Stack>
          </form>
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

              <Box>
                <Text size="xs" c="dimmed" mb={4}>
                  Assignee(s)
                </Text>
                <Group justify="flex-end" mt={4}>
                  {assignees.map((assignee) => {
                    return (
                      <Tooltip key={assignee.id} label={assignee.name} withArrow>
                        <Avatar size={22} radius="xl" color="indigo" style={{ cursor: 'default' }}>
                          {assignee.name?.slice(0, 2)?.toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    );
                  })}
                </Group>
              </Box>
            </Group>
          </>
        )}

        <Divider my={4} />
        <TaskChat taskId={task.id} />
      </Stack>
    </Modal>
  );
}
