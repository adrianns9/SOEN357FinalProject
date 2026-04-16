import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import {
  Box,
  Group,
  ActionIcon,
  Text,
  Loader,
  Center,
  Flex,
  AppShell,
  Avatar,
  Container,
  Title,
  UnstyledButton,
  Button
  
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import { IconLogout, IconX, IconPlus } from '@tabler/icons-react';
import { currentUser, logoutUser, pb } from '@/lib/pocketbase';
import { KanbanColumn } from './KanbanColumn';
import { useProject, useTasks, useUpdateTask } from '@/queries';
import { TASK_STATUSES, type TaskExpanded, type TaskStatus, type User } from '@/schemas';
import { TaskModal } from './TaskModal';
import { AddTaskModal } from './AddTaskModal';
import { Sidebar } from './Sidebar';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Progress } from '@mantine/core';
import { getOverallProgress } from '@/schemas/taskProgress';

import classes from './BoardPage.module.css';
import { ChatThread } from './ChatThread';

interface Props extends React.ComponentPropsWithRef<'div'> {
  projectId: string;
}

export function BoardPage({ projectId }: Props) {
  const navigate = useNavigate();
  const user = currentUser();
  const qc = useQueryClient();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);
  const updateTask = useUpdateTask(projectId);

  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskExpanded | null>(null);
  const [taskModalOpen, { open: openTaskModal, close: closeTaskModal }] = useDisclosure(false);
  const [addModalOpen, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('backlog');
  const [chatOpen, setChatOpen] = useState(false);

  const owner = project?.expand.owner;
  const invited = project?.expand?.invited ?? [];
  const allMembers = owner ? [owner, ...invited] : invited;

  useEffect(() => {
    pb.collection('tasks').subscribe('*', () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
    });

    pb.collection('projects').subscribe('*', () => {
      qc.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    });

    return () => {
      pb.collection('tasks').unsubscribe();
      pb.collection('projects').unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (selectedMember && allMembers.every((m) => selectedMember.id !== m.id)) {
      setSelectedMember(null);
    }
  }, [selectedMember, allMembers]);

  const tasksByStatus = tasks.reduce(
    (acc, t) => {
      acc[t.status].push(t);
      return acc;
    },
    TASK_STATUSES.reduce((acc, s) => ({ ...acc, [s]: [] }), {}) as Record<
      TaskStatus,
      TaskExpanded[]
    >
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { source, target } = event.operation;

    if (!target || !source) return;
    if (source.type === 'column') return;

    const task = source.data as TaskExpanded;
    const status = target.id as TaskStatus;

    if (task.status !== status) {
      updateTask.mutate({ id: task.id, data: { status } });
    }
  };

  const openAdd = (status: TaskStatus) => {
    setDefaultStatus(status);
    openAddModal();
  };

  const openTask = (task: TaskExpanded) => {
    setSelectedTask(task);
    openTaskModal();
  };

  const logout = () => {
    logoutUser();
    navigate('/auth');
  };

  if (projectLoading || tasksLoading) {
    return (
      <Center h="100vh">
        <Loader color="indigo" />
      </Center>
    );
  }

  if (!allMembers?.some((member) => member.id === user!.id)) {
    return <Navigate to="/projects" replace />;
  }
  const overallProgress = getOverallProgress(tasks);

  return (
    <AppShell padding="md" navbar={{ width: 600, breakpoint: 'sm' }} header={{ height: 60 }}>
      {/* Header */}
      <AppShell.Header className={classes.header} p="md">
        <UnstyledButton onClick={() => navigate('/projects')}>
          <Group gap="sm">
            <Box
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="1" width="6" height="16" rx="2" fill="white" fillOpacity="0.9" />
                <rect x="9" y="1" width="4" height="11" rx="2" fill="white" fillOpacity="0.7" />
                <rect x="15" y="1" width="2" height="7" rx="1" fill="white" fillOpacity="0.5" />
              </svg>
            </Box>
            <Text fw={700} size="lg" style={{ color: '#4F46E5', letterSpacing: '-0.02em' }}>
              Tasked
            </Text>
          </Group>
        </UnstyledButton>
        <Group>
          <Group gap={8}>
            <Avatar size="sm" color="indigo" radius="xl">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </Avatar>
            <Text size="sm" fw={500}>
              {user?.name || user?.username}
            </Text>
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={logout} title="Sign out">
            <IconLogout size={18} />
          </ActionIcon>
        </Group>
      </AppShell.Header>

      {/* Sidebar */}
      <AppShell.Navbar>
        <Sidebar
          projectId={projectId}
          selectedMemberId={selectedMember?.id}
          onSelectMember={setSelectedMember}
        />

        <Box style={{ flex: 1 }}>
          {selectedMember ? (
            <ChatThread peer={selectedMember} onClose={() => setSelectedMember(null)} />
          ) : (
            <Center>
              <Text p="xl" c="dimmed">
                Select a member to start chatting
              </Text>
            </Center>
          )}
        </Box>
      </AppShell.Navbar>

      {/* Main content */}
      <AppShell.Main>
        <Container size="xl">
          <Group justify="space-between" align="flex-start" mt="sm">
  <Box style={{ flex: 1 }}>
    <Title order={2} fw={600} style={{ lineHeight: 1.2 }}>
      {project?.title}
    </Title>

    {project?.description && (
      <Text size="sm" c="dimmed" mt={6} style={{ maxWidth: 640, lineHeight: 1.5 }}>
        {project?.description}
      </Text>
    )}

    <Box mt="md" maw={420}>
      <Group justify="space-between" mb={6}>
        <Text size="sm" fw={500}>
          Overall completion
        </Text>
        <Text size="sm" fw={600}>
          {overallProgress}%
        </Text>
      </Group>
      <Progress value={overallProgress} radius="xl" size="md" />
    </Box>
  </Box>

  <Button leftSection={<IconPlus size={16} />} onClick={() => openAdd('backlog')} radius="md">
    New Task
  </Button>
</Group>
          {/* Board + Chat */}

          <DragDropProvider onDragEnd={handleDragEnd}>
            <Flex gap="sm" mt="sm">
              {TASK_STATUSES.map((status) => {
                const tasks = tasksByStatus[status];
                return (
                  <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasks}
                    onAddTask={openAdd}
                    onTaskClick={openTask}
                  />
                );
              })}
            </Flex>
          </DragDropProvider>

          {/* Chat panel */}
          {chatOpen && (
            <Box
              style={{
                width: 340,
                borderLeft: '1px solid #E5E7EB',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                height: '100%',
              }}
            >
              <Box
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text fw={600} size="sm">
                  Team Chat
                </Text>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={() => setChatOpen(false)}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
              <Box style={{ flex: 1, overflow: 'hidden' }}>
                {/* <DirectMessages members={allMembers} /> */}
              </Box>
            </Box>
          )}
        </Container>
      </AppShell.Main>

      {/* Modals */}
      {selectedTask && (
        <TaskModal
          taskId={selectedTask.id}
          opened={taskModalOpen}
          onClose={closeTaskModal}
          projectId={projectId}
          members={allMembers}
        />
      )}
      <AddTaskModal
        opened={addModalOpen}
        onClose={closeAddModal}
        projectId={projectId}
        defaultStatus={defaultStatus}
        members={allMembers}
      />
    </AppShell>
  );
}
