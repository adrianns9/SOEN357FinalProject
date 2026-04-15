import { createTheme } from '@mantine/core';

export const theme = createTheme({
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
    // Button: { defaultProps: { radius: 'md' } },
    // TextInput: { defaultProps: { radius: 'md' } },
    // PasswordInput: { defaultProps: { radius: 'md' } },
    // Card: { defaultProps: { radius: 'lg' } },
    // Modal: { defaultProps: { radius: 'lg' } },
  },
});
