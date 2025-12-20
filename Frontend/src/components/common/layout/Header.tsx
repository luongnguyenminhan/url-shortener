import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Drawer, IconButton, List, ListItem, ListItemText, Toolbar } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ThemeToggle, LanguageSwitcher } from '../ui';
import { getBrandConfig } from '../../../lib/utils/runtimeConfig';

interface HeaderProps {
    onLogin?: () => void;
    onSignup?: () => void;
    isAuthenticated?: boolean;
}

export function Header({ onLogin, onSignup, isAuthenticated = false }: HeaderProps) {
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const brandConfig = getBrandConfig();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        { label: t('header.nav.features'), href: '#features' },
        { label: t('header.nav.pricing'), href: '#pricing' },
        { label: t('header.nav.about'), href: '#about' },
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
                            component="img"
                            src={brandConfig.logo}
                            alt={brandConfig.name}
                            sx={{
                                height: '32px',
                                width: 'auto',
                                cursor: 'pointer',
                            }}
                        />
                        <Box
                            sx={{
                                fontSize: 'var(--font-size-xl)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                display: { xs: 'none', sm: 'block' }, // Hide on mobile to save space
                            }}
                        >
                            {brandConfig.name}
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
                        <LanguageSwitcher />
                        <ThemeToggle />

                        {!isAuthenticated && (
                            <>
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={onLogin}
                                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                                >
                                    {t('header.login')}
                                </Button>
                                <Button variant="contained" size="small" onClick={onSignup}>
                                    {t('header.signUp')}
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
                        <Box sx={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>{t('header.menu')}</Box>
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
                                {t('header.login')}
                            </Button>
                            <Button variant="contained" fullWidth onClick={onSignup}>
                                {t('header.signUp')}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </>
    );
}
