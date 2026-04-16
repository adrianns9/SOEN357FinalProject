import { Text, Avatar, Group, Tooltip, Card, Progress, Stack } from '@mantine/core';
import { type TaskExpanded, type TaskStatus } from '@/schemas';

import classes from './TaskCard.module.css';
import { useDraggable } from '@dnd-kit/react';

interface Props extends React.ComponentPropsWithoutRef<'div'> {
  task: TaskExpanded;
  index: number;
}

function getTaskProgress(status: TaskStatus): number {
  switch (status) {
    case 'ready':
      return 33;
    case 'in progress':
      return 66;
    case 'done':
      return 100;
    case 'backlog':
    default:
      return 0;
  }
}

export function TaskCard({ task, onClick }: Props) {
  const { ref, isDragging } = useDraggable({
    id: task.id,
    type: 'item',
    data: task,
  });

  const assignees = task.expand.assignee;
  const progress = getTaskProgress(task.status);

  return (
    <Card
      withBorder
      ref={ref}
      className={classes.root}
      onClick={onClick}
      mod={{ dragging: isDragging }}
    >
      <Stack gap={8}>
        <Text fw={500} size="sm" lineClamp={2} style={{ lineHeight: 1.4 }}>
          {task.title}
        </Text>

        <Stack gap={4}>
          <Group justify="space-between" gap="xs">
            <Text size="xs" c="dimmed">
              Progress
            </Text>
            <Text size="xs" fw={600}>
              {progress}%
            </Text>
          </Group>

          <Progress value={progress} size="sm" radius="xl" />
        </Stack>

        <Group justify="flex-end" mt={4} gap="xs">
          {assignees?.map((assignee) => {
            return (
              <Tooltip key={assignee.id} label={assignee.name} withArrow>
                <Avatar size={22} radius="xl" color="indigo" style={{ cursor: 'default' }}>
                  {assignee.name?.slice(0, 2)?.toUpperCase()}
                </Avatar>
              </Tooltip>
            );
          })}
        </Group>
      </Stack>
    </Card>
  );
}
