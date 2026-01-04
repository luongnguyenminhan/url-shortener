import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/common/ui';

interface HeroProps {
    onSignup?: () => void;
}

export function Hero({ onSignup }: HeroProps) {
    const { t } = useTranslation();

    return (
        <Box
            component="section"
            id="hero"
            sx={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                padding: { xs: 'var(--spacing-3xl) var(--spacing-lg)', md: 'var(--spacing-3xl) var(--spacing-lg)' },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-50%',
                    left: '-10%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none',
                },
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 'var(--spacing-2xl)',
                        padding: { xs: 'var(--spacing-2xl) 0', md: 'var(--spacing-3xl) 0' },
                    }}
                >
                    {/* Headline */}
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: 'var(--font-size-3xl)', md: 'var(--font-size-5xl)' },
                            fontWeight: 'var(--font-weight-bold)',
                            lineHeight: 'var(--line-height-tight)',
                            marginBottom: 'var(--spacing-md)',
                            color: '#ffffff',
                        }}
                    >
                        {t('hero.title')}
                    </Typography>

                    {/* Subheading */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontSize: { xs: 'var(--font-size-lg)', md: 'var(--font-size-xl)' },
                            fontWeight: 'var(--font-weight-normal)',
                            opacity: 0.9,
                            maxWidth: '600px',
                            lineHeight: 'var(--line-height-relaxed)',
                            color: 'rgba(255, 255, 255, 0.9)',
                        }}
                    >
                        {t('hero.subtitle')}
                    </Typography>

                    {/* CTA Button */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 'var(--spacing-md)',
                            flexDirection: { xs: 'column', sm: 'row' },
                            marginTop: 'var(--spacing-2xl)',
                        }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            onClick={onSignup}
                            sx={{
                                backgroundColor: '#ffffff',
                                color: '#1976d2',
                                border: '2px solid #ffffff',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderColor: '#ffffff',
                                },
                            }}
                        >
                            {t('hero.getStarted')}
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
                            {t('hero.learnMore')}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
