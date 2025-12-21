import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from './routes';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  element: ReactNode;
}

/**
 * ProtectedRoute wrapper component
 * Checks authentication status and redirects to login if not authenticated
 * Shows loading spinner while checking auth status
 */
export function ProtectedRoute({ element }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Render protected content
  return <>{element}</>;
}

export default ProtectedRoute;
