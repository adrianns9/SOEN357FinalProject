import { Box, Text, Group, ActionIcon, Badge } from '@mantine/core';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IconPlus } from '@tabler/icons-react';
import { TaskCard } from './TaskCard';
import { STATUS_META } from '@/queries';

export function KanbanColumn({ status, tasks, onAddTask, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = STATUS_META[status];

  return (
    <Box className="kanban-col" style={{ outline: isOver ? `2px solid ${meta.color}` : undefined }}>
      <Box className="kanban-col-header">
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
      </Box>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <Box
          ref={setNodeRef}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 60, flex: 1 }}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </Box>
      </SortableContext>
    </Box>
  );
}
