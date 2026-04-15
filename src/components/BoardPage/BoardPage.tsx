import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Group,
  ActionIcon,
  Button,
  Text,
  Tooltip,
  Loader,
  Center,
  Tabs,
  Flex,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import {
  IconMessageCircle,
  IconLayoutKanban,
  IconPlus,
  IconLogout,
  IconX,
} from '@tabler/icons-react';
import { logoutUser } from '@/lib/pocketbase';
import { KanbanColumn } from './KanbanColumn';
import { useProject, useTasks, useUpdateTask } from '@/queries';
import { TASK_STATUSES, type TaskExpanded, type TaskStatus } from '@/schemas';
import { TaskModal } from './TaskModal';
import { AddTaskModal } from './AddTaskModal';
import { Sidebar } from './Sidebar';

interface Props extends React.ComponentPropsWithRef<'div'> {
  projectId: string;
}

export function BoardPage({ projectId }: Props) {
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);
  const updateTask = useUpdateTask(projectId);

  const [selectedTask, setSelectedTask] = useState<TaskExpanded | null>(null);
  const [taskModalOpen, { open: openTaskModal, close: closeTaskModal }] = useDisclosure(false);
  const [addModalOpen, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('backlog');
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('board');

  const owner = project?.expand.owner;
  const invited = project?.expand?.invited ?? [];
  const allMembers = owner ? [owner, ...invited] : invited;

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

  return (
    <Box
      style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--col-bg)' }}
    >
      {/* Sidebar */}
      <Sidebar projectId={projectId} />

      {/* Main content */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <Box className="topbar">
          <Group gap={8} style={{ flex: 1 }}>
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
              <Tabs.List>
                <Tabs.Tab
                  value="board"
                  leftSection={<IconLayoutKanban size={14} />}
                  style={{ fontSize: 13 }}
                >
                  Board
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>
          </Group>

          <Group gap={8}>
            <Button
              size="xs"
              leftSection={<IconPlus size={13} />}
              radius="md"
              onClick={() => openAdd('backlog')}
            >
              Add task
            </Button>
            <Tooltip label={chatOpen ? 'Close chat' : 'Team chat'} withArrow>
              <ActionIcon
                variant={chatOpen ? 'filled' : 'light'}
                color="indigo"
                size="md"
                radius="md"
                onClick={() => setChatOpen((v) => !v)}
              >
                <IconMessageCircle size={16} />
              </ActionIcon>
            </Tooltip>
            <ActionIcon variant="subtle" color="gray" size="md" onClick={logout} title="Sign out">
              <IconLogout size={16} />
            </ActionIcon>
          </Group>
        </Box>

        {/* Board + Chat */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Kanban board */}
          <Box style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
            <DragDropProvider onDragEnd={handleDragEnd}>
              <Flex gap="sm">
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
          </Box>

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
        </Box>
      </Box>

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
    </Box>
  );
}
