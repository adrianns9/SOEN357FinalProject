import {
  Box,
  Text,
  Group,
  Avatar,
  ActionIcon,
  Button,
  Stack,
  CopyButton,
  ScrollArea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconLink, IconX } from '@tabler/icons-react';
import { currentUser } from '@/lib/pocketbase';
import { useProject, useUpdateProject } from '@/queries';

export function Sidebar({ projectId }: { projectId: string }) {
  const user = currentUser();
  const { data: project } = useProject(projectId);
  const updateProject = useUpdateProject();

  const isOwner = project?.owner === user?.id;
  const owner = project?.expand?.owner;
  const invited = project?.expand?.invited ?? [];
  const allMembers = owner ? [owner, ...invited] : invited;
  const inviteLink = `${window.location.origin}/invite/${project?.id}`;

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
          {/* {isOwner && (
            <ActionIcon size="xs" variant="subtle" color="indigo" onClick={openInvite}>
              <IconUserPlus size={13} />
            </ActionIcon>
          )} */}
        </Group>

        <ScrollArea style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Stack>
            {allMembers.map((m) => (
              <Group key={m.id} justify="space-between" gap={8}>
                <Group gap={8}>
                  <Avatar size={28} radius="xl" color="indigo">
                    {m.name?.slice(0, 2)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Text size="xs" fw={500} lineClamp={1}>
                      {m.name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {m.id === project?.owner ? 'Owner' : `Member`}
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
    </Box>
  );
}
