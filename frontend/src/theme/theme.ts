import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6', // Electric Blue
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B5CF6', // Indigo / Violet
      light: '#A78BFA',
      dark: '#6D28D9',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#030712', // Deep Space Midnight
      paper: '#0B1329',   // Translucent Space Navy
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
    success: {
      main: '#10B981',
    },
    error: {
      main: '#EF4444',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
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
      color: '#F8FAFC',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#F8FAFC',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.35rem',
      lineHeight: 1.35,
      color: '#F8FAFC',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.15rem',
      lineHeight: 1.4,
      color: '#F8FAFC',
    },
    subtitle1: {
      fontSize: '1rem',
      color: '#94A3B8',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
      color: '#E2E8F0',
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.5,
      color: '#94A3B8',
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
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.45)',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.45)',
            },
          },
        },
      ],
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '10px 22px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
          color: '#F8FAFC',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          '&:hover': {
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backgroundColor: 'rgba(11, 19, 41, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          backdropFilter: 'blur(16px)',
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
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.12)',
          },
          '&:hover fieldset': {
            borderColor: '#3B82F6',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#3B82F6',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(11, 19, 41, 0.4)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        },
        head: {
          fontWeight: 700,
          backgroundColor: 'rgba(11, 19, 41, 0.8)',
          color: '#94A3B8',
        },
      },
    },
  },
});
