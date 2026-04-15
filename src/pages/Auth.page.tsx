import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Title,
  Paper,
  Stack,
  Anchor,
  Box,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { authWithPassword, isLoggedIn, pb } from '@/lib/pocketbase';
import { useSearchParams } from 'react-router-dom';
import { useForm } from '@mantine/form';

export default function Component() {
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/projects';
  const isInviteFlow = params.has('redirect');

  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const form = useForm({
    initialValues: { email: '', password: '', name: '' },
  });

  const submit = form.onSubmit(async (values) => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await authWithPassword(values.email, values.password);
      } else {
        await pb.collection('users').create({
          email: values.email,
          password: values.password,
          passwordConfirm: values.password,
          name: values.name,
        });
        await authWithPassword(values.email, values.password);
      }
      navigate(redirect);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  if (isLoggedIn()) {
    return <Navigate to={redirect} replace />;
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EEF0FF 0%, #F8F7FF 50%, #E0E7FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Box style={{ width: '100%', maxWidth: 400 }}>
        <Box mb="xl" style={{ textAlign: 'center' }}>
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="1" width="6" height="16" rx="2" fill="white" fillOpacity="0.9" />
                <rect x="9" y="1" width="4" height="11" rx="2" fill="white" fillOpacity="0.7" />
                <rect x="15" y="1" width="2" height="7" rx="1" fill="white" fillOpacity="0.5" />
              </svg>
            </Box>
            <Title order={2} style={{ fontFamily: "'DM Sans'", fontWeight: 600, color: '#4F46E5' }}>
              Tasked
            </Title>
          </Box>
          <Text c="dimmed" size="sm">
            Kanban boards for university teams
          </Text>
        </Box>

        <Paper p="xl" shadow="sm" style={{ border: '1px solid #E0E4FF' }}>
          <Title order={4} mb="xs" style={{ fontWeight: 600 }}>
            {isInviteFlow
              ? mode === 'login'
                ? 'Join project'
                : 'Create account to join'
              : mode === 'login'
                ? 'Welcome back'
                : 'Create account'}
          </Title>

          <Text size="sm" c="dimmed" mb="lg">
            {isInviteFlow
              ? 'You’ve been invited to collaborate on a project'
              : mode === 'login'
                ? 'Sign in to your workspace'
                : 'Join Tasked to get started'}
          </Text>
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
              {error}
            </Alert>
          )}

          <Stack gap="sm">
            {mode === 'register' && (
              <>
                <TextInput
                  label="Full name"
                  placeholder="Jane Smith"
                  {...form.getInputProps('name')}
                />
              </>
            )}
            <TextInput
              label="Email"
              placeholder="you@university.edu"
              type="email"
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              {...form.getInputProps('password')}
            />
            <Button fullWidth mt="xs" loading={loading} onClick={submit} size="md">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </Stack>

          <Text size="sm" c="dimmed" mt="lg" ta="center">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Anchor
              size="sm"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Anchor>
          </Text>
        </Paper>
      </Box>
    </Box>
  );
}
