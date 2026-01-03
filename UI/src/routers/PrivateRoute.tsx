import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { ROUTES } from "../constants"
import { useAuth } from "../contexts/AuthContext"
import { CircularProgress, Box } from "@mui/material"

interface PrivateRouteProps {
    children: React.ReactNode
    roles?: string[]
}

/**
 * Private route component
 * Redirect to login if user is not authenticated
 * Redirect to dashboard if user does not have required role
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    }

    return <>{children}</>
}

export default PrivateRoute
