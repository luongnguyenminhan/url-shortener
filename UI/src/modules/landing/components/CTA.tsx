import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/common/ui';

interface CTAProps {
    onGetStarted?: () => void;
}

export function CTA({ onGetStarted }: CTAProps) {
    const { t } = useTranslation();

    return (
        <Box
            component="section"
            id="cta"
            sx={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                padding: { xs: 'var(--spacing-3xl) var(--spacing-lg)', md: 'var(--spacing-3xl) var(--spacing-lg)' },
                textAlign: 'center',
            }}
        >
            <Container maxWidth="md">
                <Typography
                    variant="h2"
                    sx={{
                        fontSize: { xs: 'var(--font-size-3xl)', md: 'var(--font-size-4xl)' },
                        fontWeight: 'var(--font-weight-bold)',
                        marginBottom: 'var(--spacing-md)',
                        color: '#ffffff',
                    }}
                >
                    {t('cta.title')}
                </Typography>

                <Typography
                    sx={{
                        fontSize: 'var(--font-size-lg)',
                        marginBottom: 'var(--spacing-2xl)',
                        opacity: 0.95,
                        lineHeight: 'var(--line-height-relaxed)',
                        color: '#ffffff',
                    }}
                >
                    {t('cta.description')}
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 'var(--spacing-md)',
                        justifyContent: 'center',
                        flexDirection: { xs: 'column', sm: 'row' },
                    }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        onClick={onGetStarted}
                        sx={{
                            backgroundColor: '#ffffff',
                            color: '#1976d2',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            },
                        }}
                    >
                        {t('cta.createAccount')}
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        href="#features"
                        sx={{
                            borderColor: '#ffffff',
                            color: '#ffffff',
                            '&:hover': {
                                borderColor: '#ffffff',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        {t('cta.learnMore')}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
