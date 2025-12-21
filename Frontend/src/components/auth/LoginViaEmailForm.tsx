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

type LoginFormValues = {
  email: string;
  password: string;
};

interface LoginViaEmailFormProps {
  onSwitchMode?: (mode: 'signup' | 'forgot') => void;
}

/**
 * Login form component with email and password fields
 * Uses react-hook-form for validation
 * Integrates with Firebase authentication
 */
export function LoginViaEmailForm({ onSwitchMode }: LoginViaEmailFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  });

  const { loginWithEmail, isLoading } = useAuth();
  const { t } = useTranslation('auth');

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginWithEmail(data.email, data.password);
      showToast({
        type: 'success',
        message: t('login.success', 'Login successful!'),
      });
    } catch (error) {
      console.error('Login error:', error);
      showToast({
        type: 'error',
        message: t('login.error', 'Login failed. Please try again.'),
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
          {t('login.title')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--text-secondary)',
            userSelect: 'none',
          }}
        >
          {t('login.subtitle', 'Enter your credentials to access your account')}
        </Typography>
      </Box>

      {/* Email Field */}
      <TextField
        fullWidth
        label={t('login.email_label', 'Email')}
        type="email"
        placeholder={t('login.email_placeholder', 'you@example.com')}
        margin="normal"
        autoComplete="email"
        disabled={loading}
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register('email', {
          required: t('login.email_required', 'Email is required'),
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: t('login.email_invalid', 'Invalid email address'),
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

      {/* Password Field */}
      <TextField
        fullWidth
        label={t('login.password_label', 'Password')}
        type="password"
        placeholder={t('login.password_placeholder', 'Enter your password')}
        margin="normal"
        autoComplete="current-password"
        disabled={loading}
        error={!!errors.password}
        helperText={errors.password?.message}
        {...register('password', {
          required: t('login.password_required', 'Password is required'),
          minLength: {
            value: 6,
            message: t('login.password_min_length', 'Password must be at least 6 characters'),
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
          onClick={() => onSwitchMode?.('forgot')}
          sx={{
            textTransform: 'none',
            color: 'var(--text-secondary)',
            '&:hover': {
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
            },
          }}
        >
          {t('login.to_forgot', 'Forgot Password?')}
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
          {t('login.to_signup', 'Create Account')}
        </Button>
      </Box>

      {/* Login Button */}
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
          t('login.button', 'Sign In')
        )}
      </Button>
    </Box>
  );
}

export default LoginViaEmailForm;
