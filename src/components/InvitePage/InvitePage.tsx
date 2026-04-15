import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Button, Paper, Title, Text, Stack, Loader, Center } from '@mantine/core';
import { isLoggedIn, currentUser } from '@/lib/pocketbase';
import { useAddMember, useProject } from '@/queries';

export function InvitePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading } = useProject(projectId!);
  const addProjectUser = useAddMember();

  const user = currentUser();

  // Not logged in - redirect to auth with return URL
  if (!isLoggedIn()) {
    return <Navigate to={`/auth?redirect=/invite/${projectId}`} replace />;
  }

  if (isLoading || !project) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  const alreadyMember = project.owner === user?.id || project.invited?.includes(user!.id);

  const joinProject = async () => {
    if (alreadyMember) {
      navigate(`/projects/${projectId}`);
      return;
    }

    await addProjectUser.mutateAsync({
      id: projectId!,
      memberId: user!.id,
    });

    navigate(`/projects/${projectId}`);
  };

  return (
    <Center h="100vh" bg="gray.0">
      <Paper p="xl" radius="lg" shadow="sm" withBorder maw={420} w="100%">
        <Stack>
          <Title order={3}>You're invited 🎉</Title>

          <Text size="sm" c="dimmed">
            Join the project:
          </Text>

          <Text fw={600}>{project.title}</Text>

          {project.description && (
            <Text size="sm" c="dimmed">
              {project.description}
            </Text>
          )}

          <Button onClick={joinProject} loading={addProjectUser.isPending}>
            {alreadyMember ? 'Go to project' : 'Join project'}
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
