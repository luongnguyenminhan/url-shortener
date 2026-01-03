import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginViaEmailForm from './LoginViaEmailForm';
import SignUpViaEmail from './SignUpViaEmail';
import ForgotPasswordForm from './ForgotPasswordForm';
import GoogleSignInButton from './GoogleSignInButton';
import { Box, Divider, Typography } from '@mui/material';

type AuthMode = 'login' | 'signup' | 'forgot';

interface DynamicFormContentProps {
  initialMode?: AuthMode;
}

/**
 * Dynamic form content component (UI Only)
 * Manages switching between login, signup, and forgot password forms
 */
export function DynamicFormContent({ initialMode = 'login' }: DynamicFormContentProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { t } = useTranslation('auth');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Render form based on current mode */}
      {mode === 'login' && (
        <LoginViaEmailForm
          onSwitchMode={(newMode: AuthMode) => setMode(newMode)}
        />
      )}
      {mode === 'signup' && (
        <SignUpViaEmail
          onSwitchMode={(newMode: AuthMode) => setMode(newMode)}
        />
      )}
      {mode === 'forgot' && (
        <ForgotPasswordForm
          onSwitchMode={(newMode: AuthMode) => setMode(newMode)}
        />
      )}

      {/* Divider with "OR" text */}
      <Box sx={{ my: 2 }}>
        <Divider>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            {t('or', 'OR')}
          </Typography>
        </Divider>
      </Box>

      {/* Google Sign-in Button */}
      <GoogleSignInButton />
    </Box>
  );
}

export default DynamicFormContent;
