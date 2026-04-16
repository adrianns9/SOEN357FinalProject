import React from 'react';
import { Box, Text, Group, Badge, Card, Stack, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { STATUS_META, type TaskExpanded, type TaskStatus } from '@/schemas';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/react';
import { CollisionPriority } from '@dnd-kit/abstract';

import classes from './KanbanColumn.module.css';

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
  const isBacklog = status === 'backlog';
  const showEmptyBacklog = isBacklog && tasks.length === 0;

  return (
    <Card
      ref={ref}
      withBorder
      className={classes.root}
      mih="70vh"
      miw={260}
      mod={{ isDropTarget }}
      style={{ '--status-color': meta.color } as React.CSSProperties}
    >
      <Stack h="100%" gap="sm">
        <Group justify="space-between" className={classes.header}>
          <Group gap={6}>
            <Box className={classes.dot} style={{ background: meta.color }} />
            <Text fw={500}>{meta.label}</Text>
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
        </Group>

        
        <Stack gap="sm" style={{ flex: 1 }}>
          {showEmptyBacklog ? (
            <Card
              withBorder
              padding="lg"
              radius="md"
              className={classes.emptyAddCard}
              onClick={() => onAddTask(status)}
            >
              <Stack gap={6} align="center" justify="center" h="100%">
                <IconPlus size={28} />
                <Text fw={600}>Add your first task</Text>
                <Text size="sm" c="dimmed" ta="center">
                  Create a task in backlog to start planning your work
                </Text>
              </Stack>
            </Card>
          ) : (
            tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                index={index}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))
          )}
        </Stack>
      </Stack>
    </Card>
  );
}