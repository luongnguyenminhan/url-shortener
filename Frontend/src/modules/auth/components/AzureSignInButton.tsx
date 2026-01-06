import { Box, Button, CircularProgress } from '@mui/material';
import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast } from '../../../hooks/useShowToast';
import { auth, azureProvider } from '../../../utils/firebaseConfig';

const AzureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 242" width="24" height="24" style={{opacity:1}}><defs><linearGradient id="SVGvyHrkO0J" x1="58.972%" x2="37.191%" y1="7.411%" y2="103.762%"><stop offset="0%" stopColor="#114A8B"/><stop offset="100%" stopColor="#0669BC"/></linearGradient><linearGradient id="SVGifIODcVR" x1="59.719%" x2="52.691%" y1="52.313%" y2="54.864%"><stop offset="0%" stopOpacity=".3"/><stop offset="7.1%" stopOpacity=".2"/><stop offset="32.1%" stopOpacity=".1"/><stop offset="62.3%" stopOpacity=".05"/><stop offset="100%" stopOpacity="0"/></linearGradient><linearGradient id="SVGkT5F7b2l" x1="37.279%" x2="62.473%" y1="4.6%" y2="99.979%"><stop offset="0%" stopColor="#3CCBF4"/><stop offset="100%" stopColor="#2892DF"/></linearGradient></defs><path fill="url(#SVGvyHrkO0J)" d="M85.343.003h75.753L82.457 233a12.08 12.08 0 0 1-11.442 8.216H12.06A12.06 12.06 0 0 1 .633 225.303L73.898 8.219A12.08 12.08 0 0 1 85.343 0z"/><path fill="#0078D4" d="M195.423 156.282H75.297a5.56 5.56 0 0 0-3.796 9.627l77.19 72.047a12.14 12.14 0 0 0 8.28 3.26h68.02z"/><path fill="url(#SVGifIODcVR)" d="M85.343.003a11.98 11.98 0 0 0-11.471 8.376L.723 225.105a12.045 12.045 0 0 0 11.37 16.112h60.475a12.93 12.93 0 0 0 9.921-8.437l14.588-42.991l52.105 48.6a12.33 12.33 0 0 0 7.757 2.828h67.766l-29.721-84.935l-86.643.02L161.37.003z"/><path fill="url(#SVGkT5F7b2l)" d="M182.098 8.207A12.06 12.06 0 0 0 170.67.003H86.245c5.175 0 9.773 3.301 11.428 8.204L170.94 225.3a12.062 12.062 0 0 1-11.428 15.92h84.429a12.062 12.062 0 0 0 11.425-15.92z"/></svg>
);

interface AzureSignInButtonProps {
  disabled?: boolean;
}

/**
 * Azure Sign-in button component (UI Only)
 */
export function AzureSignInButton({ disabled = false }: AzureSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('auth');

  const handleAzureSignIn = async () => {
    if (!auth || !azureProvider) {
      console.error('Firebase not initialized');
      return;
    }

    setLoading(true);
    try {
      azureProvider.addScope('profile');
      azureProvider.addScope('email');
      azureProvider.addScope('User.Read');      // required for basic profile
      azureProvider.addScope('Files.ReadWrite');   // for OneDrive file access
      azureProvider.addScope('offline_access');    // for refresh token request
      
      const result = await signInWithPopup(auth, azureProvider);

      // 🔥 LẤY OAUTH CREDENTIAL - ĐÂY LÀ CHỖ ĐÚNG!
      const credential = OAuthProvider.credentialFromResult(result);

      if (!credential) {
        throw new Error('No OAuth credential returned from Azure');
      }

      const microsoftAccessToken = credential.accessToken;
      const microsoftIdToken = credential.idToken;

      // Firebase ID token (dùng cho backend của bạn)
      const firebaseIdToken = await result.user.getIdToken();

      console.log('✅ Microsoft Access Token (dùng cho Graph API):', microsoftAccessToken);
      console.log('✅ Microsoft ID Token:', microsoftIdToken);
      console.log('✅ Firebase ID Token (dùng cho backend):', firebaseIdToken);

      showSuccessToast('Azure Sign-In success!');
      // TODO: Call API to verify token and login, pass firebaseIdToken to backend
    } catch (error) {
      console.error('Azure Sign-In Error:', error);
      showErrorToast(`Azure Sign-In failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || disabled;

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleAzureSignIn}
      disabled={isLoading}
      size="large"
      startIcon={isLoading ? undefined : <AzureIcon />}
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
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} sx={{ color: 'var(--text-primary)' }} />
        </Box>
      ) : (
        t('common.azure_button', 'Continue with Azure')
      )}
    </Button>
  );
}

export default AzureSignInButton;