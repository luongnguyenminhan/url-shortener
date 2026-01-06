import type React from "react"
import { useState } from "react"
import { useNavigate, useLocation, NavLink, Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
    useTheme,
    useMediaQuery,
} from "@mui/material"
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Logout as LogoutIcon,
} from "@mui/icons-material"
import { getBrandConfig } from "../../config/envConfig"
import { ThemeToggle } from "../common/ui/ThemeToggle"
import LanguageSelector from "../common/LanguageSelector"
import { ROUTES } from "../../constants"
import { useAuth } from "../../contexts/AuthContext"
import { signOut } from "firebase/auth"
import { auth } from "../../utils/firebaseConfig"

const drawerWidth = 280

interface MenuItem {
    path: string
    labelKey: string
    icon: React.ReactNode
    roles: string[]
}

const MainLayout: React.FC = () => {
    const { t } = useTranslation('admin')
    const [mobileOpen, setMobileOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))
    const navigate = useNavigate()
    const location = useLocation()
    const brandConfig = getBrandConfig();
    const { user } = useAuth();

    const menuItems: MenuItem[] = [
        {
            path: ROUTES.ADMIN.DASHBOARD,
            labelKey: "menu.dashboard",
            icon: <DashboardIcon />,
            roles: [],
        },
        {
            path: ROUTES.ADMIN.PROJECTS,
            labelKey: "menu.projects",
            icon: <PeopleIcon />,
            roles: [],
        }
    ]


    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen)
        } else {
            setSidebarOpen(!sidebarOpen)
        }
    }


    const handleLogout = async () => {
        try {
            if (auth) {
                await signOut(auth);
            }
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate(ROUTES.LOGIN);
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    const drawer = (
        <div>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', 'padding': "16px 15px" }}>
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
                        display: { xs: 'none', sm: 'block' },
                    }}
                >
                    {brandConfig.name}
                </Box>
            </Box>
            <Divider sx={{ borderColor: 'var(--border-primary)' }} />
            <List>
                {menuItems.map((item) => {
                    // Check if current path matches the menu item
                    // Exact match or starts with item.path/ (with trailing slash to avoid partial matches)
                    const isActive = location.pathname === item.path ||
                        (item.path !== ROUTES.ADMIN.DASHBOARD &&
                            location.pathname.startsWith(`${item.path}/`));

                    return (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                component={NavLink}
                                to={item.path}
                                onClick={() => {
                                    if (isMobile) {
                                        setMobileOpen(false)
                                    }
                                }}
                                sx={{
                                    backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                                    color: isActive ? 'var(--color-primary)' : 'var(--text-primary)',
                                    '&:hover': {
                                        backgroundColor: 'var(--bg-tertiary)',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                                    },
                                    '& .MuiListItemText-primary': {
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? 'var(--color-primary)' : 'var(--text-primary)',
                                    },
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={t(item.labelKey)} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <Divider sx={{ borderColor: 'var(--border-primary)' }} />
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            color: 'var(--text-primary)',
                            '&:hover': {
                                backgroundColor: 'var(--bg-tertiary)',
                            },
                            '& .MuiListItemIcon-root': {
                                color: 'var(--text-secondary)',
                            },
                        }}
                    >
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary={t('menu.logout')} />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    )

    return (
        <Box sx={{ display: "flex", bgcolor: "var(--bg-primary)" }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : "100%" },
                    ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
                    bgcolor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    boxShadow: "var(--shadow-sm)",
                    borderBottom: "1px solid var(--border-primary)",
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            color: "var(--text-primary)",
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: "var(--text-primary)" }}>
                        {t('layout.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2, color: "var(--text-secondary)" }}>
                        {t('layout.greeting')} {user?.email}
                    </Typography>
                    <ThemeToggle />
                    <Box sx={{ mr: 2 }}>
                        <LanguageSelector />
                    </Box>
                    <Button
                        sx={{
                            color: "var(--text-primary)",
                            "&:hover": {
                                bgcolor: "var(--bg-tertiary)"
                            }
                        }}
                        onClick={handleLogout}
                    >
                        {t('menu.logout')}
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Drawer for mobile */}
            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                            bgcolor: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            borderRight: "1px solid var(--border-primary)",
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Drawer for desktop */}
                <Drawer
                    variant="persistent"
                    open={sidebarOpen}
                    sx={{
                        display: { xs: "none", md: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                            bgcolor: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            borderRight: "1px solid var(--border-primary)",
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: {
                        md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : "100%",
                    },
                    mt: 8,
                    bgcolor: "var(--bg-primary)",
                    minHeight: "100vh",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}

export default MainLayout
