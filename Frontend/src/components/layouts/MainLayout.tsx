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
        <Box sx={{
            bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40',
            height: '100%',
            color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0'
        }}>
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
                        color: theme.palette.mode === 'light' ? '#1976d2' : '#007bff',
                        cursor: 'pointer',
                        display: { xs: 'none', sm: 'block' },
                    }}
                >
                    {brandConfig.name}
                </Box>
            </Box>
            <Divider sx={{ borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#4b545c' }} />
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
                                    backgroundColor: isActive ? (theme.palette.mode === 'light' ? '#e3f2fd' : '#1f2d3d') : 'transparent',
                                    color: isActive ? (theme.palette.mode === 'light' ? '#1976d2' : '#007bff') : (theme.palette.mode === 'light' ? '#212121' : '#c2c7d0'),
                                    '&:hover': {
                                        backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: isActive ? (theme.palette.mode === 'light' ? '#1976d2' : '#007bff') : (theme.palette.mode === 'light' ? '#616161' : '#6c757d'),
                                    },
                                    '& .MuiListItemText-primary': {
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? (theme.palette.mode === 'light' ? '#1976d2' : '#007bff') : (theme.palette.mode === 'light' ? '#212121' : '#c2c7d0'),
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
            <Divider sx={{ borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#4b545c' }} />
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                            '&:hover': {
                                backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                            },
                            '& .MuiListItemIcon-root': {
                                color: theme.palette.mode === 'light' ? '#616161' : '#6c757d',
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
        </Box>
    )

    return (
        <Box sx={{ display: "flex", bgcolor: "var(--bg-primary)" }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : "100%" },
                    ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
                    bgcolor: theme.palette.mode === 'light' ? '#1976d2' : '#343a40',
                    color: '#ffffff',
                    boxShadow: "var(--shadow-md)",
                    borderBottom: theme.palette.mode === 'light' ? 'none' : '1px solid #4b545c',
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
                            color: "#ffffff",
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: "#ffffff" }}>
                        {t('layout.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2, color: "rgba(255, 255, 255, 0.9)" }}>
                        {t('layout.greeting')} {user?.email}
                    </Typography>
                    {/* <ThemeToggle /> */}
                    <Box sx={{ mr: 2 }}>
                        <LanguageSelector />
                    </Box>
                    <Button
                        sx={{
                            color: "#ffffff",
                            "&:hover": {
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'
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
                            bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40',
                            color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                            borderRight: theme.palette.mode === 'light' ? '1px solid #e0e0e0' : '1px solid #4b545c',
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
                            bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40',
                            color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                            borderRight: theme.palette.mode === 'light' ? '1px solid #e0e0e0' : '1px solid #4b545c',
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
                    bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                    minHeight: "100vh",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}

export default MainLayout
