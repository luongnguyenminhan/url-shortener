import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type ForgotValues = {
  email: string;
};

interface ForgotPasswordFormProps {
  onSwitchMode?: (mode: 'login' | 'signup') => void;
}

/**
 * Forgot password form component (UI Only)
 */
export function ForgotPasswordForm({ onSwitchMode }: ForgotPasswordFormProps) {
  const [formData, setFormData] = useState<ForgotValues>({ email: '' });
  const [errors, setErrors] = useState<Partial<ForgotValues>>({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('auth');

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<ForgotValues> = {};

    if (!formData.email) {
      newErrors.email = t('forgot.email_required', 'Email is required');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('forgot.email_invalid', 'Invalid email address');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        console.log('Password reset requested for:', formData.email);
        setLoading(false);
        onSwitchMode?.('login');
      }, 1000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
    if (errors.email) {
      setErrors({ email: undefined });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
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
