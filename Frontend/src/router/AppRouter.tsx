import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { AuthPage } from '@/pages/auth/Auth';
import { LandingPage } from '@/pages/landing/Landing';
import { Projects } from '@/pages/projects/Projects';

/**
 * Router component
 * Defines all routes and their corresponding pages
 * Follows composition pattern for better testability
 * Note: BrowserRouter is now in AppLayout to avoid duplicate providers
 */
export function AppRouter() {
  return (
    <Routes>
      {/* Landing page */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />

      {/* Unified auth route for login/signup/forgot password */}
      <Route path={ROUTES.LOGIN} element={<AuthPage />} />
      <Route path={ROUTES.AUTH} element={<AuthPage />} />
      <Route path={ROUTES.SIGNUP} element={<AuthPage />} />
      <Route path={ROUTES.PASSWORD_RESET} element={<AuthPage />} />
      <Route path={ROUTES.PROJECTS} element={<Projects />} />

      {/* Protected routes will be added here */}
      {/* <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute element={<DashboardPage />} />} /> */}
    </Routes>
  );
}

export default AppRouter;
