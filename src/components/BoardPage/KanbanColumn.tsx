import { Box, Text, Group, ActionIcon, Badge, Card, Flex, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { STATUS_META, type TaskExpanded, type TaskStatus } from '@/schemas';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/react';
import { CollisionPriority } from '@dnd-kit/abstract';

interface Props {
  status: TaskStatus;
  tasks: TaskExpanded[];
  onAddTask: (status: TaskStatus) => void;
  onTaskClick: (task: TaskExpanded) => void;
}

export function KanbanColumn({ status, tasks, onAddTask, onTaskClick }: Props) {
  const { ref, isDropTarget } = useDroppable({
    id: status,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });
  const meta = STATUS_META[status];

  return (
    <Card
      ref={ref}
      withBorder
      className="kanban-col"
      style={{ flex: 1, outline: isDropTarget ? `2px solid ${meta.color}` : undefined }}
    >
      <Stack>
        <Group justify="space-between" className="kanban-col-header">
          <Group gap={6}>
            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
            <Text inherit>{meta.label}</Text>
            <Badge
              size="xs"
              variant="filled"
              color="gray"
              radius="xl"
              style={{ background: '#E5E7EB', color: '#6B7280' }}
            >
              {tasks.length}
            </Badge>
          </Group>
          <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => onAddTask(status)}>
            <IconPlus size={14} />
          </ActionIcon>
        </Group>

        <Stack gap="sm">
          {tasks.map((task, index) => (
            <TaskCard key={task.id} index={index} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
