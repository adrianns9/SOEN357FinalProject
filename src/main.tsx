import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
});

const theme = createTheme({
  fontFamily: "'DM Sans', sans-serif",
  fontFamilyMonospace: "'DM Mono', monospace",
  primaryColor: 'indigo',
  defaultRadius: 'md',
  colors: {
    indigo: [
      '#EEF0FF',
      '#E0E4FF',
      '#C5CBFF',
      '#A5AEFF',
      '#818CF8',
      '#6366F1',
      '#4F46E5',
      '#4338CA',
      '#3730A3',
      '#312E81',
    ],
  },
  components: {
    Button: { defaultProps: { radius: 'md' } },
    TextInput: { defaultProps: { radius: 'md' } },
    PasswordInput: { defaultProps: { radius: 'md' } },
    Card: { defaultProps: { radius: 'lg' } },
    Modal: { defaultProps: { radius: 'lg' } },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications position="top-right" />
          <App />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
