import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Title,
  Text,
  Button,
  Group,
  Stack,
  SimpleGrid,
  Card,
  ActionIcon,
  TextInput,
  Textarea,
  Modal,
  Menu,
  Avatar,
  Badge,
  Skeleton,
  Paper,
} from '@mantine/core';
import {
  IconPlus,
  IconDots,
  IconTrash,
  IconLogout,
  IconUsers,
  IconLayoutKanban,
} from '@tabler/icons-react';
import { currentUser, logoutUser } from '@/lib/pocketbase';
import { useDisclosure } from '@mantine/hooks';
import type { Project } from '@/schemas';
import { useCreateProject, useDeleteProject, useProjects } from '@/queries';

interface Props {
  project: Project;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

function ProjectCard({ project, onClick }: Props) {
  const user = currentUser();
  const isOwner = project.owner === user?.id;

  const del = useDeleteProject(project.id);

  const memberCount = (project.invited?.length ?? 0) + 1;

  return (
    <Card
      shadow="xs"
      padding="lg"
      radius="lg"
      style={{
        cursor: 'pointer',
        border: '1px solid #E5E7EB',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.12)';
        e.currentTarget.style.borderColor = '#C7D2FE';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '#E5E7EB';
      }}
    >
      <Group justify="space-between" mb="xs">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #818CF8, #6366F1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconLayoutKanban size={20} color="white" />
        </Box>
        {isOwner && (
          <Menu withinPortal position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  del.mutate();
                }}
              >
                Delete project
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Text fw={600} size="md" mt="sm" lineClamp={1}>
        {project.title || 'Untitled'}
      </Text>
      <Text size="sm" c="dimmed" lineClamp={2} mt={4} mb="md">
        {project.description || 'No description'}
      </Text>

      <Group justify="space-between">
        <Group gap={4}>
          <IconUsers size={14} color="#9CA3AF" />
          <Text size="xs" c="dimmed">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </Text>
        </Group>
        {!isOwner && (
          <Badge size="xs" variant="light" color="grape">
            Invited
          </Badge>
        )}
      </Group>
    </Card>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const user = currentUser();
  const { data: projects, isLoading } = useProjects();
  const [opened, { open, close }] = useDisclosure(false);
  const [form, setForm] = useState({ title: '', description: '' });

  const create = useCreateProject();

  const logout = () => {
    logoutUser();
    navigate('/auth');
  };

  return (
    <Box style={{ minHeight: '100vh', background: 'var(--col-bg)' }}>
      {/* Header */}
      <Box
        style={{
          background: 'white',
          borderBottom: '1px solid #E5E7EB',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Group gap={10}>
          <Box
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="6" height="16" rx="2" fill="white" fillOpacity="0.9" />
              <rect x="9" y="1" width="4" height="11" rx="2" fill="white" fillOpacity="0.7" />
              <rect x="15" y="1" width="2" height="7" rx="1" fill="white" fillOpacity="0.5" />
            </svg>
          </Box>
          <Text fw={700} size="lg" style={{ color: '#4F46E5', letterSpacing: '-0.02em' }}>
            Tasked
          </Text>
        </Group>
        <Group>
          <Group gap={8}>
            <Avatar size="sm" color="indigo" radius="xl">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </Avatar>
            <Text size="sm" fw={500}>
              {user?.name || user?.username}
            </Text>
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={logout} title="Sign out">
            <IconLogout size={18} />
          </ActionIcon>
        </Group>
      </Box>

      <Box style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <Group justify="space-between" mb="xl">
          <Box>
            <Title order={3} style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Your Projects
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              Manage your team's work in one place
            </Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={open} radius="md">
            New project
          </Button>
        </Group>

        {isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={180} radius="lg" />
            ))}
          </SimpleGrid>
        ) : projects?.length === 0 ? (
          <Paper
            radius="lg"
            p="xl"
            style={{ textAlign: 'center', border: '2px dashed #E0E4FF', background: 'transparent' }}
          >
            <IconLayoutKanban size={40} color="#C7D2FE" style={{ marginBottom: 12 }} />
            <Title order={5} c="dimmed" mb={4}>
              No projects yet
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              Create your first project to get started with your team
            </Text>
            <Button variant="light" onClick={open} leftSection={<IconPlus size={14} />}>
              Create project
            </Button>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {projects?.map((p) => (
              <ProjectCard key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Modal opened={opened} onClose={close} title="New Project" radius="lg">
        <Stack gap="sm">
          <TextInput
            label="Project name"
            placeholder="e.g. CS 401 Final Project"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            placeholder="What is this project about?"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" color="gray" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={() => create.mutate({ ...form, owner: user!.id }, { onSuccess: close })}
              loading={create.isPending}
              disabled={!form.title.trim()}
            >
              Create project
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
