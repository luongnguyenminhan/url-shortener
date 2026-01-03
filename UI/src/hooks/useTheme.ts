import { useState, useEffect } from 'react';

export function useTheme() {
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

    return { theme, toggleTheme, setTheme };
}
