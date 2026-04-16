import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  MultiSelect,
} from '@mantine/core';
import { useForm } from '@mantine/form';
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

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      status: defaultStatus || 'backlog',
      assignee: [] as string[],
    },

    validate: {
      title: (value) => (value.trim().length === 0 ? 'Title is required' : null),
    },
  });

  const submit = form.onSubmit((values) => {
    createTask.mutate(
      {
        project: projectId,
        title: values.title,
        description: values.description,
        status: values.status,
        assignee: values.assignee,
      },
      {
        onSuccess: () => {
          onClose();
          form.reset();
          form.setFieldValue('status', defaultStatus || 'backlog'); // preserve default
        },
      }
    );
  });

  const statusData = TASK_STATUSES.map((s) => ({
    value: s,
    label: STATUS_META[s].label,
  }));

  const memberData =
    members?.map((m) => ({
      value: m.id,
      label: m.name!,
    })) ?? [];

  return (
    <Modal opened={opened} onClose={onClose} title="New Task">
      <form onSubmit={submit}>
        <Stack gap="sm">
          <TextInput
            label="Task title"
            placeholder="e.g. Write introduction section"
            required
            data-autofocus
            {...form.getInputProps('title')}
          />

          <Textarea
            label="Description"
            placeholder="Optional details, links, or context..."
            rows={3}
            {...form.getInputProps('description')}
          />

          <Group grow>
            <Select
              allowDeselect={false}
              label="Status"
              data={statusData}
              {...form.getInputProps('status')}
            />

            <MultiSelect
              label="Assignee"
              data={memberData}
              placeholder="Unassigned"
              clearable
              {...form.getInputProps('assignee')}
            />
          </Group>

          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" loading={createTask.isPending}>
              Create task
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
