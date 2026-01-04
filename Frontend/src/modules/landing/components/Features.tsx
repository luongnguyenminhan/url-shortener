import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditIcon from '@mui/icons-material/Edit';
import { Card } from '../../../components/common/ui';

export function Features() {
    const { t } = useTranslation();

    const features = [
        {
            icon: <PhotoLibraryIcon sx={{ fontSize: 48, color: 'var(--color-primary)' }} />,
            title: t('features.workflow.title'),
            description: t('features.workflow.description'),
        },
        {
            icon: <RateReviewIcon sx={{ fontSize: 48, color: 'var(--color-primary)' }} />,
            title: t('features.review.title'),
            description: t('features.review.description'),
        },
        {
            icon: <EditIcon sx={{ fontSize: 48, color: 'var(--color-primary)' }} />,
            title: t('features.versionControl.title'),
            description: t('features.versionControl.description'),
        },
    ];

    return (
        <Box
            component="section"
            id="features"
            sx={{
                padding: { xs: 'var(--spacing-3xl) var(--spacing-lg)', md: 'var(--spacing-3xl) var(--spacing-lg)' },
                backgroundColor: 'var(--bg-secondary)',
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: 'var(--font-size-3xl)', md: 'var(--font-size-4xl)' },
                            fontWeight: 'var(--font-weight-bold)',
                            marginBottom: 'var(--spacing-md)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {t('features.title')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 'var(--font-size-lg)',
                            color: 'var(--text-secondary)',
                            maxWidth: '600px',
                            margin: '0 auto',
                        }}
                    >
                        {t('features.subtitle')}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                        gap: 3,
                    }}
                >
                    {features.map((feature, index) => (
                        <Box key={index}>
                            <Card
                                variant="outlined"
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    height: '100%',
                                }}
                            >
                                <Box sx={{ marginBottom: 'var(--spacing-lg)' }}>{feature.icon}</Box>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 'var(--font-weight-bold)',
                                        marginBottom: 'var(--spacing-md)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {feature.title}
                                </Typography>
                                <Typography sx={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                                    {feature.description}
                                </Typography>
                            </Card>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
