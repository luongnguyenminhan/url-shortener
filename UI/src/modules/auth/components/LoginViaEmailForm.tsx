import { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type LoginFormValues = {
    email: string;
    password: string;
};

interface LoginViaEmailFormProps {
    onSwitchMode?: (mode: 'signup' | 'forgot') => void;
}

/**
 * Login form component with email and password fields (UI Only)
 */
export function LoginViaEmailForm({ onSwitchMode }: LoginViaEmailFormProps) {
    const [formData, setFormData] = useState<LoginFormValues>({ email: '', password: '' });
    const [errors, setErrors] = useState<Partial<LoginFormValues>>({});
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation('auth');

    const validateEmail = (email: string) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Partial<LoginFormValues> = {};

        if (!formData.email) {
            newErrors.email = t('login.email_required', 'Email is required');
        } else if (!validateEmail(formData.email)) {
            newErrors.email = t('login.email_invalid', 'Invalid email address');
        }

        if (!formData.password) {
            newErrors.password = t('login.password_required', 'Password is required');
        } else if (formData.password.length < 6) {
            newErrors.password = t('login.password_min_length', 'Password must be at least 6 characters');
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                console.log('Login submitted:', formData);
                setLoading(false);
            }, 1000);
        }
    };

    const handleChange = (field: keyof LoginFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
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
                    {t('login.title', 'Sign In')}
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
                value={formData.email}
                onChange={handleChange('email')}
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

            {/* Password Field */}
            <TextField
                fullWidth
                label={t('login.password_label', 'Password')}
                type="password"
                placeholder={t('login.password_placeholder', 'Enter your password')}
                margin="normal"
                autoComplete="current-password"
                disabled={loading}
                value={formData.password}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password}
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
