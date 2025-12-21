/* eslint-disable react-hooks/incompatible-library */
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

type SignUpValues = {
  email: string;
  password: string;
  confirm: string;
};

interface SignUpViaEmailProps {
  onSwitchMode?: (mode: 'login' | 'forgot') => void;
}

/**
 * Sign up form component with email, password, and confirm password fields
 * Includes password validation and mismatch detection
 * Integrates with Firebase authentication
 */
export function SignUpViaEmail({ onSwitchMode }: SignUpViaEmailProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    defaultValues: { email: '', password: '', confirm: '' },
  });

  const password = watch('password');
  const { signupWithEmail, isLoading } = useAuth();
  const { t } = useTranslation('auth');

  const onSubmit = async (values: SignUpValues) => {
    try {
      await signupWithEmail(values.email, values.password, values.confirm);
      showToast({
        type: 'success',
        message: t('signup.success', 'Account created successfully! Please verify your email.'),
      });
      onSwitchMode?.('login');
    } catch (error) {
      console.error('Signup error:', error);
      showToast({
        type: 'error',
        message: t('signup.error', 'Signup failed. Please try again.'),
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
          {t('signup.title', 'Create Account')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--text-secondary)',
            userSelect: 'none',
          }}
        >
          {t('signup.subtitle', 'Create your account to get started')}
        </Typography>
      </Box>

      {/* Email Field */}
      <TextField
        fullWidth
        label={t('signup.email_label', 'Email')}
        type="email"
        placeholder={t('signup.email_placeholder', 'you@example.com')}
        margin="normal"
        autoComplete="email"
        disabled={loading}
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register('email', {
          required: t('signup.email_required', 'Email is required'),
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: t('signup.email_invalid', 'Invalid email address'),
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
        label={t('signup.password_label', 'Password')}
        type="password"
        placeholder={t('signup.password_placeholder', 'Create a strong password')}
        margin="normal"
        autoComplete="new-password"
        disabled={loading}
        error={!!errors.password}
        helperText={errors.password?.message}
        {...register('password', {
          required: t('signup.password_required', 'Password is required'),
          minLength: {
            value: 6,
            message: t('signup.password_min_length', 'Password must be at least 6 characters'),
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

      {/* Confirm Password Field */}
      <TextField
        fullWidth
        label={t('signup.confirm_label', 'Confirm Password')}
        type="password"
        placeholder={t('signup.confirm_placeholder', 'Confirm your password')}
        margin="normal"
        autoComplete="new-password"
        disabled={loading}
        error={!!errors.confirm}
        helperText={errors.confirm?.message}
        {...register('confirm', {
          required: t('signup.confirm_required', 'Please confirm your password'),
          validate: (value) =>
            value === password || t('signup.password_mismatch', 'Passwords do not match'),
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
          {t('signup.to_login', 'Already have an account?')}
        </Button>
      </Box>

      {/* Sign Up Button */}
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
          t('signup.button', 'Create Account')
        )}
      </Button>
    </Box>
  );
}

export default SignUpViaEmail;
