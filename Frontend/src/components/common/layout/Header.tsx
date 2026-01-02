import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Drawer, IconButton, List, ListItem, ListItemText, Toolbar, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ThemeToggle, LanguageSwitcher } from '../ui';
import { getBrandConfig } from '../../../lib/utils/runtimeConfig';
import { useAuth } from '../../../context/AuthContext';

interface HeaderProps {
    onLogin?: () => void;
    onSignup?: () => void;
}

export function Header({ onLogin, onSignup }: HeaderProps) {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const brandConfig = getBrandConfig();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        await logout();
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

                    {isAuthenticated && user && (
                        <Box>
                            <Box
                                onClick={handleMenuOpen}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 'var(--spacing-md)',
                                    cursor: 'pointer',
                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                    borderRadius: '8px',
                                    transition: 'background-color var(--transition-fast)',
                                    '&:hover': {
                                        backgroundColor: 'var(--bg-secondary)',
                                    },
                                }}
                            >
                                <Tooltip title={user.name || user.email} placement="bottom">
                                    <Box
                                        sx={{
                                            display: { xs: 'none', sm: 'flex' },
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 'var(--spacing-sm)',
                                            height: 32,
                                        }}
                                    >
                                        <Box sx={{ 
                                            fontSize: 'var(--font-size-sm)', 
                                            color: 'var(--text-primary)', 
                                            lineHeight: 1,
                                            maxWidth: '150px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {user.name || user.email}
                                        </Box>
                                    </Box>
                                </Tooltip>
                                <Avatar
                                    src={user.avatar_url}
                                    alt={user.name || user.email}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        flexShrink: 0,
                                        '& img': {
                                            objectFit: 'cover',
                                            objectPosition: 'center',
                                        },
                                    }}
                                >
                                    {!user.avatar_url && (user.name?.[0] || user.email?.[0]?.toUpperCase())}
                                </Avatar>
                            </Box>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                sx={{
                                    '& .MuiPaper-root': {
                                        backgroundColor: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-primary)',
                                    },
                                }}
                            >
                                <MenuItem disabled>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                        <Tooltip title={user.name || 'User'} placement="right">
                                            <Box sx={{ 
                                                fontSize: 'var(--font-size-sm)', 
                                                fontWeight: 'var(--font-weight-bold)',
                                                maxWidth: '200px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {user.name || 'User'}
                                            </Box>
                                        </Tooltip>
                                        <Tooltip title={user.email} placement="right">
                                            <Box sx={{ 
                                                fontSize: 'var(--font-size-xs)', 
                                                color: 'var(--text-secondary)',
                                                maxWidth: '200px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {user.email}
                                            </Box>
                                        </Tooltip>
                                    </Box>
                                </MenuItem>
                                <MenuItem onClick={handleLogout} sx={{ color: 'var(--text-primary)' }}>
                                    <LogoutIcon sx={{ mr: 1 }} />
                                    {t('header.logout') || 'Logout'}
                                </MenuItem>
                            </Menu>
                        </Box>
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

                    {isAuthenticated && user && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    padding: 'var(--spacing-md)',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                }}
                            >
                                <Avatar
                                    src={user.avatar_url}
                                    alt={user.name || user.email}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        flexShrink: 0,
                                        '& img': {
                                            objectFit: 'cover',
                                            objectPosition: 'center',
                                        },
                                    }}
                                >
                                    {!user.avatar_url && (user.name?.[0] || user.email?.[0]?.toUpperCase())}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                    <Tooltip title={user.name || 'User'} placement="top">
                                        <Box sx={{ 
                                            fontSize: 'var(--font-size-sm)', 
                                            fontWeight: 'var(--font-weight-bold)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {user.name || 'User'}
                                        </Box>
                                    </Tooltip>
                                    <Tooltip title={user.email} placement="top">
                                        <Box sx={{ 
                                            fontSize: 'var(--font-size-xs)', 
                                            color: 'var(--text-secondary)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {user.email}
                                        </Box>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <Button variant="outlined" fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}>
                                {t('header.logout') || 'Logout'}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </>
    );
}
