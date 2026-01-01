import type { RouteObject } from 'react-router-dom';
import { ROUTES } from './routes';
import { ProtectedRoute } from './ProtectedRoute';

// Page components
import App from '../App';

// Placeholder pages for routes
const PlaceholderPage = () => <div>Page Coming Soon</div>;

/**
 * Main route configuration
 * Organized by logical groups: public, auth, protected, and error routes
 */
export const routeConfig: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <App />,
    errorElement: <div>Error Loading Page</div>,
    children: [
      // Public auth routes
      {
        path: ROUTES.LOGIN,
        element: <PlaceholderPage />,
      },
      {
        path: ROUTES.SIGNUP,
        element: <PlaceholderPage />,
      },
      {
        path: ROUTES.PASSWORD_RESET,
        element: <PlaceholderPage />,
      },
      {
        path: ROUTES.EMAIL_VERIFICATION,
        element: <PlaceholderPage />,
      },

      // Protected routes
      {
        path: ROUTES.DASHBOARD,
        element: <ProtectedRoute element={<PlaceholderPage />} />,
      },
      {
        path: ROUTES.LINKS,
        element: <ProtectedRoute element={<PlaceholderPage />} />,
      },
      {
        path: ROUTES.LINK_DETAIL,
        element: <ProtectedRoute element={<PlaceholderPage />} />,
      },
      {
        path: ROUTES.CREATE_LINK,
        element: <ProtectedRoute element={<PlaceholderPage />} />,
      },
      {
        path: ROUTES.EDIT_LINK,
        element: <ProtectedRoute element={<PlaceholderPage />} />,
      },
      {
        path: ROUTES.ANALYTICS,
        element: <ProtectedRoute element={<PlaceholderPage />} />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <ProtectedRoute element={<PlaceholderPage />} />,
      },
      {
        path: ROUTES.PROFILE,
        element: <ProtectedRoute element={<PlaceholderPage />} />,
      },

      // Error routes
      {
        path: ROUTES.NOT_FOUND,
        element: <PlaceholderPage />,
      },
      {
        path: ROUTES.SERVER_ERROR,
        element: <PlaceholderPage />,
      },

      // Catch all - must be last
      {
        path: ROUTES.WILDCARD,
        element: <PlaceholderPage />,
      },
    ],
  },
];

export default routeConfig;
