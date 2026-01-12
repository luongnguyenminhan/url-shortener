import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored as 'light' | 'dark';

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <Tooltip title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
                onClick={toggleTheme}
                size="small"
                sx={{
                    color: '#ffffff',
                    transition: 'color var(--transition-fast)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                }}
                aria-label="toggle theme"
            >
                {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
        </Tooltip>
    );
}
