import { Box, Text, Badge, Avatar, Group, Tooltip } from '@mantine/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const assignee = task.expand?.assignee;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
      onClick={onClick}
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
        {assignee && (
          <Tooltip label={assignee.name || assignee.username} withArrow>
            <Avatar size={22} radius="xl" color="indigo" style={{ cursor: 'default' }}>
              {(assignee.name || assignee.username)?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Tooltip>
        )}
      </Group>
    </Box>
  );
}
