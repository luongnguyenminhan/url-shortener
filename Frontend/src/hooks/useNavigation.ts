import { useNavigate as useReactNavigate } from 'react-router-dom';
import { ROUTES, buildRoute } from '../router/routes';

/**
 * Custom navigation hook
 * Provides type-safe navigation with predefined routes
 * Prevents routing errors from typos or missing paths
 *
 * SOLID Principles:
 * - Single Responsibility: Navigation logic only
 * - Open/Closed: Easy to extend with new routes
 * - Dependency Inversion: Depends on ROUTES constant
 */
export function useNavigation() {
  const navigate = useReactNavigate();

  const goHome = () => navigate(ROUTES.HOME);
  
  // Unified auth navigation - uses mode query parameter
  const goLogin = () => navigate(`${ROUTES.LOGIN}?mode=login`);
  const goSignup = () => navigate(`${ROUTES.LOGIN}?mode=signup`);
  const goPasswordReset = () => navigate(`${ROUTES.LOGIN}?mode=forgot`);
  
  const goEmailVerification = () => navigate(ROUTES.EMAIL_VERIFICATION);

  const goDashboard = () => navigate(ROUTES.DASHBOARD);
  const goLinks = () => navigate(ROUTES.LINKS);
  const goLinkDetail = (id: string) => navigate(buildRoute.linkDetail(id));
  const goCreateLink = () => navigate(ROUTES.CREATE_LINK);
  const goEditLink = (id: string) => navigate(buildRoute.editLink(id));
  const goAnalytics = () => navigate(ROUTES.ANALYTICS);
  const goSettings = () => navigate(ROUTES.SETTINGS);
  const goProfile = () => navigate(ROUTES.PROFILE);

  const goShortenUrl = () => navigate(ROUTES.SHORTEN_URL);
  const goNotFound = () => navigate(ROUTES.NOT_FOUND);
  const goServerError = () => navigate(ROUTES.SERVER_ERROR);

  // Go back to previous page
  const goBack = () => navigate(-1);

  return {
    // Public routes
    goHome,
    goLogin,
    goSignup,
    goPasswordReset,
    goEmailVerification,

    // Protected routes
    goDashboard,
    goLinks,
    goLinkDetail,
    goCreateLink,
    goEditLink,
    goAnalytics,
    goSettings,
    goProfile,

    // URL operations
    goShortenUrl,

    // Error routes
    goNotFound,
    goServerError,

    // Navigation controls
    goBack,

    // Raw navigate for custom navigation
    navigate,
  };
}

export default useNavigation;
