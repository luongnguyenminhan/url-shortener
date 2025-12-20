import { Box, Container, Typography } from '@mui/material';
import { Card } from '../common/ui';
import LinkIcon from '@mui/icons-material/Link';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';

export function Features() {
    const features = [
        {
            icon: <LinkIcon sx={{ fontSize: 48, color: 'var(--color-primary)' }} />,
            title: 'Custom Short URLs',
            description: 'Create memorable, branded short links that reflect your identity. Perfect for marketing campaigns and social media.',
        },
        {
            icon: <AnalyticsIcon sx={{ fontSize: 48, color: 'var(--color-primary)' }} />,
            title: 'Real-time Analytics',
            description: 'Track clicks, geographic location, device type, and referrer sources. Make data-driven decisions instantly.',
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 48, color: 'var(--color-primary)' }} />,
            title: 'Enterprise Security',
            description: 'Bank-level encryption, HTTPS support, and compliance standards. Your data is always protected and secure.',
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
                        Powerful Features
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 'var(--font-size-lg)',
                            color: 'var(--text-secondary)',
                            maxWidth: '600px',
                            margin: '0 auto',
                        }}
                    >
                        Everything you need to create, manage, and analyze your short links
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
