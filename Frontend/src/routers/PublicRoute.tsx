import type React from "react"
import { Navigate } from "react-router-dom"
import { ROUTES } from "../constants"
import { useAuth } from "../contexts/AuthContext"
import { Box, CircularProgress } from "@mui/material"

interface PublicRouteProps {
    children: React.ReactNode
}

/**
 * Public route component
 * Redirect to dashboard if user is already authenticated
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (user) {
        return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />
    }

    return <>{children}</>
}

export default PublicRoute
