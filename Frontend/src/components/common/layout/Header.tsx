import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Drawer, IconButton, List, ListItem, ListItemText, Toolbar } from '@mui/material';
import { useState } from 'react';
import { Button, ThemeToggle } from '../ui';

interface HeaderProps {
    onLogin?: () => void;
    onSignup?: () => void;
    isAuthenticated?: boolean;
}

export function Header({ onLogin, onSignup, isAuthenticated = false }: HeaderProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'About', href: '#about' },
    ];

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid var(--border-primary)',
                }}
            >
                <Toolbar
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                    }}
                >
                    {/* Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <Box
                            sx={{
                                fontSize: 'var(--font-size-xl)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                            }}
                        >
                            LinkShort
                        </Box>
                    </Box>

                    {/* Desktop Navigation */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            gap: 'var(--spacing-lg)',
                            alignItems: 'center',
                        }}
                    >
                        {navItems.map((item) => (
                            <Box
                                key={item.label}
                                component="a"
                                href={item.href}
                                sx={{
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    transition: 'color var(--transition-fast)',
                                    '&:hover': {
                                        color: 'var(--color-primary)',
                                    },
                                }}
                            >
                                {item.label}
                            </Box>
                        ))}
                    </Box>

                    {/* Right Actions */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                        }}
                    >
                        <ThemeToggle />

                        {!isAuthenticated && (
                            <>
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={onLogin}
                                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                                >
                                    Login
                                </Button>
                                <Button variant="contained" size="small" onClick={onSignup}>
                                    Sign Up
                                </Button>
                            </>
                        )}

                        {/* Mobile Menu */}
                        <IconButton
                            color="inherit"
                            edge="end"
                            onClick={handleDrawerToggle}
                            sx={{ display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
                <Box
                    sx={{
                        width: 250,
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'var(--bg-primary)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 'var(--spacing-lg)' }}>
                        <Box sx={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>Menu</Box>
                        <IconButton size="small" onClick={handleDrawerToggle}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <List sx={{ flex: 1 }}>
                        {navItems.map((item) => (
                            <ListItem
                                key={item.label}
                                component="a"
                                href={item.href}
                                onClick={handleDrawerToggle}
                                sx={{
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    '&:hover': {
                                        backgroundColor: 'var(--bg-secondary)',
                                    },
                                }}
                            >
                                <ListItemText primary={item.label} />
                            </ListItem>
                        ))}
                    </List>

                    {!isAuthenticated && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <Button variant="text" fullWidth onClick={onLogin}>
                                Login
                            </Button>
                            <Button variant="contained" fullWidth onClick={onSignup}>
                                Sign Up
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </>
    );
}
