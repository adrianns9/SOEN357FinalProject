import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, Group, ActionIcon, Button, Text, Tooltip, Loader, Center, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  IconMessageCircle,
  IconLayoutKanban,
  IconPlus,
  IconLogout,
  IconX,
} from '@tabler/icons-react';
import { pb, currentUser } from '@/lib/pocketbase';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { AddTaskModal } from './AddTaskModal';
import { DirectMessages } from './DirectMessages';
import { TASK_STATUSES, useProject, useTasks, useUpdateTask } from '@/queries';

export function BoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = currentUser();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);
  const updateTask = useUpdateTask(projectId);

  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, { open: openTaskModal, close: closeTaskModal }] = useDisclosure(false);
  const [addModalOpen, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [defaultStatus, setDefaultStatus] = useState('backlog');
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const owner = project?.expand?.owner;
  const invited = project?.expand?.invited ?? [];
  const allMembers = owner ? [owner, ...invited] : invited;

  const tasksByStatus = TASK_STATUSES.reduce((acc, s) => {
    acc[s] = tasks?.filter((t) => t.status === s) ?? [];
    return acc;
  }, {});

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks?.find((t) => t.id === active.id) ?? null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id;
    const task = tasks?.find((t) => t.id === taskId);
    if (!task) return;

    // Dropped on a column
    if (TASK_STATUSES.includes(over.id)) {
      if (task.status !== over.id) {
        updateTask.mutate({ id: taskId, status: over.id });
      }
      return;
    }

    // Dropped on another task — find its column
    const overTask = tasks?.find((t) => t.id === over.id);
    if (overTask && overTask.status !== task.status) {
      updateTask.mutate({ id: taskId, status: overTask.status });
    }
  };

  const openAdd = (status) => {
    setDefaultStatus(status);
    openAddModal();
  };

  const openTask = (task) => {
    setSelectedTask(task);
    openTaskModal();
  };

  const logout = () => {
    pb.authStore.clear();
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
      {/* <Sidebar project={project} /> */}

      {/* Main content */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <Box className="topbar">
          <Group gap={8} style={{ flex: 1 }}>
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
              <Tabs.List gap={4}>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Box
                style={{
                  display: 'flex',
                  gap: 16,
                  minWidth: 'max-content',
                  alignItems: 'flex-start',
                }}
              >
                {TASK_STATUSES.map((status) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                    onAddTask={openAdd}
                    onTaskClick={openTask}
                  />
                ))}
              </Box>

              <DragOverlay>
                {activeTask ? (
                  <Box style={{ transform: 'rotate(2deg)', opacity: 0.9 }}>
                    <TaskCard task={activeTask} onClick={() => {}} />
                  </Box>
                ) : null}
              </DragOverlay>
            </DndContext>
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
                <DirectMessages members={allMembers} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Modals */}
      <TaskModal
        task={selectedTask}
        opened={taskModalOpen}
        onClose={closeTaskModal}
        projectId={projectId}
        members={allMembers}
      />
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
