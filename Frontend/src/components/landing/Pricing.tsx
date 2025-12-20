import { Box, Container, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Card } from '../common/ui';
import { Button } from '../common/ui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PricingProps {
    onSelectPlan?: (plan: 'free' | 'paid') => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
    const { t } = useTranslation();

    const plans = [
        {
            name: t('pricing.free.name'),
            price: t('pricing.free.price'),
            period: t('pricing.free.period'),
            description: t('pricing.free.description'),
            features: [
                t('pricing.free.features.urls'),
                t('pricing.free.features.analytics'),
                t('pricing.free.features.support'),
                t('pricing.free.features.branding'),
            ],
            cta: t('pricing.free.cta'),
            highlighted: false,
        },
        {
            name: t('pricing.premium.name'),
            price: t('pricing.premium.price'),
            period: t('pricing.premium.period'),
            description: t('pricing.premium.description'),
            features: [
                t('pricing.premium.features.unlimited'),
                t('pricing.premium.features.analytics'),
                t('pricing.premium.features.support'),
                t('pricing.premium.features.branding'),
                t('pricing.premium.features.api'),
                t('pricing.premium.features.team'),
            ],
            cta: t('pricing.premium.cta'),
            highlighted: true,
        },
    ];

    return (
        <Box
            component="section"
            id="pricing"
            sx={{
                padding: { xs: 'var(--spacing-3xl) var(--spacing-lg)', md: 'var(--spacing-3xl) var(--spacing-lg)' },
                backgroundColor: 'var(--bg-primary)',
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
                        {t('pricing.title')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 'var(--font-size-lg)',
                            color: 'var(--text-secondary)',
                            maxWidth: '600px',
                            margin: '0 auto',
                        }}
                    >
                        {t('pricing.subtitle')}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        gap: 3,
                        justifyItems: 'center',
                        maxWidth: '900px',
                        margin: '0 auto',
                        padding: { xs: 0, sm: '0 var(--spacing-lg)' },
                    }}
                >
                    {plans.map((plan, index) => (
                        <Box key={index} sx={{ width: '100%', maxWidth: '380px' }}>
                            <Card
                                variant={plan.highlighted ? 'elevation' : 'outlined'}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
                                    borderColor: plan.highlighted ? 'var(--color-primary)' : 'var(--border-primary)',
                                    borderWidth: plan.highlighted ? '3px' : '1px',
                                    position: 'relative',
                                    transition: 'all var(--transition-normal)',
                                    overflow: plan.highlighted ? 'visible' : 'hidden',
                                    backgroundColor: plan.highlighted ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                                    boxShadow: plan.highlighted
                                        ? 'var(--shadow-lg)'
                                        : 'var(--shadow-sm)',
                                    '&:hover': {
                                        transform: plan.highlighted ? 'scale(1.08)' : 'scale(1.02)',
                                        boxShadow: plan.highlighted
                                            ? 'var(--shadow-xl)'
                                            : 'var(--shadow-md)',
                                    },
                                }}
                            >
                                {plan.highlighted && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '-14px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'var(--text-inverse)',
                                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 'var(--font-weight-bold)',
                                            zIndex: 10,
                                            border: '2px solid var(--bg-primary)',
                                        }}
                                    >
                                        {t('pricing.mostPopular')}
                                    </Box>
                                )}

                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 'var(--font-weight-bold)',
                                            marginBottom: 'var(--spacing-sm)',
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        {plan.name}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: 'var(--text-secondary)',
                                            marginBottom: 'var(--spacing-lg)',
                                            fontSize: 'var(--font-size-sm)',
                                        }}
                                    >
                                        {plan.description}
                                    </Typography>

                                    <Box sx={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <Typography
                                            sx={{
                                                fontSize: 'var(--font-size-4xl)',
                                                fontWeight: 'var(--font-weight-bold)',
                                                color: plan.highlighted ? 'var(--color-primary)' : 'var(--text-primary)',
                                            }}
                                        >
                                            {plan.price}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            {plan.period}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant={plan.highlighted ? 'contained' : 'outlined'}
                                        fullWidth
                                        onClick={() => onSelectPlan?.(index === 0 ? 'free' : 'paid')}
                                        sx={{ marginBottom: 'var(--spacing-lg)' }}
                                    >
                                        {plan.cta}
                                    </Button>

                                    <List sx={{ gap: 'var(--spacing-md)', display: 'flex', flexDirection: 'column' }}>
                                        {plan.features.map((feature, idx) => (
                                            <ListItem
                                                key={idx}
                                                sx={{
                                                    padding: 0,
                                                    gap: 'var(--spacing-md)',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: '24px', color: 'var(--color-success)', marginTop: '2px' }}>
                                                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={feature}
                                                    sx={{
                                                        '& .MuiListItemText-primary': {
                                                            color: 'var(--text-secondary)',
                                                            fontSize: 'var(--font-size-sm)',
                                                        },
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Card>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
