# Router Configuration Guide

## Overview

The router module provides a centralized, type-safe routing system for the URL Shortener application. It manages all route paths, protected routes, and navigation.

## File Structure

```
src/router/
├── index.ts              # Module exports
├── routes.ts             # Route constants and configuration
├── routeConfig.tsx       # Main route configuration with lazy loading
└── ProtectedRoute.tsx    # Protected route wrapper component
```

## Core Concepts

### 1. Routes Constant (`routes.ts`)

All routes are defined in the `ROUTES` object for type-safe, DRY navigation:

```typescript
import { ROUTES } from './router/routes';

// Use these constants instead of hardcoded strings
navigate(ROUTES.LOGIN);      // Instead of navigate('/login')
navigate(ROUTES.DASHBOARD);  // Instead of navigate('/dashboard')
```

**Route Categories:**

- **Public Routes**: Accessible without authentication (login, signup, password reset)
- **Protected Routes**: Require authentication (dashboard, links, analytics)
- **Error Routes**: Error pages (404, 500)

### 2. Route Configuration (`routeConfig.tsx`)

Centralized route definitions with lazy loading for performance:

```typescript
export const routeConfig: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <App />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.DASHBOARD, element: <ProtectedRoute element={<DashboardPage />} /> },
      // ... more routes
    ]
  }
];
```

**Features:**

- Lazy loading of page components
- Organized by logical groups
- Error boundary support
- Nested route structure

### 3. Protected Routes (`ProtectedRoute.tsx`)

Wrapper component that enforces authentication:

```typescript
<ProtectedRoute element={<DashboardPage />} />
```

**Behavior:**

- Checks if user is authenticated
- Shows loading spinner while checking
- Redirects to login if not authenticated
- Renders component if authenticated

### 4. Navigation Hook (`useNavigation.ts`)

Custom hook providing type-safe navigation methods:

```typescript
import { useNavigation } from './hooks/useNavigation';

function MyComponent() {
  const { goLogin, goDashboard, goLinkDetail } = useNavigation();

  return (
    <>
      <button onClick={goLogin}>Login</button>
      <button onClick={goDashboard}>Dashboard</button>
      <button onClick={() => goLinkDetail('123')}>View Link</button>
    </>
  );
}
```

## Usage Examples

### Basic Navigation

```typescript
import { useNavigation } from '@/hooks/useNavigation';

function MyComponent() {
  const { goLogin, goSignup, goDashboard, goBack } = useNavigation();

  return (
    <>
      <button onClick={goLogin}>Login</button>
      <button onClick={goBack}>Back</button>
    </>
  );
}
```

### Dynamic Routes

```typescript
const { goLinkDetail, goEditLink } = useNavigation();

// Navigate to /links/123
goLinkDetail('123');

// Navigate to /links/123/edit
goEditLink('123');
```

### With useParams Hook

```typescript
import { useParams } from 'react-router-dom';

function LinkDetailPage() {
  const { id } = useParams<{ id: string }>();

  return <div>Link ID: {id}</div>;
}
```

## Route Structure

### Public Routes

```
/                    - Landing page
/login               - Login page
/signup              - Sign up page
/password-reset      - Password reset page
/verify-email        - Email verification page
```

### Protected Routes

```
/dashboard           - User dashboard
/links               - User's links list
/links/:id           - Link details
/links/:id/edit      - Edit link
/create              - Create new link
/analytics           - Analytics page
/settings            - Settings page
/profile             - User profile
```

### Error Routes

```
/404                 - Not found page
/500                 - Server error page
/*                   - Catch-all (404)
```

## Adding New Routes

### Step 1: Add Route Constant

```typescript
// src/router/routes.ts
export const ROUTES = {
  // ... existing routes
  MY_NEW_ROUTE: '/my-new-route',
} as const;
```

### Step 2: Create Page Component

```typescript
// src/pages/my-feature/MyNewPage.tsx
export function MyNewPageComponent() {
  return <div>My New Page</div>;
}
```

### Step 3: Add to Route Configuration

```typescript
// src/router/routeConfig.tsx
const MyNewPage = lazy(() =>
  import('../pages/my-feature/MyNewPage').then((module) => ({
    default: module.MyNewPageComponent,
  }))
);

// In routeConfig array:
{
  path: ROUTES.MY_NEW_ROUTE,
  element: <MyNewPage />,
}
```

### Step 4: Add Navigation Method (Optional)

```typescript
// src/hooks/useNavigation.ts
const goMyNewPage = () => navigate(ROUTES.MY_NEW_ROUTE);

return {
  // ... existing methods
  goMyNewPage,
};
```

## Navigation Configuration

The `NAVIGATION_CONFIG` object provides metadata for routes:

```typescript
export const NAVIGATION_CONFIG = {
  [ROUTES.DASHBOARD]: {
    label: 'Dashboard',
    requiresAuth: true,
    showInNav: true,
  },
  // ... more configs
};
```

**Properties:**

- `label`: Display name in navigation menus
- `requiresAuth`: Whether route requires authentication
- `showInNav`: Whether to show in navigation menu

## Helper Functions

### `isProtectedRoute(pathname: string)`

Check if a route requires authentication:

```typescript
import { isProtectedRoute } from './router/routes';

if (isProtectedRoute('/dashboard')) {
  // Route is protected
}
```

### `isPublicRoute(pathname: string)`

Check if a route is public:

```typescript
import { isPublicRoute } from './router/routes';

if (isPublicRoute('/login')) {
  // Route is public
}
```

### `buildRoute.linkDetail(id: string)`

Build dynamic route paths:

```typescript
import { buildRoute } from './router/routes';

const path = buildRoute.linkDetail('123'); // Returns '/links/123'
```

## Best Practices

1. **Always use ROUTES constant** instead of hardcoded strings
2. **Use useNavigation hook** for navigation instead of useNavigate
3. **Lazy load** page components for better performance
4. **Keep routes organized** by feature/domain
5. **Use ProtectedRoute** wrapper for authenticated pages
6. **Add metadata** to NAVIGATION_CONFIG for new routes
7. **Use buildRoute** helpers for dynamic paths

## Common Patterns

### Redirect After Login

```typescript
function LoginPage() {
  const { user, loginWithEmail } = useAuth();
  const { goDashboard } = useNavigation();

  const handleSubmit = async (email: string, password: string) => {
    await loginWithEmail(email, password);
    goDashboard(); // Redirect after successful login
  };

  return <LoginForm onSubmit={handleSubmit} />;
}
```

### Conditional Navigation

```typescript
function MyComponent() {
  const { user } = useAuth();
  const { goLogin, goDashboard } = useNavigation();

  useEffect(() => {
    if (!user) {
      goLogin();
    } else {
      goDashboard();
    }
  }, [user]);
}
```

### Deep Linking

```typescript
// Create a link to a specific resource
<Link to={buildRoute.linkDetail('123')}>View Link</Link>

// Or with useNavigation
const { goLinkDetail } = useNavigation();
<button onClick={() => goLinkDetail('123')}>View Link</button>
```

## Troubleshooting

### Route Not Found (404)

1. Check if route is defined in `ROUTES` constant
2. Verify route is added to `routeConfig`
3. Check spelling and path structure
4. Verify lazy load import path is correct

### Protected Route Not Working

1. Ensure `ProtectedRoute` wrapper is applied
2. Check `useAuth()` hook is returning correct `user` state
3. Verify authentication logic in `AuthContext`

### Navigation Not Working

1. Use `useNavigation()` hook instead of `useNavigate()`
2. Check route constant exists in `ROUTES`
3. Verify route exists in route configuration
4. Check browser console for errors

## Future Enhancements

- Route animation transitions
- Breadcrumb generation from routes
- Route permission system (admin, moderator roles)
- Route metadata validation
- SEO configuration per route
