import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Drawer, IconButton, List, ListItem, ListItemText, Toolbar, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getBrandConfig } from '../../../config/envConfig';
import { Button, LanguageSwitcher, ThemeToggle } from '../../../components/common/ui';
import { ROUTES } from '../../../constants';
import { useAuth } from '../../../contexts/AuthContext';

interface HeaderProps {
    onLogin?: () => void;
    onSignup?: () => void;
}

export function Header({ onLogin, onSignup }: HeaderProps) {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const isAuthenticated = !!user;
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
        { label: t('header.nav.about'), href: '#about' },
    ];

    const authenticatedNavItems = [
        { label: t('header.nav.dashboard') || 'Dashboard', href: ROUTES.CLIENT.DASHBOARD },
        { label: t('header.nav.project') || 'My Projects', href: ROUTES.CLIENT.PROJECTS },
    ];

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    borderBottom: '1px solid var(--border-primary)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all var(--transition-normal)',
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
                        {(isAuthenticated ? authenticatedNavItems : navItems).map((item) => (
                            <Box
                                key={item.label}
                                component="a"
                                href={item.href}
                                sx={{
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    fontWeight: 'var(--font-weight-medium)',
                                    fontSize: 'var(--font-size-sm)',
                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                    borderRadius: 'var(--radius-md)',
                                    transition: 'all var(--transition-fast)',
                                    '&:hover': {
                                        color: 'var(--color-primary)',
                                        backgroundColor: 'var(--bg-secondary)',
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
                                    <Tooltip title={user.displayName || user.email} placement="bottom">
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
                                                {user.displayName || user.email}
                                            </Box>
                                        </Box>
                                    </Tooltip>
                                    <Avatar
                                        src={user.photoURL || undefined}
                                        alt={user.displayName || user.email || ''}
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
                                        {!user.photoURL && (user.displayName?.[0] || user.email?.[0]?.toUpperCase())}
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
                                            boxShadow: 'var(--shadow-lg)',
                                            marginTop: 'var(--spacing-sm)',
                                        },
                                    }}
                                >
                                    <MenuItem disabled>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                            <Tooltip title={user.displayName || 'User'} placement="right">
                                                <Box sx={{
                                                    fontSize: 'var(--font-size-sm)',
                                                    fontWeight: 'var(--font-weight-bold)',
                                                    maxWidth: '200px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {user.displayName || 'User'}
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
                            sx={{
                                display: { md: 'none' },
                                color: 'var(--text-primary)',
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                PaperProps={{
                    sx: {
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        borderLeft: '1px solid var(--border-primary)',
                    }
                }}
            >
                <Box
                    sx={{
                        width: 250,
                        padding: 'var(--spacing-lg)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 'var(--spacing-lg)' }}>
                        <Box sx={{
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--text-primary)'
                        }}>{t('header.menu')}</Box>
                        <IconButton
                            size="small"
                            onClick={handleDrawerToggle}
                            sx={{ color: 'var(--text-primary)' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <List sx={{ flex: 1 }}>
                        {(isAuthenticated ? authenticatedNavItems : navItems).map((item) => (
                            <ListItem
                                key={item.label}
                                component="a"
                                href={item.href}
                                onClick={handleDrawerToggle}
                                sx={{
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    mb: 'var(--spacing-xs)',
                                    transition: 'all var(--transition-fast)',
                                    '&:hover': {
                                        backgroundColor: 'var(--bg-secondary)',
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        sx: { color: 'var(--text-primary)' }
                                    }}
                                />
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
                                    src={user.photoURL || undefined}
                                    alt={user.displayName || user.email || ''}
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
                                    {!user.photoURL && (user.displayName?.[0] || user.email?.[0]?.toUpperCase())}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                    <Tooltip title={user.displayName || 'User'} placement="top">
                                        <Box sx={{
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 'var(--font-weight-bold)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {user.displayName || 'User'}
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
