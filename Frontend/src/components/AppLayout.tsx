import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useTheme } from '@/hooks/useTheme';
import { createAppTheme } from '@/theme';
import { ToastContainer } from '@/hooks/useShowToast';
import { AuthProvider } from '@/context/AuthContext';
import AppRouter from '@/router/AppRouter';

/**
 * App layout wrapper component
 * Provides theme and global providers
 * Delegates routing to AppRouter component
 *
 * Provider Order (Important):
 * 1. BrowserRouter (must be first for useNavigate)
 * 2. ThemeProvider (MUI theming)
 * 3. AuthProvider (auth context - depends on Router)
 * 4. AppRouter (routes)
 *
 * SOLID Principles:
 * - Single Responsibility: Only manages theming and global providers
 * - Open/Closed: Extensible through AppRouter for new routes
 * - Liskov Substitution: Proper composition pattern
 * - Interface Segregation: Components only expose necessary props
 * - Dependency Inversion: Depends on abstractions (theme, router)
 */
export function AppLayout() {
  const { theme: mode } = useTheme();
  const theme = createAppTheme(mode);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CssBaseline />
          <ToastContainer />
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default AppLayout;
