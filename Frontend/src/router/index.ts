/**
 * Router module exports
 * Centralized access to all routing utilities
 */

export { ROUTES, PUBLIC_ROUTES, PROTECTED_ROUTES, buildRoute, NAVIGATION_CONFIG } from './routes';
export type { } from './routes';

export { ProtectedRoute } from './ProtectedRoute';
export { default as ProtectedRouteComponent } from './ProtectedRoute';

export { default as routeConfig } from './routeConfig';

export { isProtectedRoute, isPublicRoute } from './routes';
