import { useAuth } from '@/context/AuthContext';
import { Button, CircularProgress, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/hooks/useShowToast';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 32.912 29.184 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.151 7.961 3.039l5.657-5.657C34.875 6.053 29.7 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.483 16.041 18.879 12 24 12c3.059 0 5.842 1.151 7.961 3.039l5.657-5.657C34.875 6.053 29.7 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.114 0 9.728-1.958 13.243-5.154l-6.104-4.966C29.094 35.292 26.671 36 24 36c-5.164 0-9.57-3.07-11.292-7.435l-6.54 5.04C9.49 39.556 16.23 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.307 3.071-3.63 5.565-6.36 7.118.005-.003 12.056 8.756 12.056 8.756C42.307 40.889 44 35.724 44 30c0-1.341-.138-2.651-.389-3.917z" />
  </svg>
);

interface GoogleSignInButtonProps {
  disabled?: boolean;
}

/**
 * Google Sign-in button component
 * Handles Google OAuth authentication
 * Enhanced contrast and accessibility
 */
export function GoogleSignInButton({ disabled = false }: GoogleSignInButtonProps) {
  const { loginWithGoogle, isLoading } = useAuth();
  const { t } = useTranslation('auth');

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      showToast('success', t('common.google_login_success', 'Signed in with Google!'));
    } catch (error) {
      console.error('Google sign-in error:', error);
      showToast('error', t('common.google_login_error', 'Failed to sign in with Google.'));
    }
  };

  const loading = isLoading || disabled;

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleGoogleSignIn}
      disabled={loading}
      size="large"
      startIcon={loading ? undefined : <GoogleIcon />}
      sx={{
        borderRadius: '8px',
        borderColor: 'var(--text-primary)',
        borderWidth: '1.5px',
        color: 'var(--text-primary)',
        fontWeight: 700,
        py: 1.5,
        backgroundColor: 'var(--bg-primary)',
        border: '1.5px solid var(--text-primary)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--text-primary)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
        '&:disabled': {
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--text-disabled)',
          color: 'var(--text-disabled)',
          opacity: 0.6,
        },
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} sx={{ color: 'var(--text-primary)' }} />
        </Box>
      ) : (
        t('common.google_button', 'Continue with Google')
      )}
    </Button>
  );
}

export default GoogleSignInButton;
