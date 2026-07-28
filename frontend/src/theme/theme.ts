import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F2C59',
      light: '#1E40AF',
      dark: '#071931',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6B4A',
      light: '#FF8A70',
      dark: '#D94E2F',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    success: {
      main: '#10B981',
    },
    error: {
      main: '#EF4444',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: [
      'Plus Jakarta Sans',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 800,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: '#0F2C59',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#0F2C59',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.35rem',
      lineHeight: 1.35,
      color: '#0F2C59',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.15rem',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      color: '#475569',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
      color: '#0F172A',
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.5,
      color: '#475569',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '10px 22px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(15, 44, 89, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          '& fieldset': {
            borderColor: '#CBD5E1',
          },
          '&:hover fieldset': {
            borderColor: '#0F2C59',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0F2C59',
            borderWidth: '2px',
          },
        },
      },
    },
  },
});
