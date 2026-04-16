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

export function Sidebar({
  projectId,
  selectedMemberId,
  onSelectMember,
}: {
  projectId: string;
  selectedMemberId?: string;
  onSelectMember?: (member: any) => void;
}) {
  const user = currentUser();
  const { data: project } = useProject(projectId);
  const updateProject = useUpdateProject();

  const isOwner = project?.owner === user?.id;
  const owner = project?.expand?.owner;
  const invited = project?.expand?.invited ?? [];
  const allMembers = owner ? [owner, ...invited] : invited;

  // Split for UX
  const selfMember = allMembers.find((m) => m.id === user?.id);
  const otherMembers = allMembers.filter((m) => m.id !== user?.id);
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
        {selfMember && (
          <Box mb="sm">
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              mb={6}
              style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              You
            </Text>

            <Group
              gap={8}
              style={{
                padding: '6px',
                borderRadius: 8,
                background: '#F8F9FA',
                cursor: 'not-allowed',
                opacity: 0.85,
              }}
            >
              <Avatar size={28} radius="xl" color="indigo">
                {selfMember.name?.slice(0, 2)?.toUpperCase()}
              </Avatar>

              <Box>
                <Text size="xs" fw={500}>
                  {selfMember.name}
                </Text>
                <Text size="xs" c="dimmed">
                  You {selfMember.id === project?.owner && '• Owner'}
                </Text>
              </Box>
            </Group>
          </Box>
        )}

        <Text
          size="xs"
          fw={600}
          c="dimmed"
          style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Members
        </Text>

        <ScrollArea style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Stack>
            {otherMembers.map((m) => {
              const isSelected = selectedMemberId === m.id;

              return (
                <Group
                  key={m.id}
                  justify="space-between"
                  gap={8}
                  onClick={() => onSelectMember?.(m)}
                  style={{
                    padding: '6px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: isSelected ? '#EEF0FF' : 'transparent',
                  }}
                >
                  <Group gap={8}>
                    <Avatar size={28} radius="xl" color="indigo">
                      {m.name?.slice(0, 2)?.toUpperCase()}
                    </Avatar>

                    <Box>
                      <Text size="xs" fw={500} lineClamp={1}>
                        {m.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {m.id === project?.owner ? 'Owner' : 'Member'}
                      </Text>
                    </Box>
                  </Group>

                  {isOwner && m.id !== project?.owner && (
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMember(m.id);
                      }}
                    >
                      <IconX size={11} />
                    </ActionIcon>
                  )}
                </Group>
              );
            })}
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
