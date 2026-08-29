import { createTheme } from '@mui/material/styles';

export const colors = {
  primary: '#0D9488', // Serene Teal
  primaryDark: '#0F766E', // Deep Calming Teal
  primaryLight: '#2DD4BF', // Light Mint Teal
  secondary: '#F59E0B', // Soft Amber
  secondaryDark: '#D97706',
  accent: '#F43F5E', // Muted Rose
  dark: '#0F172A', // Slate 900
  bg: '#F8FAFC', // Slate 50 (Very calm off-white)
  white: '#FFFFFF',
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  lightGray: '#F1F5F9', // Slate 100
  borderGray: '#E2E8F0', // Slate 200 (Subtle borders)
  emerald: '#10B981',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  blue: '#3B82F6',
};

// Dark mode specific colors
export const darkColors = {
  primary: '#0D9488',
  primaryDark: '#0F766E',
  primaryLight: '#2DD4BF',
  secondary: '#F59E0B',
  secondaryDark: '#D97706',
  accent: '#F43F5E',
  dark: '#020617', // Slate 950
  bg: '#0F172A', // Slate 900
  paper: '#1E293B', // Slate 800
  white: '#F8FAFC',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8', // Slate 400
  lightGray: '#334155',
  borderGray: '#334155',
  emerald: '#10B981',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  blue: '#3B82F6',
};

const getTheme = (mode = 'light') => {
  const colorScheme = mode === 'dark' ? darkColors : colors;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colorScheme.primary,
        dark: colorScheme.primaryDark,
        light: colorScheme.primaryLight,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: colorScheme.secondary,
        dark: colorScheme.secondaryDark,
        light: '#FDE68A',
        contrastText: mode === 'dark' ? '#F8FAFC' : '#0F172A',
      },
      background: {
        default: colorScheme.bg,
        paper: mode === 'dark' ? colorScheme.paper : colorScheme.white,
      },
      text: {
        primary: colorScheme.textPrimary,
        secondary: colorScheme.textSecondary,
      },
      error: { main: colorScheme.red },
      success: { main: colorScheme.green },
      warning: { main: colorScheme.orange },
      info: { main: colorScheme.blue },
      divider: colorScheme.borderGray,
    },
    typography: {
      fontFamily: `'Plus Jakarta Sans', 'Poppins', 'Segoe UI', -apple-system, sans-serif`,
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
      },
      body1: { fontSize: '1rem', lineHeight: 1.7 },
      body2: { fontSize: '0.875rem', lineHeight: 1.7 },
      subtitle1: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 20px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:active': {
              transform: 'scale(0.97)',
            },
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: mode === 'dark' ? '0 8px 20px rgba(0,0,0,0.3)' : '0 8px 20px rgba(13, 148, 136, 0.12)',
            },
          },
          containedPrimary: {
            background: colorScheme.primary,
            boxShadow: mode === 'dark' ? 'none' : '0 4px 12px rgba(13, 148, 136, 0.15)',
            '&:hover': {
              background: colorScheme.primaryDark,
              boxShadow: mode === 'dark' ? 'none' : '0 6px 16px rgba(13, 148, 136, 0.25)',
            },
          },
          containedSecondary: {
            background: colorScheme.secondary,
            boxShadow: mode === 'dark' ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.15)',
            '&:hover': {
              background: colorScheme.secondaryDark,
              boxShadow: mode === 'dark' ? 'none' : '0 6px 16px rgba(245, 158, 11, 0.25)',
            },
          },
          outlined: {
            borderColor: colorScheme.borderGray,
            '&:hover': {
              borderColor: colorScheme.primary,
              backgroundColor: `rgba(13, 148, 136, ${mode === 'dark' ? '0.12' : '0.04'})`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${colorScheme.borderGray}`,
            boxShadow: mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(148, 163, 184, 0.05)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.2s ease-in-out',
              backgroundColor: mode === 'dark' ? colorScheme.paper : 'transparent',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colorScheme.primaryLight,
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colorScheme.primary,
                  borderWidth: 1.5,
                },
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 4px 24px rgba(148, 163, 184, 0.06)',
            border: `1px solid ${colorScheme.borderGray}`,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: mode === 'dark' ? '#1E293B' : '#F8FAFC',
              color: mode === 'dark' ? colorScheme.textPrimary : '#1E293B',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderBottom: `2px solid ${colorScheme.borderGray}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '14px 18px',
            borderBottom: `1px solid ${colorScheme.borderGray}`,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: `rgba(13, 148, 136, ${mode === 'dark' ? '0.1' : '0.03'})`,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: `rgba(13, 148, 136, ${mode === 'dark' ? '0.12' : '0.06'})`,
            },
          },
        },
      },
    },
  });
};

export const theme = getTheme('light');
export const darkTheme = getTheme('dark');
export const createAppTheme = (mode = 'light') => getTheme(mode);

export default theme;