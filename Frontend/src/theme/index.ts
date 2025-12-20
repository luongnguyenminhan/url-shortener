import type { ThemeOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark') => {
    const baseTheme: ThemeOptions = {
        palette: {
            mode,
            primary: {
                main: mode === 'light' ? '#1976d2' : '#90caf9',
                light: mode === 'light' ? '#42a5f5' : '#e3f2fd',
                dark: mode === 'light' ? '#1565c0' : '#42a5f5',
            },
            secondary: {
                main: mode === 'light' ? '#dc004e' : '#f48fb1',
                light: mode === 'light' ? '#ff5983' : '#fce4ec',
                dark: mode === 'light' ? '#9a0036' : '#ad1457',
            },
            success: {
                main: '#4caf50',
            },
            warning: {
                main: '#ff9800',
            },
            error: {
                main: '#f44336',
            },
            info: {
                main: '#2196f3',
            },
            background: {
                default: mode === 'light' ? '#ffffff' : '#121212',
                paper: mode === 'light' ? '#fafafa' : '#1e1e1e',
            },
            text: {
                primary: mode === 'light' ? '#212121' : '#f5f5f5',
                secondary: mode === 'light' ? '#616161' : '#bababa',
            },
        },
        typography: {
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
            h1: {
                fontSize: '3rem',
                fontWeight: 700,
                lineHeight: 1.25,
            },
            h2: {
                fontSize: '2.25rem',
                fontWeight: 700,
                lineHeight: 1.25,
            },
            h3: {
                fontSize: '1.875rem',
                fontWeight: 700,
                lineHeight: 1.25,
            },
            h4: {
                fontSize: '1.5rem',
                fontWeight: 700,
                lineHeight: 1.25,
            },
            h5: {
                fontSize: '1.25rem',
                fontWeight: 700,
                lineHeight: 1.25,
            },
            h6: {
                fontSize: '1.125rem',
                fontWeight: 700,
                lineHeight: 1.25,
            },
            body1: {
                fontSize: '1rem',
                lineHeight: 1.5,
            },
            body2: {
                fontSize: '0.875rem',
                lineHeight: 1.5,
            },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 8,
                        transition: 'all 0.25s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        transition: 'all 0.25s ease-in-out',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 8,
                            transition: 'all 0.25s ease-in-out',
                        },
                    },
                },
            },
        },
    };

    return createTheme(baseTheme);
};
