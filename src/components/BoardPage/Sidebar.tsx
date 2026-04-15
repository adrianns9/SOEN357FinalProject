import { useState } from 'react';
import {
  Box,
  Text,
  Group,
  Avatar,
  ActionIcon,
  Button,
  TextInput,
  Stack,
  Divider,
  Modal,
  CopyButton,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconUserPlus,
  IconCopy,
  IconCheck,
  IconLink,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { currentUser } from '@/lib/pocketbase';
import { useProject, useSearchUser, useUpdateProject } from '@/queries';

export function Sidebar({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const user = currentUser();
  const [inviteOpen, { open: openInvite, close: closeInvite }] = useDisclosure(false);
  const [username, setUsername] = useState('');
  const { data: project } = useProject(projectId);
  const updateProject = useUpdateProject();
  const searchUser = useSearchUser();

  const isOwner = project?.owner === user?.id;
  const owner = project?.expand?.owner;
  const invited = project?.expand?.invited ?? [];
  const allMembers = owner ? [owner, ...invited] : invited;
  const inviteLink = `${window.location.origin}/projects/${project?.id}`;

  const addMember = async () => {
    if (!username.trim()) return;
    try {
      const found = await searchUser.mutateAsync(username.trim());
      if (found.id === user!.id) {
        notifications.show({ color: 'orange', message: "You're already in this project." });
        return;
      }
      const currentInvited = project?.invited ?? [];
      if (currentInvited.includes(found.id)) {
        notifications.show({ color: 'orange', message: 'This user is already invited.' });
        return;
      }
      await updateProject.mutateAsync({
        id: projectId,
        data: { invited: [...currentInvited, found.id] },
      });
      notifications.show({ color: 'green', message: `${found.name || found.username} added!` });
      setUsername('');
    } catch {}
  };

  const removeMember = async (memberId: string) => {
    const currentInvited = project?.invited ?? [];
    await updateProject.mutateAsync({
      id: projectId,
      data: { invited: currentInvited.filter((id) => id !== memberId) },
    });
    notifications.show({ color: 'green', message: 'Member removed.' });
  };

  return (
    <Box className="sidebar">
      {/* Logo + back */}
      <Box style={{ padding: '16px 16px 12px' }}>
        <Group gap={8} mb={16}>
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => navigate('/')}>
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Group gap={6}>
            <Box
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="1" width="6" height="16" rx="2" fill="white" fillOpacity="0.9" />
                <rect x="9" y="1" width="4" height="11" rx="2" fill="white" fillOpacity="0.7" />
                <rect x="15" y="1" width="2" height="7" rx="1" fill="white" fillOpacity="0.5" />
              </svg>
            </Box>
            <Text fw={700} size="sm" style={{ color: '#4F46E5' }}>
              Tasked
            </Text>
          </Group>
        </Group>

        <Text fw={600} size="sm" lineClamp={2} style={{ lineHeight: 1.3 }}>
          {project?.title || 'Loading...'}
        </Text>
        {project?.description && (
          <Text size="xs" c="dimmed" lineClamp={2} mt={4} style={{ lineHeight: 1.5 }}>
            {project.description}
          </Text>
        )}
      </Box>

      <Divider />

      {/* Members */}
      <Box style={{ padding: '14px 16px', flex: 1 }}>
        <Group justify="space-between" mb="sm">
          <Text
            size="xs"
            fw={600}
            c="dimmed"
            style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            Members
          </Text>
          {isOwner && (
            <ActionIcon size="xs" variant="subtle" color="indigo" onClick={openInvite}>
              <IconUserPlus size={13} />
            </ActionIcon>
          )}
        </Group>

        <ScrollArea style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Stack gap={6}>
            {allMembers.map((m) => (
              <Group key={m.id} justify="space-between" gap={8}>
                <Group gap={8}>
                  <Avatar size={28} radius="xl" color="indigo">
                    {(m.name || m.username)?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Text size="xs" fw={500} lineClamp={1}>
                      {m.name || m.username}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {m.id === project?.owner ? 'Owner' : `@${m.username}`}
                    </Text>
                  </Box>
                </Group>
                {isOwner && m.id !== user!.id && m.id !== project?.owner && (
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={() => removeMember(m.id)}
                  >
                    <IconX size={11} />
                  </ActionIcon>
                )}
              </Group>
            ))}
          </Stack>
        </ScrollArea>
      </Box>

      {/* Invite quick link at bottom */}
      {isOwner && (
        <Box style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB' }}>
          <CopyButton value={inviteLink} timeout={2000}>
            {({ copied, copy }) => (
              <Button
                fullWidth
                size="xs"
                variant="light"
                color={copied ? 'green' : 'indigo'}
                leftSection={copied ? <IconCheck size={13} /> : <IconLink size={13} />}
                onClick={copy}
              >
                {copied ? 'Link copied!' : 'Copy invite link'}
              </Button>
            )}
          </CopyButton>
        </Box>
      )}

      {/* Invite modal */}
      <Modal
        opened={inviteOpen}
        onClose={closeInvite}
        title="Invite teammate"
        radius="lg"
        size="sm"
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Add a teammate by their username, or share the invite link below.
          </Text>
          <Group gap="xs">
            <TextInput
              flex={1}
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMember()}
              leftSection={
                <Text size="xs" c="dimmed">
                  @
                </Text>
              }
            />
            <Button onClick={addMember} loading={searchUser.isPending || updateProject.isPending}>
              Add
            </Button>
          </Group>

          <Divider label="or share link" labelPosition="center" />

          <CopyButton value={inviteLink} timeout={2000}>
            {({ copied, copy }) => (
              <Button
                variant="light"
                color={copied ? 'green' : 'gray'}
                leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                onClick={copy}
                fullWidth
              >
                {copied ? 'Copied!' : inviteLink}
              </Button>
            )}
          </CopyButton>
        </Stack>
      </Modal>
    </Box>
  );
}
