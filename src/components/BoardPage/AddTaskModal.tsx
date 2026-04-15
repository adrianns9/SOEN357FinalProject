import { useState } from 'react';
import { Modal, Stack, TextInput, Textarea, Select, Button, Group } from '@mantine/core';
import { STATUS_META, TASK_STATUSES, type TaskStatus, type User } from '@/schemas';
import { useCreateTask } from '@/queries';

interface Props {
  opened: boolean;
  onClose: () => void;
  projectId: string;
  defaultStatus: TaskStatus;
  members: User[];
}

export function AddTaskModal({ opened, onClose, projectId, defaultStatus, members }: Props) {
  const createTask = useCreateTask(projectId);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus || 'backlog',
    assignee: '',
  });

  const set = (k) => (v) =>
    setForm((f) => ({ ...f, [k]: typeof v === 'string' ? v : v?.target?.value }));

  const submit = () => {
    if (!form.title.trim()) return;
    createTask.mutate(
      {
        project: projectId,
        title: form.title,
        description: form.description,
        status: form.status,
        assignee: form.assignee,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({ title: '', description: '', status: defaultStatus || 'backlog', assignee: '' });
        },
      }
    );
  };

  const statusData = TASK_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label }));
  const memberData = members?.map((m) => ({ value: m.id, label: m.name })) ?? [];

  return (
    <Modal opened={opened} onClose={onClose} title="New Task" radius="lg">
      <Stack gap="sm">
        <TextInput
          label="Task title"
          placeholder="e.g. Write introduction section"
          value={form.title}
          onChange={set('title')}
          required
          data-autofocus
        />
        <Textarea
          label="Description"
          placeholder="Optional details, links, or context..."
          rows={3}
          value={form.description}
          onChange={set('description')}
        />
        <Group grow>
          <Select label="Status" data={statusData} value={form.status} onChange={set('status')} />
          <Select
            label="Assignee"
            data={memberData}
            value={form.assignee}
            onChange={set('assignee')}
            clearable
            placeholder="Unassigned"
          />
        </Group>
        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={createTask.isPending} disabled={!form.title.trim()}>
            Create task
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
