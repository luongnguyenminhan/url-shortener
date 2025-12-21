import { useAuth } from '@/context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/hooks/useShowToast';

type ForgotValues = {
  email: string;
};

interface ForgotPasswordFormProps {
  onSwitchMode?: (mode: 'login' | 'signup') => void;
}

/**
 * Forgot password form component
 * Allows users to reset their password via email
 * Integrates with Firebase authentication
 */
export function ForgotPasswordForm({ onSwitchMode }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    defaultValues: { email: '' },
  });

  const { sendPasswordReset, isLoading } = useAuth();
  const { t } = useTranslation('auth');

  const onSubmit = async (values: ForgotValues) => {
    try {
      await sendPasswordReset(values.email);
      showToast({
        type: 'success',
        message: t('forgot.sent', 'Password reset link sent to your email!'),
      });
      onSwitchMode?.('login');
    } catch (error) {
      console.error('Password reset error:', error);
      showToast({
        type: 'error',
        message: t('forgot.error', 'Failed to send reset link. Please try again.'),
      });
    }
  };

  const loading = isLoading || isSubmitting;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      {/* Form Header */}
      <Box sx={{ mb: 3, textAlign: 'center', userSelect: 'none' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'var(--text-primary)',
            mb: 1,
            userSelect: 'none',
          }}
        >
          {t('forgot.title', 'Reset Password')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--text-secondary)',
            userSelect: 'none',
          }}
        >
          {t('forgot.subtitle', 'Reset your password securely')}
        </Typography>
      </Box>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: 'var(--text-secondary)',
          textAlign: 'center',
          mb: 2,
          userSelect: 'none',
        }}
      >
        {t(
          'forgot.description',
          'Enter your email address and we will send you a link to reset your password.'
        )}
      </Typography>

      {/* Email Field */}
      <TextField
        fullWidth
        label={t('forgot.email_label', 'Email')}
        type="email"
        placeholder={t('forgot.email_placeholder', 'you@example.com')}
        margin="normal"
        autoComplete="email"
        disabled={loading}
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register('email', {
          required: t('forgot.email_required', 'Email is required'),
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: t('forgot.email_invalid', 'Invalid email address'),
          },
        })}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            color: 'var(--text-primary)',
            '& fieldset': {
              borderColor: 'var(--border-primary)',
            },
            '&:hover fieldset': {
              borderColor: 'var(--text-primary)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--color-primary)',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'var(--text-secondary)',
            '&.Mui-focused': {
              color: 'var(--color-primary)',
            },
          },
          '& .MuiFormHelperText-root': {
            color: 'var(--color-error)',
          },
        }}
      />

      {/* Secondary Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mt: 2,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="text"
          size="small"
          onClick={() => onSwitchMode?.('login')}
          sx={{
            textTransform: 'none',
            color: 'var(--text-secondary)',
            '&:hover': {
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
            },
          }}
        >
          {t('forgot.to_login', 'Back to Login')}
        </Button>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          •
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={() => onSwitchMode?.('signup')}
          sx={{
            textTransform: 'none',
            color: 'var(--text-secondary)',
            '&:hover': {
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
            },
          }}
        >
          {t('forgot.to_signup', 'Create Account')}
        </Button>
      </Box>

      {/* Send Reset Button */}
      <Button
        fullWidth
        variant="contained"
        type="submit"
        disabled={loading}
        size="large"
        sx={{
          borderRadius: '8px',
          fontWeight: 700,
          py: 1.5,
          mt: 2,
          mb: 1,
          backgroundColor: 'var(--color-primary)',
          color: 'var(--text-inverse)',
          transition: 'all var(--transition-fast)',
          '&:hover': {
            backgroundColor: 'var(--color-primary-dark)',
            boxShadow: 'var(--shadow-md)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
          '&:disabled': {
            backgroundColor: 'var(--text-tertiary)',
            color: 'var(--text-secondary)',
            opacity: 0.6,
          },
        }}
      >
        {loading ? (
          <CircularProgress size={20} sx={{ color: 'white' }} />
        ) : (
          t('forgot.button', 'Send Reset Link')
        )}
      </Button>
    </Box>
  );
}

export default ForgotPasswordForm;
