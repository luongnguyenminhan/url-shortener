import { createBrowserRouter, Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"
import MainLayout from "../components/layouts/MainLayout"
import PublicRoute from "./PublicRoute"
import PrivateRoute from "./PrivateRoute"
import LoginPage from "../modules/auth/pages/LoginPage"

import NotFoundPage from "../components/NotFoundPage"
import UnauthorizedPage from "../components/UnauthorizedPage"
import { Box, Typography } from "@mui/material"
import LandingPage from "../modules/landing/pages/LandingPage"
import AuthLayout from "../components/layouts/AuthLayout"
import { ROUTES } from "../constants"
import ProjectManagementPage from "@/modules/projects/pages/ProjectManagementPage"
import { ProjectDetail } from "@/modules/projects/components"


const DevelopmentPage = () => {
    const { t } = useTranslation('admin')

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh'
        }}>
            <Typography variant="h4" gutterBottom>
                {t('development.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
                {t('development.description')}
            </Typography>
        </Box>
    )
}

const RootLoader = () => {
    return <Outlet />
}

const router = createBrowserRouter([
    {
        path: ROUTES.HOME,
        element: <RootLoader />,
        children: [
            {
                index: true,
                element: <LandingPage />,
            },
            {
                path: "login",
                element: (
                    <PublicRoute>
                        <AuthLayout>
                            <LoginPage />
                        </AuthLayout>
                    </PublicRoute>
                ),
            },
            {
                path: "admin",
                element: (
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <DevelopmentPage />
                    },
                    {
                        path: "projects",
                        element: (
                            <PrivateRoute roles={[]}>
                                <ProjectManagementPage />
                            </PrivateRoute>
                        ),
                    },
                    {
                        path: "projects/:id",
                        element: (
                            <PrivateRoute roles={[]}>
                                <ProjectDetail />
                            </PrivateRoute>
                        ),
                    },
                ],
            },

            {
                path: "unauthorized",
                element: <UnauthorizedPage />,
            },

            {
                path: ROUTES.NOT_FOUND,
                element: <NotFoundPage />,
            },
        ],
    },
])

export default router
