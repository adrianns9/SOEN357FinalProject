import { Box, Text, Avatar, Group, Tooltip, Card } from '@mantine/core';
import type { TaskExpanded } from '@/schemas';

import classes from './TaskCard.module.css';
import { useDraggable } from '@dnd-kit/react';

interface Props extends React.ComponentPropsWithoutRef<'div'> {
  task: TaskExpanded;
  index: number;
}

export function TaskCard({ task, onClick }: Props) {
  const { ref, isDragging } = useDraggable({
    id: task.id,
    type: 'item',
    data: task,
  });

  const assignees = task.expand.assignee;

  return (
    <Card
      withBorder
      ref={ref}
      className={classes.root}
      onClick={onClick}
      mod={{ dragging: isDragging }}
    >
      <Text fw={500} size="sm" lineClamp={2} mb={6} style={{ lineHeight: 1.4 }}>
        {task.title}
      </Text>
      {task.description && (
        <Text size="xs" c="dimmed" lineClamp={2} mb={6} style={{ lineHeight: 1.5 }}>
          {task.description}
        </Text>
      )}
      <Group justify="flex-end" mt={4}>
        {assignees.map((assignee) => {
          return (
            <Tooltip key={assignee.id} label={assignee.name} withArrow>
              <Avatar size={22} radius="xl" color="indigo" style={{ cursor: 'default' }}>
                {assignee.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Tooltip>
          );
        })}
      </Group>
    </Card>
  );
}
