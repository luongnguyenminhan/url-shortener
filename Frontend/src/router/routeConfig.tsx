import { RouteObject } from 'react-router-dom';
import { ROUTES } from './routes';
import { ProtectedRoute } from './ProtectedRoute';

// Page components
import App from '../App';
import NotFound from '../pages/errors/NotFound';

// Lazy load page components for better performance
import { lazy } from 'react';

// Auth pages
const LoginPage = lazy(() =>
  import('../pages/auth/Login').then((module) => ({
    default: module.LoginPage,
  }))
);
const SignupPage = lazy(() =>
  import('../pages/auth/Signup').then((module) => ({
    default: module.SignupPage,
  }))
);
const PasswordResetPage = lazy(() =>
  import('../pages/auth/PasswordReset').then((module) => ({
    default: module.PasswordResetPage,
  }))
);
const EmailVerificationPage = lazy(() =>
  import('../pages/auth/EmailVerification').then((module) => ({
    default: module.EmailVerificationPage,
  }))
);

// Protected pages
const DashboardPage = lazy(() =>
  import('../pages/dashboard/Dashboard').then((module) => ({
    default: module.DashboardPage,
  }))
);
const LinksPage = lazy(() =>
  import('../pages/links/Links').then((module) => ({
    default: module.LinksPage,
  }))
);
const LinkDetailPage = lazy(() =>
  import('../pages/links/LinkDetail').then((module) => ({
    default: module.LinkDetailPage,
  }))
);
const CreateLinkPage = lazy(() =>
  import('../pages/links/CreateLink').then((module) => ({
    default: module.CreateLinkPage,
  }))
);
const EditLinkPage = lazy(() =>
  import('../pages/links/EditLink').then((module) => ({
    default: module.EditLinkPage,
  }))
);
const AnalyticsPage = lazy(() =>
  import('../pages/analytics/Analytics').then((module) => ({
    default: module.AnalyticsPage,
  }))
);
const SettingsPage = lazy(() =>
  import('../pages/settings/Settings').then((module) => ({
    default: module.SettingsPage,
  }))
);
const ProfilePage = lazy(() =>
  import('../pages/profile/Profile').then((module) => ({
    default: module.ProfilePage,
  }))
);

// Error pages
const ServerErrorPage = lazy(() =>
  import('../pages/errors/ServerError').then((module) => ({
    default: module.ServerErrorPage,
  }))
);

/**
 * Main route configuration
 * Organized by logical groups: public, auth, protected, and error routes
 */
export const routeConfig: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <App />,
    errorElement: <NotFound />,
    children: [
      // Public auth routes
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.SIGNUP,
        element: <SignupPage />,
      },
      {
        path: ROUTES.PASSWORD_RESET,
        element: <PasswordResetPage />,
      },
      {
        path: ROUTES.EMAIL_VERIFICATION,
        element: <EmailVerificationPage />,
      },

      // Protected routes
      {
        path: ROUTES.DASHBOARD,
        element: <ProtectedRoute element={<DashboardPage />} />,
      },
      {
        path: ROUTES.LINKS,
        element: <ProtectedRoute element={<LinksPage />} />,
      },
      {
        path: ROUTES.LINK_DETAIL,
        element: <ProtectedRoute element={<LinkDetailPage />} />,
      },
      {
        path: ROUTES.CREATE_LINK,
        element: <ProtectedRoute element={<CreateLinkPage />} />,
      },
      {
        path: ROUTES.EDIT_LINK,
        element: <ProtectedRoute element={<EditLinkPage />} />,
      },
      {
        path: ROUTES.ANALYTICS,
        element: <ProtectedRoute element={<AnalyticsPage />} />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <ProtectedRoute element={<SettingsPage />} />,
      },
      {
        path: ROUTES.PROFILE,
        element: <ProtectedRoute element={<ProfilePage />} />,
      },

      // Error routes
      {
        path: ROUTES.NOT_FOUND,
        element: <NotFound />,
      },
      {
        path: ROUTES.SERVER_ERROR,
        element: <ServerErrorPage />,
      },

      // Catch all - must be last
      {
        path: ROUTES.WILDCARD,
        element: <NotFound />,
      },
    ],
  },
];

export default routeConfig;
