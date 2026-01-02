/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Route paths and configurations for the URL Shortener application
 * Centralized routing management for consistent path usage throughout the app
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LANDING: '/',

  // Auth routes
  AUTH: '/auth',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PASSWORD_RESET: '/password-reset',
  EMAIL_VERIFICATION: '/verify-email',

  // Protected routes
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  LINKS: '/links',
  LINK_DETAIL: '/links/:id',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  ANALYTICS: '/analytics',

  // URL operations
  CREATE_LINK: '/create',
  EDIT_LINK: '/links/:id/edit',
  SHORTEN_URL: '/shorten',

  // Error routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
  SERVER_ERROR: '/500',

  // Catch all
  WILDCARD: '*',
} as const;

/**
 * Route path builders with parameter support
 * Use these functions to generate paths with dynamic segments
 */
export const buildRoute = {
  linkDetail: (id: string) => `/links/${id}`,
  editLink: (id: string) => `/links/${id}/edit`,
} as const;

/**
 * Public routes - accessible without authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.PASSWORD_RESET,
  ROUTES.EMAIL_VERIFICATION,
] as const;

/**
 * Protected routes - require authentication
 */
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.LINKS,
  ROUTES.LINK_DETAIL,
  ROUTES.CREATE_LINK,
  ROUTES.EDIT_LINK,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,
  ROUTES.ANALYTICS,
  ROUTES.SHORTEN_URL,
] as const;

/**
 * Navigation configurations with metadata
 */
export const NAVIGATION_CONFIG = {
  [ROUTES.HOME]: {
    label: 'Home',
    requiresAuth: false,
    showInNav: false,
  },
  [ROUTES.LOGIN]: {
    label: 'Login',
    requiresAuth: false,
    showInNav: false,
  },
  [ROUTES.SIGNUP]: {
    label: 'Sign Up',
    requiresAuth: false,
    showInNav: false,
  },
  [ROUTES.DASHBOARD]: {
    label: 'Dashboard',
    requiresAuth: true,
    showInNav: true,
  },
  [ROUTES.LINKS]: {
    label: 'My Links',
    requiresAuth: true,
    showInNav: true,
  },
  [ROUTES.CREATE_LINK]: {
    label: 'Create Link',
    requiresAuth: true,
    showInNav: true,
  },
  [ROUTES.ANALYTICS]: {
    label: 'Analytics',
    requiresAuth: true,
    showInNav: true,
  },
  [ROUTES.SETTINGS]: {
    label: 'Settings',
    requiresAuth: true,
    showInNav: true,
  },
  [ROUTES.PROFILE]: {
    label: 'Profile',
    requiresAuth: true,
    showInNav: false,
  },
} as const;

/**
 * Check if a route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => {
    // Handle dynamic routes like /links/:id
    const routePattern = route.replace(/:\w+/g, '\\w+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
  });
};

/**
 * Check if a route is public
 */
export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.includes(pathname as any);
};
